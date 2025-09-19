from flask import Blueprint, jsonify, redirect, request, session


from ..services import persona_service , community_service
import os
import csv
import math
import time
import json as _json
import requests


api_bp = Blueprint('api', __name__)

# ---------- Paths ----------
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REPO_ROOT = os.path.dirname(BACKEND_DIR)
PUBLIC_DIR = os.path.join(REPO_ROOT, 'map-app', 'public')
SEOUL_DATA_DIR = os.path.join(PUBLIC_DIR, 'seoul_data')
ROUTE_PLANS_DIR = os.path.join(REPO_ROOT, 'backend', 'data', 'route_plans')

def _ensure_dir(path: str):
    try:
        os.makedirs(path, exist_ok=True)
    except Exception:
        pass

def _gen_share_id() -> str:
    try:
        ts = int(time.time() * 1000)
        rnd = os.urandom(3).hex()
        return f"{ts:x}{rnd}"
    except Exception:
        return str(int(time.time()))

@api_bp.route('/health', methods=['GET'])
def health():
    """간단한 헬스체크: 환경 기반 포트/호스트와 간단 상태를 반환."""
    return jsonify({
        'status': 'ok',
        'backend_host': os.environ.get('BACKEND_HOST', '127.0.0.1'),
        'backend_port': os.environ.get('BACKEND_PORT') or os.environ.get('PORT', '5001'),
        'cwd': os.getcwd(),
    })


# ---------- Helpers for local CSV aggregation ----------
_PLACES_CACHE = { 'mtime': 0.0, 'items': [] }

def _pick(o, keys):
    for k in keys:
        v = o.get(k)
        if v is None:
            continue
        s = str(v).strip()
        if s != '':
            return v
    return None

def _normalize_row(row: dict, idx: int, src: str):
    name = _pick(row, ['name', 'Name', 'title', 'name_ko']) or f"place-{src}-{idx}"
    try:
        lat = float(_pick(row, ['lat', 'LAT', 'Lat', 'latitude', 'Latitude', 'Y', 'y']))
        lng = float(_pick(row, ['lon', 'LON', 'Lon', 'lng', 'LNG', 'Longitude', 'longitude', 'X', 'x']))
    except Exception:
        return None
    addr = _pick(row, ['address', 'addr', 'road_address', 'address_ko']) or ''
    cat = _pick(row, ['category', 'cat', 'category_ko']) or ''
    desc = str(_pick(row, ['desc', 'description', 'rag_seed_text_ko']) or '')
    return {
        'id': f"{src}-{idx}",
        'name': str(name),
        'lat': lat,
        'lng': lng,
        'addr': str(addr),
        'category': str(cat),
        'desc': desc,
    }

def _parse_csv(file_path: str, src_label: str):
    try:
        stat = os.stat(file_path)
        # Try utf-8-sig then cp949
        for enc in ('utf-8-sig', 'utf-8', 'cp949'):
            try:
                with open(file_path, 'r', encoding=enc, newline='') as f:
                    reader = csv.DictReader(f)
                    out = []
                    i = 0
                    for row in reader:
                        i += 1
                        n = _normalize_row(row, i, src_label)
                        if n:
                            out.append(n)
                    return { 'items': out, 'mtime': stat.st_mtime }
            except Exception:
                continue
        return { 'items': [], 'mtime': 0 }
    except Exception:
        return { 'items': [], 'mtime': 0 }

def _load_all_places():
    try:
        latest_mtime = _PLACES_CACHE['mtime']
        aggregated = []
        if os.path.isdir(SEOUL_DATA_DIR):
            for fname in os.listdir(SEOUL_DATA_DIR):
                if not fname.lower().endswith('.csv'):
                    continue
                path = os.path.join(SEOUL_DATA_DIR, fname)
                parsed = _parse_csv(path, fname)
                aggregated.extend(parsed['items'])
                if parsed['mtime'] > latest_mtime:
                    latest_mtime = parsed['mtime']
        if aggregated:
            _PLACES_CACHE['items'] = aggregated
            _PLACES_CACHE['mtime'] = latest_mtime
            return aggregated
        return _PLACES_CACHE.get('items') or []
    except Exception:
        return _PLACES_CACHE.get('items') or []


