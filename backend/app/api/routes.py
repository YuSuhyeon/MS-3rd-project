from flask import Blueprint, jsonify, redirect, request, session


from ..services import persona_service , community_service , community_social
import os
import csv
import math
import time
import json as _json
import requests
import jwt
from functools import wraps


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

#----------- Azure Computer Vision OCR API -----------
AZURE_VISION_ENDPOINT = os.getenv('AZURE_VISION_ENDPOINT')
AZURE_VISION_KEY = os.getenv('AZURE_VISION_KEY')

@api_bp.route('/vision/ocr', methods=['POST'])
def ocr_image():
    api_version = '2024-02-01'
    features = 'caption,read'
    model_version = 'latest'
    language = 'en'

    # 환경 변수 확인
    if not AZURE_VISION_ENDPOINT or not AZURE_VISION_KEY:
        return jsonify({'error': 'Azure Vision API credentials not configured'}), 500

    if 'image_file' in request.files:
        image_file = request.files['image_file']
        
        # 파일이 실제로 선택되었는지 확인
        if not image_file or image_file.filename == '':
            return jsonify({'error': 'No image file provided'}), 400
            
        try:
            vision_url = f"{AZURE_VISION_ENDPOINT}/computervision/imageanalysis:analyze?features={features}&model-version={model_version}&language={language}&api-version={api_version}"
            headers = {
                'Ocp-Apim-Subscription-Key': AZURE_VISION_KEY,
                'Content-Type': 'application/octet-stream'
            }
            
            # 파일 데이터 읽기
            image_data = image_file.read()
            if not image_data:
                return jsonify({'error': 'Empty image file'}), 400
                
            response = requests.post(
                vision_url,
                headers=headers,
                data=image_data
            )
            
            if response.status_code == 200:
                return jsonify(response.json())
            else:
                return jsonify({'error': f'Azure Vision API error: {response.status_code}', 'detail': response.text}), response.status_code
                
        except Exception as e:
            return jsonify({'error': f'OCR processing failed: {str(e)}'}), 500

    return jsonify({'error': 'No image_file provided'}), 400

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


# =================================================================

#Social - DB 
board_service  = community_social.BoardService()

# =================================================================
# JWT 토큰 검증 함수들
# =================================================================

def get_user_from_token(auth_header):
    """
    Authorization 헤더에서 JWT 토큰을 파싱하고 사용자 ID를 반환합니다.
    """
    try:
        # 1. Authorization 헤더 확인
        if not auth_header or not auth_header.startswith('Bearer '):
            print("❌ Authorization 헤더가 없거나 Bearer 형식이 아님")
            # 토큰이 없으면 세션에서 시도
            session_user_id = session.get('user_id')
            print(f"🔄 세션에서 user_id 가져오기: {session_user_id}")
            return session_user_id
        
        # 2. 토큰 추출
        token = auth_header.split(' ')[1]
        print(f"🔑 추출된 토큰: {token[:20]}...")
        
        # 3. Google 토큰인지 확인 (긴 토큰)
        if len(token) > 500:  # Google JWT는 보통 매우 길다
            print("📱 Google 토큰으로 추정됨")
            user_id = verify_google_token(token)
            if user_id:
                print(f"✅ Google 토큰 검증 성공: user_id={user_id}")
                return user_id
        
        # 4. 자체 발급 토큰 검증
        print("🏠 자체 토큰으로 추정됨")
        user_id = verify_custom_token(token)
        if user_id:
            print(f"✅ 자체 토큰 검증 성공: user_id={user_id}")
            return user_id
        
        # 5. 토큰 검증 실패시 세션으로 폴백
        print("❌ 토큰 검증 실패, 세션으로 폴백")
        session_user_id = session.get('user_id')
        print(f"🔄 세션에서 user_id 가져오기: {session_user_id}")
        return session_user_id
        
    except Exception as e:
        print(f"❌ 토큰 파싱 오류: {e}")
        session_user_id = session.get('user_id')
        print(f"🔄 오류 발생, 세션으로 폴백: {session_user_id}")
        return session_user_id

