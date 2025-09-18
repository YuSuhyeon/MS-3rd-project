# -*- coding: utf-8 -*-
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


k6_id2label = {
    0: '알뜰 필수코스 정복자',
    1: '플렉스 장기 체류객',
    2: '관계 중심 체류객',
    3: '실속파 쇼핑 원정대',
    4: '문화유산 탐험가',
    5: '미니멀 K-컬처 팬',
}

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


# ---------- Seoul places data loading & caching ----------
_PLACES_CACHE = { 'mtime': 0.0, 'items': [] }

# 서울 지역 필터링을 위한 경계 상자 정의
SEOUL_MIN_LAT, SEOUL_MAX_LAT = 37.413294, 37.715133
SEOUL_MIN_LNG, SEOUL_MAX_LNG = 126.734086, 127.269311


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
        lat = float(_pick(row, ['lat', 'LAT', 'Lat', 'latitude', 'Latitude', 'Y', 'y', 'mapy', 'mapY', 'MapY']))
        lng = float(_pick(row, ['lon', 'LON', 'Lon', 'lng', 'LNG', 'Longitude', 'longitude', 'X', 'x', 'mapx', 'mapX', 'MapX']))
    except Exception:
        return None
    addr = _pick(row, ['address', 'addr', 'addr1', 'road_address', 'address_ko']) or ''
    cat_parts = [
        str(row.get('category') or ''),
        str(row.get('cat') or ''),
        str(row.get('category_ko') or ''),
        str(row.get('cat1') or ''),
        str(row.get('cat2') or ''),
        str(row.get('cat3') or ''),
        str(row.get('contenttype') or ''),
    ]
    cat = ' '.join([c for c in cat_parts if c]).strip()
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
        # Check if cache is fresh enough
        current_max_mtime = 0
        if os.path.isdir(SEOUL_DATA_DIR):
            for fname in os.listdir(SEOUL_DATA_DIR):
                if not fname.lower().endswith('.csv'): continue
                try:
                    current_max_mtime = max(current_max_mtime, os.path.getmtime(os.path.join(SEOUL_DATA_DIR, fname)))
                except Exception: pass
        if _PLACES_CACHE['mtime'] >= current_max_mtime and _PLACES_CACHE['items']:
            return _PLACES_CACHE['items']

        # Reload all
        aggregated = []
        if os.path.isdir(SEOUL_DATA_DIR):
            for fname in os.listdir(SEOUL_DATA_DIR):
                if not fname.lower().endswith('.csv'):
                    continue
                path = os.path.join(SEOUL_DATA_DIR, fname)
                parsed = _parse_csv(path, fname)
                aggregated.extend(parsed['items'])

        if aggregated:
            # 서울 지역 내에 있는 장소만 필터링
            aggregated = [x for x in aggregated if (
                isinstance(x.get('lat'), (int, float)) and isinstance(x.get('lng'), (int, float)) and
                SEOUL_MIN_LAT <= float(x['lat']) <= SEOUL_MAX_LAT and SEOUL_MIN_LNG <= float(x['lng']) <= SEOUL_MAX_LNG
            )]
            _PLACES_CACHE['items'] = aggregated
            _PLACES_CACHE['mtime'] = current_max_mtime # BUG FIX: latest_mtime -> current_max_mtime
            return aggregated
        return _PLACES_CACHE.get('items') or []
    except Exception:
        return _PLACES_CACHE.get('items') or []


# ----- Persona label helpers (avoid encoding issues) -----
def _persona_id_from_label(label: str) -> int:
    # Reverse map for robustness
    rev_map = {v: k for k, v in k6_id2label.items()}
    return rev_map.get(str(label).strip(), 0)