# ---------- Persona helpers (route builder) ----------
def _haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    to_rad = lambda d: (d * math.pi) / 180.0
    dLat = to_rad(lat2 - lat1)
    dLon = to_rad(lon2 - lon1)
    a = math.sin(dLat / 2) ** 2 + math.cos(to_rad(lat1)) * math.cos(to_rad(lat2)) * math.sin(dLon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def _extract_category(item):
    text = f"{item.get('name','')} {item.get('addr','')} {item.get('category','')} {item.get('desc','')}".lower()
    def has(*keys):
        return any(k in text for k in keys)
    if has('박물관', '미술관', '전시', 'heritage', '문화'): return 'culture'
    if has('맛집', '음식', '식당', 'food', 'restaurant', '카페', '미식'): return 'food'
    if has('공원', '자연', '숲', '강', '호수', '피크닉', '휴양', '걷기'): return 'nature'
    if has('쇼핑', '시장', '백화점', 'shopping', 'market'): return 'shopping'
    if has('체험', '모험', '액티비티', '익사이팅'): return 'adventure'
    if has('스파', '호텔', '리조트', '럭셔리', '프리미엄'): return 'luxury'
    return 'general'

def _score_by_persona(persona: str, item: dict):
    cat = _extract_category(item)
    text = f"{item.get('name','')} {item.get('addr','')} {item.get('category','')} {item.get('desc','')}".lower()
    def anykey(*keys):
        return any(k in text for k in keys)
    if persona == '미식가':
        return (4 if cat == 'food' else 0) + (1 if anykey('맛집', '전통', '한옥', '음식') else 0)
    if persona == '문화 체험가':
        return (4 if cat == 'culture' else 0) + (1 if anykey('전통', '한옥') else 0)
    if persona == '자연 힐링형':
        return (4 if cat == 'nature' else 0) + (1 if anykey('산책', '휴양', '힐링') else 0)
    if persona == '액티브 모험가':
        return (4 if cat == 'adventure' else 0) + (1 if anykey('야외', '체험') else 0)
    if persona == '럭셔리 트래블러':
        return (4 if cat == 'luxury' else 0) + (1 if anykey('럭셔리', '프리미엄') else 0)
    return 1 if anykey('명소', '관광', '추천') else 0

def _build_route(persona='문화 체험가', maxStops=6, maxLegKm=20.0, origin=None, preferDiversity=True):
    all_items = _load_all_places()
    if not all_items:
        return []
    enriched = []
    for it in all_items:
        e = dict(it)
        e['derived_category'] = _extract_category(it)
        e['_score'] = _score_by_persona(persona, it)
        enriched.append(e)
    top = [x for x in enriched if x['_score'] > 0]
    pool = top if top else enriched

    seed = None
    if origin and isinstance(origin, dict):
        try:
            olat = float(origin.get('lat'))
            olng = float(origin.get('lng'))
            seed = sorted(({'x':x, 'd': _haversine(olat, olng, x['lat'], x['lng'])} for x in pool), key=lambda a: a['d'])[0]['x']
        except Exception:
            seed = None
    if seed is None:
        topN = sorted(pool, key=lambda a: a['_score'], reverse=True)[:50]
        if topN:
            avgLat = sum(x['lat'] for x in topN)/len(topN)
            avgLng = sum(x['lng'] for x in topN)/len(topN)
            seed = sorted(topN, key=lambda a: _haversine(avgLat, avgLng, a['lat'], a['lng']))[0]
        else:
            seed = pool[0]

    route = []
    used = set()
    current = seed
    if not current:
        return []
    route.append(current)
    used.add(current['id'])
    while len(route) < max(3, int(maxStops)):
        candidates = [{ 'x': x, 'd': _haversine(current['lat'], current['lng'], x['lat'], x['lng']) } for x in pool if x['id'] not in used]
        within = [c for c in candidates if c['d'] <= max(3.0, float(maxLegKm))]
        def diversity_penalty(cat):
            if not preferDiversity:
                return 0
            lastCat = route[-1]['derived_category'] if route else None
            return 1.5 if lastCat and cat == lastCat else 0
        considered = within if within else candidates
        if not considered:
            break
        best = sorted(({
            **c,
            'score': c['x']['_score'] - diversity_penalty(c['x']['derived_category']) - (c['d'] / max(1.0, float(maxLegKm)))
        } for c in considered), key=lambda a: a['score'], reverse=True)[0]
        nxt = best['x']
        route.append(nxt)
        used.add(nxt['id'])
        current = nxt

    out = []
    for idx, p in enumerate(route):
        prev = route[idx-1] if idx>0 else None
        km = _haversine(prev['lat'], prev['lng'], p['lat'], p['lng']) if prev else 0.0
        minutes = int(round((km / 20.0) * 60)) if km else 0
        e = dict(p)
        e['approx_leg_km'] = km
        e['approx_leg_minutes'] = minutes
        out.append(e)
    return out

#페르소나 분석에 필요한 질문 목록을 반환하는 API
@api_bp.route('/persona/questions', methods=['GET'])
def get_questions():
    # 실제 질문을 로드하는 작업은 persona_service에게 위임합니다.
    questions = persona_service.load_questions()
    return jsonify(questions)


#사용자의 답변을 받아 페르소나를 분석하고 결과를 반환하는 API
@api_bp.route('/persona/analyze', methods=['POST'])
def analyze(): 
    # 1. 프론트엔드에서 보낸 JSON 데이터를 받습니다.
    payload = request.get_json(force=True, silent=True) or {}
    answers = payload.get('answers') or {}

    # 2. 실제 분석 작업은 persona_service에게 위임합니다.
    result = persona_service.analyze_persona(answers)

    # 3. 받은 결과를 JSON 형태로 프론트엔드에 전달합니다.
    return jsonify(result)


# ---------- Additional endpoints to mirror CRA dev server ----------

@api_bp.route('/seoul-data', methods=['GET'])
def seoul_data():
    all_items = _load_all_places()
    q = str(request.args.get('q', '')).strip().lower()
    if q:
        limited = [x for x in all_items if q in (x.get('name','').lower() + ' ' + x.get('addr','').lower())][:50]
    else:
        limited = all_items[:500]
    return jsonify({ 'count': len(all_items), 'items': limited })


@api_bp.route('/persona/route', methods=['POST'])
def persona_route():
    try:
        body = request.get_json(silent=True) or {}
        persona = str(body.get('persona_type') or body.get('persona') or '문화 체험가')
        maxStops = max(3, min(8, int(body.get('maxStops') or 6)))
        maxLegKm = max(3.0, min(30.0, float(body.get('maxLegKm') or 20)))
        origin = body.get('origin') if isinstance(body.get('origin'), dict) else None
        preferDiversity = False if body.get('preferDiversity') is False else True
        items = _build_route(persona=persona, maxStops=maxStops, maxLegKm=maxLegKm, origin=origin, preferDiversity=preferDiversity)
        return jsonify({ 'count': len(items), 'items': items })
    except Exception:
        return jsonify({ 'error': 'route_build_failed' }), 500


@api_bp.route('/translate', methods=['GET'])
def translate():
    # Echo if missing keys or no texts
    key = os.getenv('AZURE_TRANSLATOR_KEY') or os.getenv('REACT_APP_AZURE_TRANSLATOR_KEY')
    region = os.getenv('AZURE_TRANSLATOR_REGION') or os.getenv('REACT_APP_AZURE_TRANSLATOR_REGION')
    endpoint = os.getenv('AZURE_TRANSLATOR_ENDPOINT') or os.getenv('REACT_APP_AZURE_TRANSLATOR_ENDPOINT') or 'https://api.cognitive.microsofttranslator.com'
    to = request.args.get('to', 'en')
    texts = request.args.getlist('text')
    if not texts:
        t = request.args.get('text')
        if t:
            texts = [t]
    if not key or not region or not texts:
        return jsonify({ 'texts': texts })
    try:
        url = f"{endpoint}/translate?api-version=3.0&to={to}"
        body = [{ 'Text': str(t or '') } for t in texts]
        r = requests.post(url, headers={
            'Ocp-Apim-Subscription-Key': key,
            'Ocp-Apim-Subscription-Region': region,
            'Content-Type': 'application/json',
        }, data=_json.dumps(body), timeout=10)
        j = r.json()
        if r.status_code >= 400:
            return jsonify({ 'error': (j.get('error') or {}).get('message') or 'translator error' }), 500
        out = [ (x.get('translations') or [{}])[0].get('text') or '' for x in j ]
        return jsonify({ 'texts': out })
    except Exception:
        return jsonify({ 'error': 'translate_failed' }), 500


@api_bp.route('/kakao-waypoints', methods=['POST'])
def kakao_waypoints():
    key = os.getenv('KAKAO_REST_API_KEY') or os.getenv('REACT_APP_KAKAO_API_KEY')
    if not key:
        return jsonify({ 'result_code': 'NO_API_KEY', 'result_msg': 'Kakao REST API key is missing' }), 400
    try:
        payload = request.get_json(silent=True) or {}
        url = 'https://apis-navi.kakaomobility.com/v1/waypoints/directions'
        r = requests.post(url, headers={
            'Authorization': f'KakaoAK {key}',
            'Content-Type': 'application/json',
        }, data=_json.dumps(payload), timeout=15)
        # Pass through JSON and status
        try:
            data = r.json()
        except Exception:
            data = { 'error': 'invalid_json' }
        return jsonify(data), r.status_code
    except Exception:
        return jsonify({ 'result_code': 'REQUEST_FAILED', 'result_msg': 'Failed to request Kakao API' }), 500


def _naver_headers():
    cid = os.getenv('NAVER_MAPS_API_KEY_ID') or os.getenv('NAVER_CLIENT_ID') or os.getenv('NAVER_MAPS_CLIENT_ID')
    csec = os.getenv('NAVER_MAPS_API_KEY') or os.getenv('NAVER_CLIENT_SECRET') or os.getenv('NAVER_MAPS_CLIENT_SECRET')
    if not cid or not csec:
        return None
    return {
        'X-NCP-APIGW-API-KEY-ID': cid,
        'X-NCP-APIGW-API-KEY': csec,
    }


def _naver_parse_route(j):
    try:
        route = j.get('route') or {}
        if not route:
            return None
        # pick best available route list (prefer walking when present)
        keys = list(route.keys())
        key = 'trawalk' if 'trawalk' in keys else ('traoptimal' if 'traoptimal' in keys else (keys[0] if keys else None))
        if not key:
            return None
        arr = route.get(key) or []
        if not arr:
            return None
        r0 = arr[0]
        summ = (r0.get('summary') or {})
        distance = int(summ.get('distance') or 0)
        duration = int(summ.get('duration') or 0)
        path = r0.get('path') or []  # [[x,y], ...]
        return {
            'summary': { 'distance': distance, 'duration': duration },
            'path': path,
        }
    except Exception:
        return None


def _naver_leg(mode: str, start_xy: tuple, end_xy: tuple, timeout=10):
    headers = _naver_headers()
    if not headers:
        return None, 'NO_NAVER_KEY'
    sx, sy = start_xy
    gx, gy = end_xy
    # Try a series of endpoints depending on mode
    candidates = []
    if mode == 'walking':
        candidates = [
            f'https://naveropenapi.apigw.ntruss.com/map-direction/v1/walking?start={sx},{sy}&goal={gx},{gy}&lang=ko',
            f'https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start={sx},{sy}&goal={gx},{gy}&option=pedestrian&lang=ko',
        ]
    elif mode == 'transit':
        candidates = [
            f'https://naveropenapi.apigw.ntruss.com/map-transit/v1/directions?start={sx},{sy}&goal={gx},{gy}&lang=ko',
        ]
    else:
        return None, 'UNSUPPORTED_MODE'

    last_err = 'UNKNOWN'
    for url in candidates:
        try:
            r = requests.get(url, headers=headers, timeout=timeout)
            j = r.json() if r.content else {}
            if r.status_code < 300:
                parsed = _naver_parse_route(j)
                if parsed:
                    return parsed, None
                last_err = 'PARSE_FAILED'
            else:
                last_err = (j.get('error') or {}).get('message') or f'status_{r.status_code}'
        except Exception as e:
            last_err = str(e)
    return None, last_err


@api_bp.route('/naver/walking', methods=['POST'])
def naver_walking_route():
    try:
        payload = request.get_json(silent=True) or {}
        origin = payload.get('origin') or {}
        destination = payload.get('destination') or {}
        wps = payload.get('waypoints') or []
        stops = [origin] + wps + [destination]
        # Validate
        for s in stops:
            if 'x' not in s or 'y' not in s:
                return jsonify({ 'error': 'invalid_coordinates' }), 400
        sections = []
        total_dist = 0
        total_dur = 0
        for i in range(len(stops)-1):
            sx = float(stops[i]['x']); sy = float(stops[i]['y'])
            gx = float(stops[i+1]['x']); gy = float(stops[i+1]['y'])
            leg, err = _naver_leg('walking', (sx, sy), (gx, gy))
            if leg:
                sections.append({ 'summary': leg['summary'], 'path': leg['path'] })
                total_dist += leg['summary']['distance']
                total_dur += leg['summary']['duration']
            else:
                # fallback: straight line estimate (m, s)
                km = _haversine(sy, sx, gy, gx)
                dist = int(km*1000)
                dur = int((km/4.5)*3600)
                sections.append({ 'summary': { 'distance': dist, 'duration': dur }, 'path': [[sx,sy],[gx,gy]] })
                total_dist += dist; total_dur += dur
        return jsonify({ 'routes': [{ 'summary': { 'distance': total_dist, 'duration': total_dur }, 'sections': sections }] })
    except Exception as e:
        return jsonify({ 'error': 'naver_walking_failed', 'detail': str(e) }), 500


@api_bp.route('/naver/transit', methods=['POST'])
def naver_transit_route():
    try:
        payload = request.get_json(silent=True) or {}
        origin = payload.get('origin') or {}
        destination = payload.get('destination') or {}
        wps = payload.get('waypoints') or []
        stops = [origin] + wps + [destination]
        for s in stops:
            if 'x' not in s or 'y' not in s:
                return jsonify({ 'error': 'invalid_coordinates' }), 400
        sections = []
        total_dist = 0
        total_dur = 0
        for i in range(len(stops)-1):
            sx = float(stops[i]['x']); sy = float(stops[i]['y'])
            gx = float(stops[i+1]['x']); gy = float(stops[i+1]['y'])
            leg, err = _naver_leg('transit', (sx, sy), (gx, gy))
            if leg:
                sections.append({ 'summary': leg['summary'], 'path': leg['path'] })
                total_dist += leg['summary']['distance']
                total_dur += leg['summary']['duration']
            else:
                # fallback transit: 25km/h + 5분 편의치
                km = _haversine(sy, sx, gy, gx)
                dist = int(km*1000)
                dur = int((km/25)*3600 + 300)
                sections.append({ 'summary': { 'distance': dist, 'duration': dur }, 'path': [[sx,sy],[gx,gy]] })
                total_dist += dist; total_dur += dur
        return jsonify({ 'routes': [{ 'summary': { 'distance': total_dist, 'duration': total_dur }, 'sections': sections }] })
    except Exception as e:
        return jsonify({ 'error': 'naver_transit_failed', 'detail': str(e) }), 500


# ---------- Persona courses (UTF-8/UTF-8-SIG first, CP949 fallback) ----------
@api_bp.route('/persona/courses', methods=['GET'])
def persona_courses():
    """
    Parse and return courses from public/course_data/routes_all_simplified.csv
    Query:
      - pid: persona id (int)
      - grouped: '1' groups by (personaId, courseCode) and returns stops per course
    Returns JSON always in UTF-8 to avoid client-side mojibake.
    """
    try:
        course_dir = os.path.join(PUBLIC_DIR, 'course_data')
        csv_path = os.path.join(course_dir, 'routes_all_simplified.csv')
        if not os.path.exists(csv_path):
            return jsonify({ 'items': [] })

        rows = []
        for enc in ('utf-8-sig', 'utf-8', 'cp949'):
            try:
                with open(csv_path, 'r', encoding=enc, newline='') as f:
                    rdr = csv.reader(f)
                    rows = [r for r in rdr if r]
                    if rows:
                        break
            except Exception:
                continue

        items = []
        for r in rows:
            if len(r) < 7:
                continue
            try:
                pid = int(str(r[0]).strip())
                course_no = int(str(r[1]).strip())
                code = str(r[2]).strip()
                order = int(str(r[3]).strip())
                name = str(r[4]).strip()
                lat = float(str(r[5]).strip())
                lng = float(str(r[6]).strip())
            except Exception:
                continue
            items.append({
                'personaId': pid,
                'courseNo': course_no,
                'courseCode': code,
                'order': order,
                'name': name,
                'lat': lat,
                'lng': lng,
            })

        pid_q = request.args.get('pid')
        if pid_q is not None and pid_q != '':
            try:
                pid_v = int(pid_q)
                items = [x for x in items if x['personaId'] == pid_v]
            except Exception:
                pass

        if request.args.get('grouped') in ('1', 'true', 'yes'):
            grouped = {}
            for it in items:
                key = f"{it['personaId']}__{it['courseCode']}"
                grouped.setdefault(key, []).append(it)
            out = []
            for key, stops in grouped.items():
                stops_sorted = sorted(stops, key=lambda x: x['order'])
                title = f"{stops_sorted[0]['name']} → {stops_sorted[-1]['name']}" if stops_sorted else ''
                out.append({
                    'key': key,
                    'code': key.split('__')[1] if '__' in key else '',
                    'personaId': stops_sorted[0]['personaId'] if stops_sorted else None,
                    'title': title,
                    'stops': [ { 'name': s['name'], 'lat': s['lat'], 'lng': s['lng'] } for s in stops_sorted ]
                })
        return jsonify({ 'items': out })

        return jsonify({ 'items': items })
    except Exception as e:
        return jsonify({ 'error': 'courses_failed', 'detail': str(e) }), 500


# ---------- Route plan save/load (share) ----------
@api_bp.route('/route-plans', methods=['POST'])
def save_route_plan():
    try:
        _ensure_dir(ROUTE_PLANS_DIR)
        body = request.get_json(silent=True) or {}
        # Always create new id unless client explicitly passes update_id
        plan_id = body.get('id') or _gen_share_id()
        body['id'] = plan_id
        body['updated_at'] = int(time.time())
        fpath = os.path.join(ROUTE_PLANS_DIR, f"{plan_id}.json")
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(_json.dumps(body, ensure_ascii=False, indent=2))
        backend_origin = os.environ.get('REACT_APP_BACKEND_ORIGIN') or f"http://{os.environ.get('BACKEND_HOST','127.0.0.1')}:{os.environ.get('BACKEND_PORT') or os.environ.get('PORT','5001')}"
        return jsonify({ 'id': plan_id, 'shareUrl': f"{backend_origin}/api/route-plans/{plan_id}" })
    except Exception as e:
        return jsonify({ 'error': 'save_failed', 'detail': str(e) }), 500


@api_bp.route('/route-plans/<plan_id>', methods=['GET'])
def load_route_plan(plan_id: str):
    try:
        if not plan_id:
            return jsonify({ 'error': 'missing_id' }), 400
        fpath = os.path.join(ROUTE_PLANS_DIR, f"{plan_id}.json")
        if not os.path.exists(fpath):
            return jsonify({ 'error': 'not_found' }), 404
        with open(fpath, 'r', encoding='utf-8') as f:
            data = _json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({ 'error': 'load_failed', 'detail': str(e) }), 500
#-----------------------------------------------
# ---------- YOLO DETECT (file upload) ----------
_YOLO_MODEL = None
# best.pt 경로 찾음 
def get_model_path():    
    # 1. 현재 파일(routes.py) 기준으로 프로젝트 루트 찾기
    current_file = Path(__file__).resolve()  # /path/to/backend/app/api/routes.py
    backend_root = current_file.parent.parent.parent  # /path/to/backend/
    model_path = backend_root / "models" / "best.pt"
    
    print(f"계산된 모델 경로: {model_path}")
    print(f"파일 존재: {model_path.exists()}")
    
    if model_path.exists():
        return str(model_path)
    
    # 2. 환경변수 확인 (팀원별로 설정 가능)
    env_path = os.getenv("YOLO_MODEL_PATH")
    if env_path and os.path.exists(env_path):
        return env_path
    
    # 3. 기본 모델로 폴백
    return "yolov8n.pt"

@api_bp.route("/detect", methods=["POST", "OPTIONS"])
def detect():
    try:
        print("=== 🚀 YOLO Detection 요청 받음 ===")
        
        if request.method == "OPTIONS":
            return ("", 204)

        # 파일 필수 확인
        if "file" not in request.files:
            return jsonify({"error": "missing_file"}), 400

        # 파라미터 파싱
        conf = float(request.form.get("conf", 0.25))
        imgsz = int(request.form.get("imgsz", 640))
        device = os.getenv("YOLO_DEVICE", "cpu")       


        # 모델 로딩 (한 번만 로딩)
        model_path = get_model_path()
        
        global _YOLO_MODEL
        if _YOLO_MODEL is None:         
            from ultralytics import YOLO
            _YOLO_MODEL = YOLO(model_path)
            print("✅ YOLO 모델 로딩 완료")

        # 업로드된 파일 처리
        f = request.files["file"]
        print(f"업로드된 파일: {f.filename}")
        
        # 임시 파일로 저장 (YOLO가 파일 경로 필요)
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            f.save(tmp.name)
            tmp_path = tmp.name
            print(f" 임시 파일 저장: {tmp_path}")

        try:
            # YOLO 추론 실행
            print(" YOLO 추론 시작...")
            preds = _YOLO_MODEL.predict(
                source=tmp_path, 
                conf=conf, 
                imgsz=imgsz, 
                device=device, 
                verbose=False
            )
            print(f" 완료: {len(preds)}개 결과")
        
        finally:
            # 임시 파일 정리
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
                print("🗑️  임시 파일 삭제")

        # 결과 처리 및 JSON 변환
        detections = []
        if preds and len(preds) > 0:
            result = preds[0]  # 첫 번째 결과 사용
            
            # boxes와 names 추출
            if hasattr(result, 'boxes') and result.boxes is not None:
                names = result.names  # 클래스 인덱스 -> 이름 매핑
                boxes = result.boxes
                
                # 각 탐지된 객체 정보 추출
                if len(boxes) > 0:
                    cls_list = boxes.cls.tolist() if hasattr(boxes, "cls") else []
                    conf_list = boxes.conf.tolist() if hasattr(boxes, "conf") else []
                    
                    for i in range(len(cls_list)):
                        cls_idx = int(cls_list[i])
                        confidence = float(conf_list[i]) if i < len(conf_list) else 0.0
                        
                        # 클래스 이름 가져오기
                        if isinstance(names, dict):
                            class_name = names.get(cls_idx, f"class_{cls_idx}")
                        else:
                            class_name = str(cls_idx)
                        
                        detections.append({
                            "name": class_name,
                            "cls": cls_idx,
                            "conf": confidence,
                        })
                        
                        print(f"🎯 탐지: {class_name} (신뢰도: {confidence:.3f})")

        print(f"📊 최종 탐지된 객체 수: {len(detections)}")
        
        # 성공 응답
        return jsonify({
            "success": True,
            "detections": detections,
            "total_count": len(detections)
        })

    except ImportError as e:
        print(f"❌ Import 오류: {e}")
        return jsonify({
            "error": "ultralytics_not_installed",
            "message": "YOLO 라이브러리가 설치되지 않았습니다.",
            "detail": str(e)
        }), 500
        
    except FileNotFoundError as e:
        print(f"❌ 파일 오류: {e}")
        return jsonify({
            "error": "model_file_not_found", 
            "message": "YOLO 모델 파일을 찾을 수 없습니다.",
            "detail": str(e)
        }), 500
        
    except Exception as e:
        print(f"❌ 일반 오류: {e}")
        import traceback
        error_details = traceback.format_exc()
        print(f"📋 상세 오류:\n{error_details}")
        
        return jsonify({
            "error": "yolo_processing_failed",
            "message": "이미지 처리 중 오류가 발생했습니다.", 
            "detail": str(e)
        }), 500




# ---------- POI INFO (names -> info) ----------
@api_bp.route("/poi-info", methods=["POST", "OPTIONS"])
@cross_origin(
    origins=["http://localhost:5000","http://127.0.0.1:5000","http://localhost:3000","http://127.0.0.1:3000"],
    methods=["POST","OPTIONS"],
    allow_headers=["Content-Type"],
    max_age=600,
)
def poi_info():
    if request.method == "OPTIONS":
        return ("", 204)
    payload = request.get_json(silent=True) or {}
    names = payload.get("names", [])
    # 고정 정보 DB
    DB = {
        "63스퀘어":      {"name":"63스퀘어","address":"서울 영등포구 63로 50","open_hours_text":"10:00–22:00(시설별 상이)","ticket_price_text":"전시/전망대 유료","phone":"02-789-5663","website":"https://www.63.co.kr","description":"한강변 랜드마크. 아쿠아리움/전시/전망대가 유명."},
        "경복궁":        {"name":"경복궁","address":"서울 종로구 사직로 161","open_hours_text":"09:00–18:00(요일·계절별 상이, 화요일 휴궁)","ticket_price_text":"유료, 한복 착용 무료","phone":"02-3700-3900","website":"https://www.royalpalace.go.kr","description":"조선의 정궁. 근정전, 경회루 등 볼거리 풍부."},
        "남산서울타워":  {"name":"남산서울타워","address":"서울 용산구 남산공원길 105","open_hours_text":"10:00–23:00(변동 가능)","ticket_price_text":"전망대 유료","phone":"02-3455-9277","website":"https://www.seoultower.co.kr","description":"서울 전경을 볼 수 있는 대표 전망 명소."},
        "롯데월드타워":  {"name":"롯데월드타워","address":"서울 송파구 올림픽로 300","open_hours_text":"시설별 상이","ticket_price_text":"SEOUL SKY 유료","phone":"1661-2000","website":"https://www.lwt.co.kr","description":"123층 초고층 타워. 전망대·쇼핑·호텔 집합."},
    }
    items = [DB[n] for n in names if n in DB]
    return jsonify({"items": items})

#----------- Azure Computer Vision OCR API -----------
AZURE_VISION_ENDPOINT = os.getenv('AZURE_VISION_ENDPOINT')
AZURE_VISION_KEY = os.getenv('AZURE_VISION_KEY')

@api_bp.route('/vision/ocr', methods=['POST'])
def ocr_image():
    api_version = '2024-02-01'
    features = 'caption,read'
    model_version = 'latest'
    language = 'en'

    if 'image_file' in request.files:
        image_file = request.files['image_file']
        vision_url = f"{AZURE_VISION_ENDPOINT}/computervision/imageanalysis:analyze?features={features}&model-version={model_version}&language={language}&api-version={api_version}"
        headers = {
            'Ocp-Apim-Subscription-Key': AZURE_VISION_KEY,
            'Content-Type': 'application/octet-stream'
        }
        response = requests.post(
            vision_url,
            headers=headers,
            data=image_file.read()
        )
        return jsonify(response.json())

    # data = request.get_json()
    # image_url = data.get('image_url') if data else None
    # if image_url:
    #     vision_url = f"{AZURE_VISION_ENDPOINT}/computervision/imageanalysis:analyze?features={features}&model-version={model_version}&language={language}&api-version={api_version}"
    #     headers = {
    #         'Ocp-Apim-Subscription-Key': AZURE_VISION_KEY,
    #         'Content-Type': 'application/json'
    #     }
    #     response = requests.post(
    #         vision_url,
    #         headers=headers,
    #         json={'url': image_url}
    #     )
    #     return jsonify(response.json())

    return jsonify({'error': 'No image_file or image_url provided'}), 400

# ---------- 커뮤니티 - 음악플레이리스트 ----------
spotify_service = community_service.SpotifyService()

@api_bp.route('/spotify/login', methods=['GET'])
def spotify_login():
    try:
        auth_url = spotify_service.get_auth_url()
        return jsonify({'auth_url': auth_url})
    except Exception as e:
        print(f"Error in /spotify/login: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@api_bp.route('/spotify/callback')
def spotify_callback():    
    try:
        auth_code = request.args.get('code')        
        if not auth_code:
            return "Error: Authorization code not found", 400
        token_info = spotify_service.get_token_info(auth_code)
        session['spotify_token_info'] = token_info        
        redirect_url = os.getenv('FRONTEND_URL', 'http://127.0.0.1:3000') + '/community?tab=playlists'    
           
        return redirect(redirect_url)
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return f"Error in callback: {e}", 500

@api_bp.route('/spotify/user', methods=['GET'])
def get_spotify_user():   
    token_info = session.get('spotify_token_info')
    if not token_info:        
        return jsonify({'is_logged_in': False}), 200    
    try:
        result = spotify_service.get_current_user(token_info)
        if not result.get('success'):            
            session.pop('spotify_token_info', None)
            return jsonify({'is_logged_in': False, 'error': result.get('error')}), 401
        
        if 'updated_token' in result:
            session['spotify_token_info'] = result['updated_token']
        
        user_profile = result['user']
        
        return jsonify({
            'is_logged_in': True,
            'user': {
                'display_name': user_profile.get('display_name'),
                'avatar': user_profile['images'][0]['url'] if user_profile.get('images') else None
            }
        })
    except Exception as e:
        return jsonify({'is_logged_in': False, 'error': str(e)}), 500
   
   
@api_bp.route('/spotify/logout', methods=['POST'])
def spotify_logout():   
    session.pop('spotify_token_info', None)
    return jsonify({'success': True, 'message': '로그아웃되었습니다.'}) 
    