def verify_google_token(token):
    """
    Google OAuth JWT 토큰을 검증합니다.
    """
    try:
        # Google의 공개 키로 토큰 검증
        google_keys_url = "https://www.googleapis.com/oauth2/v3/certs"
        response = requests.get(google_keys_url, timeout=10)
        google_keys = response.json()
        
        # JWT 헤더에서 kid 추출
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get('kid')
        
        if kid in google_keys['keys']:
            key = google_keys['keys'][kid]
            
            # 토큰 디코딩 및 검증
            decoded_token = jwt.decode(
                token,
                key,
                algorithms=['RS256'],
                audience=os.getenv('GOOGLE_CLIENT_ID'),
                issuer='https://accounts.google.com'
            )
            
            # Google 사용자 정보에서 우리 DB의 사용자 ID 찾기
            google_id = decoded_token.get('sub')
            email = decoded_token.get('email')
            
            # DB에서 Google ID로 사용자 검색
            user_result = board_service.get_user_by_social('google', google_id)
            if user_result['success']:
                return user_result['user']['id']
            
    except jwt.ExpiredSignatureError:
        print("Google 토큰이 만료됨")
    except jwt.InvalidTokenError as e:
        print(f"Google 토큰 검증 실패: {e}")
    except Exception as e:
        print(f"Google 토큰 검증 중 오류: {e}")
    
    return None

def verify_custom_token(token):
    """
    자체 발급한 JWT 토큰을 검증합니다.
    """
    try:
        # 환경변수에서 비밀키 가져오기
        secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this')
        
        # 토큰 디코딩 및 검증
        decoded_token = jwt.decode(
            token, 
            secret_key, 
            algorithms=['HS256']
        )
        
        # 토큰에서 사용자 ID 추출
        user_id = decoded_token.get('user_id')
        exp = decoded_token.get('exp')
        
        # 만료시간 확인
        if exp and datetime.fromtimestamp(exp) < datetime.utcnow():
            print("자체 토큰이 만료됨")
            return None
        
        print(f"자체 토큰에서 추출된 user_id: {user_id}")
        return user_id
        
    except jwt.ExpiredSignatureError:
        print("자체 토큰이 만료됨")
    except jwt.InvalidTokenError as e:
        print(f"자체 토큰 검증 실패: {e}")
    except Exception as e:
        print(f"자체 토큰 검증 중 오류: {e}")
    
    return None

def create_custom_token(user_id, email=None):
    """
    사용자를 위한 자체 JWT 토큰을 생성합니다.
    로그인 성공시 호출하여 프론트엔드에 전달합니다.
    """
    try:
        secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this')
        
        payload = {
            'user_id': user_id,
            'email': email,
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(hours=24)  # 24시간 유효
        }
        
        token = jwt.encode(payload, secret_key, algorithm='HS256')
        print(f"사용자 {user_id}를 위한 토큰 생성됨")
        return token
        
    except Exception as e:
        print(f"토큰 생성 중 오류: {e}")
        return None