# ---------- Persona helpers (route builder) ----------
def _haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    to_rad = lambda d: (d * math.pi) / 180.0
    dLat = to_rad(lat2 - lat1)
    dLon = to_rad(lon2 - lon1)
    a = math.sin(dLat / 2) ** 2 + math.cos(to_rad(lat1)) * math.cos(to_rad(lat2)) * math.sin(dLon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# [정리] K6 페르소나를 위한 카테고리 추출 함수
def _extract_category(item):
    text = (f"{item.get('category','')} {item.get('name','')} {item.get('addr','')} {item.get('desc','')}").lower()
    has = lambda *keys: any(str(k).lower() in text for k in keys)
    if has('a04', 'shopping', '쇼핑', '시장', '백화점', '아울렛', '면세', '명동', '강남'): return 'shopping'
    if has('a05', 'food', '맛집', '음식', '식당', 'restaurant', 'cafe', '카페', '미식'): return 'food'
    if has('b02', '32', 'hotel', 'resort', '호텔', '리조트', '숙박', '스파', '럭셔리'): return 'luxury'
    if has('a0201', 'park', '공원', '자연', '둘레길', '산', '숲', '호수', '하천', '강'): return 'nature'
    if has('a0206', 'a0207', 'heritage', 'museum', 'gallery', 'culture', '문화', '박물관', '미술관', '궁', '한옥', '성곽'): return 'culture'
    if has('k-pop', 'kpop', '한류', '엔터테인먼트', '아이돌', '방송', '팝업'): return 'k-culture'
    return 'general'

# [정리] K6 페르소나 ID 기반 점수 계산 함수
def _score_by_persona_pid(pid: int, item: dict):
    """Score item by K6 persona id (0..5). Avoids string-equality issues with encodings."""
    cat = _extract_category(item)
    text = f"{item.get('name','')} {item.get('addr','')} {item.get('category','')} {item.get('desc','')}".lower()
    score = 0
    def anykey(*keys):
        return any(str(k).lower() in text for k in keys)
    
    if pid == 0: # 알뜰 필수코스 정복자
        if cat in ['culture', 'shopping']: score += 2
        if anykey('명소', '랜드마크', '궁', '타워', '광화문', '남산', '북촌', '한옥', '경복궁', '창덕궁', '덕수궁'): score += 2
    elif pid == 1: # 플렉스 장기 체류객
        if cat == 'luxury': score += 4
        if anykey('호텔', '리조트', '스파', '프리미엄', '럭셔리'): score += 1
    elif pid == 2: # 관계 중심 체류객
        if cat in ['nature', 'food']: score += 3
        if anykey('가족', '아이', '키즈', '데이트', '친구', '모임', '카페', '공원'): score += 1
    elif pid == 3: # 실속파 쇼핑 원정대
        if cat == 'shopping': score += 4
        if anykey('쇼핑', '시장', '백화점', '아울렛', '면세점', '명동', '강남'): score += 1
    elif pid == 4: # 문화유산 탐험가
        if cat == 'culture': score += 4
        if anykey('문화유산', '박물관', '미술관', '전시', '전통', '한옥', '궁', '유적'): score += 1
    elif pid == 5: # 미니멀 K-컬처 팬
        if cat in ['culture', 'shopping', 'k-culture']: score += 3
        if anykey('k-pop', '한류', '아이돌', '드라마', '공연', '뮤직', '엔터', 'sm', 'hybe', 'jyp', 'yg'): score += 1
    
    return score if score > 0 else 1 # 기본 점수 1점 부여

def _build_route(persona='문화유산 탐험가', maxStops=6, maxLegKm=20.0, origin=None, preferDiversity=True):
    all_items = _load_all_places()
    if not all_items:
        return []
    
    pid = _persona_id_from_label(persona)
    
    enriched = []
    for it in all_items:
        e = dict(it)
        e['derived_category'] = _extract_category(it)
        e['_score'] = _score_by_persona_pid(pid, it)
        enriched.append(e)
    
    # 점수가 1보다 큰 장소들을 우선 풀로 사용
    top = [x for x in enriched if x['_score'] > 1]
    pool = top if top else enriched

    seed = None
    if origin and isinstance(origin, dict):
        try:
            olat = float(origin.get('lat'))
            olng = float(origin.get('lng'))
            # 원점에서 가장 가까운 장소를 시작점으로 선택
            seed = sorted(({'x':x, 'd': _haversine(olat, olng, x['lat'], x['lng'])} for x in pool), key=lambda a: a['d'])[0]['x']
        except Exception:
            seed = None

    if seed is None:
        # 점수가 가장 높은 50개 장소 중 지리적으로 중심에 있는 장소를 시작점으로 선택
        topN = sorted(pool, key=lambda a: a['_score'], reverse=True)[:50]
        if topN:
            avgLat = sum(x['lat'] for x in topN)/len(topN)
            avgLng = sum(x['lng'] for x in topN)/len(topN)
            seed = sorted(topN, key=lambda a: _haversine(avgLat, avgLng, a['lat'], a['lng']))[0]
        elif pool:
            seed = pool[0] # 후보군이 없으면 그냥 첫번째 장소 사용
        else:
            return [] # 장소가 아예 없으면 빈 리스트 반환

    route = []
    used = set()
    current = seed
    route.append(current)
    used.add(current['id'])
    
    while len(route) < max(3, int(maxStops)):
        candidates = [{ 'x': x, 'd': _haversine(current['lat'], current['lng'], x['lat'], x['lng']) } for x in pool if x['id'] not in used]
        within = [c for c in candidates if c['d'] <= max(3.0, float(maxLegKm))]
        
        def diversity_penalty(cat):
            if not preferDiversity:
                return 0
            lastCat = route[-1]['derived_category'] if route else None
            # 이전 장소와 같은 카테고리면 페널티 부여
            return 1.5 if lastCat and cat == lastCat else 0
            
        considered = within if within else candidates
        if not considered:
            break
            
        # 최종 점수 = 페르소나 점수 - 다양성 페널티 - 거리 페널티
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
    questions = persona_service.load_questions()
    return jsonify(questions)


#사용자의 답변을 받아 페르소나를 분석하고 결과를 반환하는 API
@api_bp.route('/persona/analyze', methods=['POST'])
def analyze(): 
    payload = request.get_json(force=True, silent=True) or {}
    answers = payload.get('answers') or {}
    result = persona_service.analyze_persona(answers)
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
        # 기본 페르소나를 '문화유산 탐험가'로 변경
        persona = str(body.get('persona_type') or body.get('persona') or '문화유산 탐험가')
        maxStops = max(3, min(8, int(body.get('maxStops') or 6)))
        maxLegKm = max(3.0, min(30.0, float(body.get('maxLegKm') or 20)))
        origin = body.get('origin') if isinstance(body.get('origin'), dict) else None
        preferDiversity = False if body.get('preferDiversity') is False else True
        items = _build_route(persona=persona, maxStops=maxStops, maxLegKm=maxLegKm, origin=origin, preferDiversity=preferDiversity)
        return jsonify({ 'count': len(items), 'items': items })
    except Exception:
        # 개발 환경에서는 상세 에러를 반환하는 것이 디버깅에 용이
        import traceback
        return jsonify({ 'error': 'route_build_failed', 'detail': traceback.format_exc() }), 500


@api_bp.route('/translate', methods=['GET'])
def translate():
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
        prefer = ['trawalk', 'traoptimal', 'trafast']
        keys = list(route.keys())
        for k in prefer + [k for k in keys if k not in prefer]:
            arr = route.get(k)
            if isinstance(arr, list) and arr:
                r0 = arr[0]
                path = r0.get('path') or []
                if path:
                    summ = (r0.get('summary') or {})
                    distance = int(summ.get('distance') or 0)
                    duration = int(summ.get('duration') or 0)
                    return {
                        'summary': { 'distance': distance, 'duration': duration },
                        'path': path,
                    }
        return None
    except Exception:
        return None


def _naver_leg(mode: str, start_xy: tuple, end_xy: tuple, timeout=10):
    headers = _naver_headers()
    if not headers:
        return None, 'NO_NAVER_KEY'
    sx, sy = start_xy
    gx, gy = end_xy
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
                km = _haversine(sy, sx, gy, gx)
                dist = int(km*1000)
                dur = int((km/25)*3600 + 300)
                sections.append({ 'summary': { 'distance': dist, 'duration': dur }, 'path': [[sx,sy],[gx,gy]] })
                total_dist += dist; total_dur += dur
        return jsonify({ 'routes': [{ 'summary': { 'distance': total_dist, 'duration': total_dur }, 'sections': sections }] })
    except Exception as e:
        return jsonify({ 'error': 'naver_transit_failed', 'detail': str(e) }), 500


def _sections_path_to_kakao_roads(sections: list):
    out = []
    for sec in sections or []:
        try:
            path = sec.get('path') or []
            vertexes = []
            for pt in path:
                if isinstance(pt, (list, tuple)) and len(pt) >= 2:
                    vertexes.extend([float(pt[0]), float(pt[1])])
            out.append({
                'summary': sec.get('summary') or { 'distance': 0, 'duration': 0 },
                'roads': [{ 'vertexes': vertexes }],
            })
        except Exception:
            out.append({ 'summary': { 'distance': 0, 'duration': 0 }, 'roads': [] })
    return out


@api_bp.route('/tmap/route', methods=['POST'])
def tmap_route():
    try:
        body = request.get_json(silent=True) or {}
        mode = str(body.get('mode') or 'CAR').upper()

        if mode == 'PEDESTRIAN':
            origin = body.get('origin') or {}
            destination = body.get('destination') or {}
            wps = body.get('waypoints') or []
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
                leg, err = _naver_leg('walking', (sx, sy), (gx, gy))
                if leg:
                    sections.append({ 'summary': leg['summary'], 'path': leg['path'] })
                    total_dist += leg['summary']['distance']
                    total_dur += leg['summary']['duration']
                else:
                    km = _haversine(sy, sx, gy, gx)
                    dist = int(km*1000)
                    dur = int((km/4.5)*3600)
                    sections.append({ 'summary': { 'distance': dist, 'duration': dur }, 'path': [[sx,sy],[gx,gy]] })
                    total_dist += dist; total_dur += dur
            kakao_like_sections = _sections_path_to_kakao_roads(sections)
            return jsonify({ 'routes': [{ 'summary': { 'distance': total_dist, 'duration': total_dur }, 'sections': kakao_like_sections }] })

        key = os.getenv('KAKAO_REST_API_KEY') or os.getenv('REACT_APP_KAKAO_API_KEY')
        if not key:
            return jsonify({ 'result_code': 'NO_API_KEY', 'result_msg': 'Kakao REST API key is missing' }), 400
        url = 'https://apis-navi.kakaomobility.com/v1/waypoints/directions'
        r = requests.post(url, headers={
            'Authorization': f'KakaoAK {key}',
            'Content-Type': 'application/json',
        }, data=_json.dumps(body), timeout=15)
        try:
            data = r.json()
        except Exception:
            data = { 'error': 'invalid_json' }
        return jsonify(data), r.status_code
    except Exception as e:
        return jsonify({ 'error': 'tmap_route_failed', 'detail': str(e) }), 500


@api_bp.route('/tmap/transit', methods=['POST'])
def tmap_transit():
    try:
        body = request.get_json(silent=True) or {}
        origin = body.get('origin') or {}
        destination = body.get('destination') or {}
        wps = body.get('waypoints') or []
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
                km = _haversine(sy, sx, gy, gx)
                dist = int(km*1000)
                dur = int((km/25)*3600 + 300)
                sections.append({ 'summary': { 'distance': dist, 'duration': dur }, 'path': [[sx,sy],[gx,gy]] })
                total_dist += dist; total_dur += dur
        kakao_like_sections = _sections_path_to_kakao_roads(sections)
        return jsonify({ 'routes': [{ 'summary': { 'distance': total_dist, 'duration': total_dur }, 'sections': kakao_like_sections }] })
    except Exception as e:
        return jsonify({ 'error': 'tmap_transit_failed', 'detail': str(e) }), 500


@api_bp.route('/persona/courses', methods=['GET'])
def persona_courses():
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
            if len(r) < 7: continue
            try:
                items.append({
                    'personaId': int(str(r[0]).strip()),
                    'courseNo': int(str(r[1]).strip()),
                    'courseCode': str(r[2]).strip(),
                    'order': int(str(r[3]).strip()),
                    'name': str(r[4]).strip(),
                    'lat': float(str(r[5]).strip()),
                    'lng': float(str(r[6]).strip()),
                })
            except Exception: continue
        
        pid_q = request.args.get('pid')
        ptype_q = request.args.get('ptype')
        if (pid_q is None or pid_q == '') and ptype_q is not None:
            _label = str(ptype_q).strip()
            _k6_map_rev = {v: k for k, v in k6_id2label.items()}
            _m2 = _k6_map_rev.get(_label)
            if _m2 is not None:
                pid_q = str(_m2)
        if pid_q is not None and pid_q != '':
            try:
                pid_v = int(pid_q)
                items = [x for x in items if x['personaId'] == pid_v]
            except Exception: pass

        if request.args.get('grouped') in ('1', 'true', 'yes'):
            grouped = {}
            for it in items:
                key = f"{it['personaId']}__{it['courseCode']}"
                grouped.setdefault(key, []).append(it)
            out = []
            for key, stops in grouped.items():
                stops_sorted = sorted(stops, key=lambda x: x['order'])
                # BUG FIX: '??' -> ' 등'
                title = f"{stops_sorted[0]['name']} 등" if stops_sorted else ''
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


@api_bp.route('/persona/courses2', methods=['GET'])
def persona_courses2():
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
            if len(r) < 7: continue
            try:
                items.append({
                    'personaId': int(str(r[0]).strip()),
                    'courseNo': int(str(r[1]).strip()),
                    'courseCode': str(r[2]).strip(),
                    'order': int(str(r[3]).strip()),
                    'name': str(r[4]).strip(),
                    'lat': float(str(r[5]).strip()),
                    'lng': float(str(r[6]).strip()),
                })
            except Exception: continue

        pid_q = request.args.get('pid')
        ptype_q = request.args.get('ptype')
        if (pid_q is None or pid_q == '') and ptype_q is not None:
            _label = str(ptype_q).strip()
            _k6_map_rev = {v: k for k, v in k6_id2label.items()}
            _m2 = _k6_map_rev.get(_label)
            if _m2 is not None:
                pid_q = str(_m2)
        if pid_q is not None and pid_q != '':
            try:
                pid_v = int(pid_q)
                items = [x for x in items if x['personaId'] == pid_v]
            except Exception: pass

        if request.args.get('grouped') in ('1','true','yes'):
            grouped = {}
            for it in items:
                key = f"{it['personaId']}__{it['courseCode']}"
                grouped.setdefault(key, []).append(it)
            out = []
            for key, stops in grouped.items():
                stops_sorted = sorted(stops, key=lambda x: x['order'])
                if not stops_sorted: continue
                pid_v = stops_sorted[0]['personaId']
                # BUG FIX: '??' -> ' 등'
                title = f"{stops_sorted[0]['name']} 등"
                out.append({
                    'key': key,
                    'code': key.split('__')[1] if '__' in key else '',
                    'personaId': pid_v,
                    'personaType': k6_id2label.get(pid_v),
                    'title': title,
                    'stops': [ { 'name': s['name'], 'lat': s['lat'], 'lng': s['lng'] } for s in stops_sorted ]
                })
            return jsonify({ 'items': out })

        return jsonify({ 'items': items })
    except Exception as e:
        return jsonify({ 'error': 'courses2_failed', 'detail': str(e) }), 500


@api_bp.route('/route-plans', methods=['POST'])
def save_route_plan():
    try:
        _ensure_dir(ROUTE_PLANS_DIR)
        body = request.get_json(silent=True) or {}
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
    