# =================================================================
# 댓글 목록 조회 API
# =================================================================
@api_bp.route('/boards/<int:board_id>/comments', methods=['GET'])
def get_comments(board_id):
    """
    특정 게시글의 댓글 목록을 조회합니다.
    """
    try:
        result = board_service.get_comments(board_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'comments': result['comments']
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
            
    except Exception as e:
        print(f"Error in /boards/{board_id}/comments: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# =================================================================
# 게시글 작성 API
# =================================================================
@api_bp.route('/boards', methods=['POST'])
def create_board():
    """
    새로운 게시글을 작성합니다.
    """
    try:
        # 🔍 디버깅용 로깅 추가
        print(f"📊 현재 세션: {dict(session)}")
        print("=" * 50)
        print("POST /boards 요청 받음")
        print(f"📋 받은 헤더: {dict(request.headers)}")
        print(f"📋 Content-Type: {request.content_type}")
        print(f"🍪 받은 쿠키: {request.cookies}")
        
        # 요청 데이터 먼저 확인
        try:
            data = request.get_json()
            print(f"📄 받은 데이터: {data}")
        except Exception as e:
            print(f"❌ JSON 파싱 오류: {e}")
            return jsonify({
                'success': False,
                'error': '잘못된 데이터 형식입니다'
            }), 400
        
        # JWT 토큰 또는 세션에서 사용자 ID 가져오기
        auth_header = request.headers.get('Authorization')
        print(f"🔑 Authorization 헤더: {auth_header}")
        
        current_user_id = get_user_from_token(auth_header)
        print(f"👤 최종 사용자 ID: {current_user_id}")
        
        if not current_user_id:
            print("❌ 인증 실패: 사용자 ID를 가져올 수 없음")
            return jsonify({
                'success': False,
                'error': '로그인이 필요합니다'
            }), 401
        
        # 나머지 로직은 동일...
        title = data.get('title', '').strip()
        content = data.get('content', '').strip()
        tags = data.get('tags', '').strip()
        
        print(f"📝 파싱된 데이터: title='{title}', content='{content}', tags='{tags}'")
        
        if not title:
            return jsonify({
                'success': False,
                'error': '제목은 필수입니다'
            }), 400
            
        if not content:
            return jsonify({
                'success': False,
                'error': '내용은 필수입니다'
            }), 400
        
        # BoardService의 create_post 메서드 호출
        print(f"🚀 BoardService.create_post 호출 중...")
        result = board_service.create_post(
            user_id=current_user_id,
            title=title,
            content=content,
            images=None
        )
        
        print(f"📊 BoardService 결과: {result}")
        
        if result['success']:
            return jsonify({
                'success': True,
                'board_id': result['board_id'],
                'message': result['message']
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
            
    except Exception as e:
        print(f"❌ Error in POST /boards: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
# =================================================================
# 댓글 작성 API
# =================================================================
@api_bp.route('/boards/<int:board_id>/comments', methods=['POST'])
def create_comment(board_id):
    """
    특정 게시글에 댓글을 작성합니다.
    """
    try:
        # 현재 로그인된 사용자 ID
        current_user_id = session.get('user_id', 1)
        
        if not current_user_id:
            return jsonify({
                'success': False,
                'error': '로그인이 필요합니다'
            }), 401
        
        data = request.get_json()
        content = data.get('content')
        
        if not content:
            return jsonify({
                'success': False,
                'error': '댓글 내용이 필요합니다'
            }), 400
        
        result = board_service.create_comment(board_id, current_user_id, content)
        
        if result['success']:
            return jsonify({
                'success': True,
                'comment_id': result['comment_id'],
                'message': result['message']
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
            
    except Exception as e:
        print(f"Error in POST /boards/{board_id}/comments: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# =================================================================
# 게시글 삭제 API
# =================================================================
@api_bp.route('/boards/<int:board_id>', methods=['DELETE'])
def delete_board(board_id):
    """
    게시글을 삭제합니다. (소프트 삭제)
    """
    try:
        # 현재 로그인된 사용자 ID
        current_user_id = session.get('user_id', 1)
        
        if not current_user_id:
            return jsonify({
                'success': False,
                'error': '로그인이 필요합니다'
            }), 401
        
        result = board_service.delete_post(board_id, current_user_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': result['message']
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 400 if '권한이 없습니다' in result['error'] else 500
            
    except Exception as e:
        print(f"Error in DELETE /boards/{board_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500



# =================================================================
# 좋아요 토글 API
# =================================================================
@api_bp.route('/boards/<int:board_id>/like', methods=['POST'])
def toggle_like(board_id):
    """
    게시글 좋아요를 토글합니다. (좋아요 추가/취소)
    """
    try:
        # 현재 로그인된 사용자 ID
        current_user_id = session.get('user_id', 1)
        
        if not current_user_id:
            return jsonify({
                'success': False,
                'error': '로그인이 필요합니다'
            }), 401
        
        result = board_service.toggle_like(board_id, current_user_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'likes_count': result['likes_count'],
                'is_liked': result['is_liked']
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
            
    except Exception as e:
        print(f"Error in /boards/{board_id}/like: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# =================================================================
# 좋아요 취소 API (DELETE 방식)
# =================================================================
@api_bp.route('/boards/<int:board_id>/like', methods=['DELETE'])
def remove_like(board_id):
    """
    게시글 좋아요를 취소합니다.
    """
    try:
        # 현재 로그인된 사용자 ID
        current_user_id = session.get('user_id', 1)
        
        if not current_user_id:
            return jsonify({
                'success': False,
                'error': '로그인이 필요합니다'
            }), 401
        
        result = board_service.toggle_like(board_id, current_user_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'likes_count': result['likes_count'],
                'is_liked': result['is_liked']
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
            
    except Exception as e:
        print(f"Error in DELETE /boards/{board_id}/like: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
# =================================================================
# Google 로그인 콜백 API
# =================================================================
@api_bp.route('/auth/google/callback', methods=['POST'])
def google_callback():
    """
    Google OAuth 로그인 콜백을 처리합니다.
    사용자 정보를 DB에 저장하고 세션을 설정합니다.
    """
    try:
        data = request.get_json()
        access_token = data.get('token')  # access_token
        user_info = data.get('user_info')  # 프론트엔드에서 이미 가져온 사용자 정보
        
        print(f"🔍 Google 콜백 요청 받음")
        print(f"📄 받은 데이터: {data}")
        
        if not access_token:
            return jsonify({
                'success': False,
                'error': 'Google 토큰이 필요합니다'
            }), 400
        
        # 사용자 정보 추출
        if user_info:
            # 프론트엔드에서 이미 사용자 정보를 가져온 경우
            google_id = user_info.get('sub')
            email = user_info.get('email')
            name = user_info.get('name')
            profile_image = user_info.get('picture')
            
            print(f"👤 프론트엔드에서 받은 사용자 정보 사용")
            
        else:
            # 백엔드에서 직접 Google API 호출
            print(f"🔍 백엔드에서 Google API 호출...")
            try:
                google_api_url = f"https://www.googleapis.com/oauth2/v3/userinfo"
                headers = {'Authorization': f'Bearer {access_token}'}
                response = requests.get(google_api_url, headers=headers, timeout=10)
                
                if response.status_code != 200:
                    print(f"❌ Google API 응답 오류: {response.status_code}")
                    return jsonify({
                        'success': False,
                        'error': 'Google 사용자 정보 확인 실패'
                    }), 400
                
                google_user = response.json()
                print(f"👤 Google API 응답: {google_user}")
                
                google_id = google_user.get('sub')
                email = google_user.get('email')
                name = google_user.get('name')
                profile_image = google_user.get('picture')
                
            except Exception as e:
                print(f"❌ Google API 호출 오류: {e}")
                return jsonify({
                    'success': False,
                    'error': 'Google 사용자 정보 확인 실패'
                }), 500
        
        if not google_id or not email:
            return jsonify({
                'success': False,
                'error': 'Google 사용자 정보가 불완전합니다'
            }), 400
        
        # 2. DB에서 기존 사용자 확인 또는 생성
        print(f"🔍 DB에서 사용자 확인: google_id={google_id}")
        user_result = board_service.get_user_by_social('google', google_id)
        
        if user_result['success']:
            # 기존 사용자
            user = user_result['user']
            user_id = user['id']
            print(f"✅ 기존 사용자 로그인: user_id={user_id}")
            
        else:
            # 신규 사용자 - DB에 저장
            print(f"🆕 신규 사용자 생성 중...")
            create_result = board_service.create_or_update_user(
                provider='google',
                social_id=google_id,
                email=email,
                name=name,
                profile_image=profile_image
            )
            
            if create_result['success']:
                user_id = create_result['user_id']
                print(f"✅ 신규 사용자 생성 완료: user_id={user_id}")
            else:
                print(f"❌ 사용자 생성 실패: {create_result['error']}")
                return jsonify({
                    'success': False,
                    'error': '사용자 생성에 실패했습니다'
                }), 500
        
        # 3. 세션 설정
        session.clear()  # 기존 세션 초기화
        session['user_id'] = user_id
        session['provider'] = 'google'
        session['social_id'] = google_id
        session['email'] = email
        session['name'] = name
        session.permanent = True
        
        print(f"✅ 세션 설정 완료: {dict(session)}")
        
        # 4. 응답 데이터 준비
        user_data = {
            'id': user_id,
            'name': name,
            'email': email,
            'profile_image': profile_image,
            'provider': 'google'
        }
        
        return jsonify({
            'success': True,
            'message': '로그인 성공',
            'user': user_data,
            'session_user_id': session.get('user_id')  # 디버깅용
        })
        
    except Exception as e:
        print(f"❌ Google 로그인 콜백 오류: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': '로그인 처리 중 오류가 발생했습니다'
        }), 500

# =================================================================
# 현재 사용자 정보 조회 API
# =================================================================
@api_bp.route('/user/profile', methods=['GET'])
def get_current_user():
    """
    현재 로그인된 사용자의 프로필을 조회합니다.
    """
    try:
        # 세션에서 사용자 정보 확인
        user_id = session.get('user_id')
        
        print(f"🔍 세션 확인: user_id={user_id}")
        print(f"🔍 전체 세션: {dict(session)}")
        
        if not user_id:
            return jsonify({
                'success': False,
                'is_logged_in': False,
                'error': '로그인이 필요합니다'
            }), 401
        
        # DB에서 사용자 정보 가져오기
        result = board_service.get_user_by_id(user_id)
        
        if result['success']:
            user = result['user']
            return jsonify({
                'success': True,
                'is_logged_in': True,
                'user': {
                    'id': user['id'],
                    'name': user['name'],
                    'email': user['email'],
                    'profile_image': user['profile_image'],
                    'provider': user['provider']
                }
            })
        else:
            # 사용자 정보가 없으면 세션 클리어
            session.clear()
            return jsonify({
                'success': False,
                'is_logged_in': False,
                'error': '사용자 정보를 찾을 수 없습니다'
            }), 404
            
    except Exception as e:
        print(f"Error in /user/profile: {e}")
        return jsonify({
            'success': False,
            'is_logged_in': False,
            'error': str(e)
        }), 500


# =================================================================
# 로그아웃 API
# =================================================================
@api_bp.route('/logout', methods=['POST'])
def logout():
    """
    사용자를 로그아웃시킵니다.
    """
    try:
        session.clear()
        return jsonify({
            'success': True,
            'message': '로그아웃되었습니다'
        })
    except Exception as e:
        print(f"Error in /logout: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
        

@api_bp.route('/boards/trending/tags', methods=['GET'])
def get_trending_tags():
    try:
        result = board_service.get_trending_tags()
        if result['success']:
            return jsonify({'success': True, 'tags': result['tags']})
        else:
            return jsonify({'success': False, 'error': result['error']}), 500
    except Exception as e:
        print(f"Error in /boards/trending/tags: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@api_bp.route('/boards/trending/posts', methods=['GET'])
def get_trending_posts():
    try:
        result = board_service.get_trending_posts()
        if result['success']:
            return jsonify({'success': True, 'posts': result['posts']})
        else:
            return jsonify({'success': False, 'error': result['error']}), 500
    except Exception as e:
        print(f"Error in /boards/trending/posts: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@api_bp.route('/boards/<int:board_id>', methods=['GET'])
def get_board_detail(board_id):
    """
    특정 게시글의 상세 정보를 조회합니다.
    """
    try:
        result = board_service.get_post_detail(board_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'post': result['post'],
                'comments': result['comments']
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 404 if '찾을 수 없습니다' in result['error'] else 500
            
    except Exception as e:
        print(f"Error in /boards/{board_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
        
        
@api_bp.route('/boards/search', methods=['GET'])
def search_boards():
    try:
        query = request.args.get('q', '').strip()
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        if not query:
            return jsonify({
                'success': False,
                'error': '검색어가 필요합니다'
            }), 400
        
        result = board_service.search_posts(query, page=page, limit=limit)
        
        if result['success']:
            return jsonify({
                'success': True,
                'posts': result['posts'],
                'pagination': result['pagination'],
                'query': query
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
            
    except ValueError:
        return jsonify({
            'success': False,
            'error': 'page와 limit은 숫자여야 합니다'
        }), 400
    except Exception as e:
        print(f"Error in /boards/search: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
        
# =================================================================
# 사용자별 게시글 조회 API
# =================================================================
@api_bp.route('/users/<int:user_id>/boards', methods=['GET'])
def get_user_boards(user_id):  # ✅ 함수명 변경 & user_id 파라미터 추가
    """
    특정 사용자의 게시글 목록을 조회합니다.
    """
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        # ✅ 이 함수는 특정 사용자의 게시글만 조회
        result = board_service.get_user_posts(user_id, page=page, limit=limit)
        
        if result['success']:
            return jsonify({
                'success': True,
                'posts': result['posts'],
                'pagination': result['pagination']
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
            
    except ValueError:
        return jsonify({
            'success': False,
            'error': 'page와 limit은 숫자여야 합니다'
        }), 400
    except Exception as e:
        print(f"Error in /users/{user_id}/boards: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# =================================================================
# 게시글 목록 조회 API (검색 포함)
# =================================================================
@api_bp.route('/boards', methods=['GET'])
def get_boards():  # ✅ 이 함수명은 유지
    """
    전체 게시글 목록을 조회합니다. 검색 기능 포함.
    """
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        query = request.args.get('query', '').strip()
        
        current_user_id = session.get('user_id', 1)
        
        if query:
            print(f"🔎 검색 모드: '{query}' 검색 중...")
            # ✅ 간단한 형태로 호출 (search_posts 메서드 시그니처에 맞게)
            result = board_service.search_posts(query, page, limit)
        else:
            print(f"📄 일반 모드: 전체 게시글 조회 중...")
            result = board_service.get_posts(page=page, limit=limit, user_id=current_user_id)
        
        if result['success']:
            response_data = {
                'success': True,
                'posts': result['posts'],
                'pagination': result.get('pagination', {})
            }
            
            if query:
                response_data['search_query'] = query
                response_data['search_results_count'] = len(result['posts'])
                
            print(f"✅ 응답 데이터: {len(result['posts'])}개 게시글 반환")
            return jsonify(response_data)
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
            
    except ValueError:
        return jsonify({
            'success': False,
            'error': 'page와 limit은 숫자여야 합니다'
        }), 400
    except Exception as e:
        print(f"Error in /boards: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
