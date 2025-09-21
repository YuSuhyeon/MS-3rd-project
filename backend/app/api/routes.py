from flask import Blueprint, jsonify, redirect, request, session
from ..services import persona_service , community_service,community_social, storage_service

import os
from flask import Blueprint, jsonify, redirect, request, session
from flask_cors import cross_origin 
from pathlib import Path

import csv
import math
import time
import json as _json
import requests
import tempfile
import jwt
from functools import wraps


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
#====================================================================


#    Authorization 헤더에서 JWT 토큰을 파싱하고 사용자 ID를 반환
def get_user_from_token(auth_header):

    try:
        #Authorization 헤더 확인
        if not auth_header or not auth_header.startswith('Bearer '):
            # 토큰이 없으면 세션에서 시도
            session_user_id = session.get('user_id')
            return session_user_id
        
        # 토큰 추출
        token = auth_header.split(' ')[1]        
        # Google 토큰인지 확인 
        if len(token) > 500:  
            print(" Google 토큰으로 추정됨")
            user_id = verify_google_token(token)
            if user_id:
                print(f"Google 토큰 검증 성공: user_id={user_id}")
                return user_id
        
        # 자체 발급 토큰 검증
        print("자체 토큰으로 추정됨")
        user_id = verify_custom_token(token)
        if user_id:
            print(f"자체 토큰 검증 성공: user_id={user_id}")
            return user_id
        
        # 토큰 검증 실패시 세션으로 폴백    
        session_user_id = session.get('user_id')
        return session_user_id
        
    except Exception as e:
        session_user_id = session.get('user_id')
        return session_user_id
    
def verify_google_token(token):
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
# Google 로그인 콜백 :  사용자 정보를 DB에 저장하고 세션을 설정
# =================================================================
@api_bp.route('/auth/google/callback', methods=['POST'])
def google_callback():
    try:
        data = request.get_json()
        access_token = data.get('token')
        user_info = data.get('user_info')  
        
        if not access_token:
            return jsonify({
                'success': False,
                'error': 'Google 토큰이 필요합니다'
            }), 400
        
        # 사용자 정보 추출
        if user_info:     
            google_id = user_info.get('sub')
            email = user_info.get('email')
            name = user_info.get('name')
            profile_image = user_info.get('picture')                        
        else:
            try:
                google_api_url = f"https://www.googleapis.com/oauth2/v3/userinfo"
                headers = {'Authorization': f'Bearer {access_token}'}
                response = requests.get(google_api_url, headers=headers, timeout=10)
                
                if response.status_code != 200:
                    return jsonify({
                        'success': False,
                        'error': 'Google 사용자 정보 확인 실패'
                    }), 400
                
                google_user = response.json()                
                google_id = google_user.get('sub')
                email = google_user.get('email')
                name = google_user.get('name')
                profile_image = google_user.get('picture')
                
            except Exception as e:

                return jsonify({
                    'success': False,
                    'error': 'Google 사용자 정보 확인 실패'
                }), 500
        
        if not google_id or not email:
            return jsonify({
                'success': False,
                'error': 'Google 사용자 정보가 불완전합니다'
            }), 400
        
        # DB에서 기존 사용자 확인 또는 생성
        print(f"DB에서 사용자 확인: google_id={google_id}")
        user_result = board_service.get_user_by_social('google', google_id)
        
        if user_result['success']:

            user = user_result['user']
            user_id = user['id']
            print(f"기존 사용자 로그인: user_id={user_id}")
            
        else:
            # 신규 사용자 - DB에 저장
            create_result = board_service.create_or_update_user(
                provider='google',
                social_id=google_id,
                email=email,
                name=name,
                profile_image=profile_image
            )
            
            if create_result['success']:
                user_id = create_result['user_id']

            else:

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

        
        # 4. 응답 데이터 준비
        user_data = {
            'id': user_id,
            'name': name,
            'email': email,
            'picture': profile_image,
            'provider': 'google'
        }
        
        return jsonify({
            'success': True,
            'message': '로그인 성공',
            'user': user_data,
            'session_user_id': session.get('user_id')  # 디버깅용
        })
        
    except Exception as e:
   
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': '로그인 처리 중 오류가 발생했습니다'
        }), 500




#Microsoft Login ==============================================

@api_bp.route('/auth/microsoft/callback', methods=['POST'])
def microsoft_callback():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        access_token = data.get('token')
        user_info = data.get('user_info')
        
        if not access_token or not user_info:
            return jsonify({'success': False, 'error': 'Missing token or user info'}), 400
        
        # Microsoft 사용자 정보 추출
        microsoft_id = user_info.get('id')
        email = user_info.get('mail') or user_info.get('userPrincipalName')
        name = user_info.get('displayName')
        
        if not microsoft_id or not email:
            return jsonify({'success': False, 'error': 'Microsoft 사용자 정보가 불완전합니다'}), 400
        
        print(f"Microsoft 로그인 시도: microsoft_id={microsoft_id}, email={email}")
        
        # DB에서 기존 사용자 확인 또는 생성
        user_result = board_service.get_user_by_social('microsoft', microsoft_id)
        
        if user_result['success']:
            user = user_result['user']
            user_id = user['id']
            print(f"기존 Microsoft 사용자 로그인: user_id={user_id}")
        else:
            # 신규 사용자 생성
            create_result = board_service.create_or_update_user(
                provider='microsoft',
                social_id=microsoft_id,
                email=email,
                name=name,
                profile_image=None
            )
            
            if create_result['success']:
                user_id = create_result['user_id']
                print(f"신규 Microsoft 사용자 생성: user_id={user_id}")
            else:
                return jsonify({'success': False, 'error': 'Microsoft 사용자 생성에 실패했습니다'}), 500
        
        # 세션 설정
        session.clear()
        session['user_id'] = user_id
        session['provider'] = 'microsoft'
        session['social_id'] = microsoft_id
        session['email'] = email
        session['name'] = name
        session.permanent = True
        
        # 응답 데이터 준비
        user_data = {
            'id': user_id,
            'name': name,
            'email': email,
            'picture': None,
            'provider': 'microsoft'
        }
        
        return jsonify({
            'success': True,
            'message': 'Microsoft 로그인 성공',
            'user': user_data,
            'session_user_id': session.get('user_id')
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Microsoft 콜백 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Microsoft 로그인 처리 중 오류가 발생했습니다'
        }), 500
        
# =================================================================
# 로그아웃 API
# =================================================================
@api_bp.route('/logout', methods=['POST'])
def logout():

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
        
            
# ========================Social 게시판 CRUD=====================================
#  Create 
# 게시글 작성 --------------------------------
# @api_bp.route('/boards', methods=['POST'])
# def create_board():
#     try:       
#         try:
            
#             data = request.get_json()
#         except Exception as e:
#             return jsonify({
#                 'success': False,
#                 'error': '잘못된 데이터 형식입니다'
#             }), 400
        
#         # JWT 토큰 또는 세션에서 사용자 ID 가져오기
#         auth_header = request.headers.get('Authorization')        
#         current_user_id = get_user_from_token(auth_header)      
          
#         if not current_user_id:
#             return jsonify({
#                 'success': False,
#                 'error': '로그인이 필요합니다'
#             }), 401        

#         title = data.get('title', '').strip()
#         content = data.get('content', '').strip()
#         tags = data.get('tags', '').strip()
   
#         if not title:
#             return jsonify({
#                 'success': False,
#                 'error': '제목은 필수입니다'
#             }), 400
            
#         if not content:
#             return jsonify({
#                 'success': False,
#                 'error': '내용은 필수입니다'
#             }), 400
        
#         # BoardService의 create_post 메서드 호출
#         result = board_service.create_post(
#             user_id=current_user_id,
#             title=title,
#             content=content,
#             images=None
#         )
                
#         if result['success']:
#             return jsonify({
#                 'success': True,
#                 'board_id': result['board_id'],
#                 'message': result['message']
#             }), 201
#         else:
#             return jsonify({
#                 'success': False,
#                 'error': result['error']
#             }), 500
            
#     except Exception as e:

#         import traceback
#         traceback.print_exc()
#         return jsonify({
#             'success': False,
#             'error': str(e)
#         }), 500
# 게시글 작성 --------------------------------
@api_bp.route('/boards', methods=['POST'])
def create_board():
    try:       
        print("=== 게시글 작성 요청 시작 ===")
        print("Content-Type:", request.content_type)
        
        # FormData로 받는 경우 (이미지가 있을 때)
        if 'multipart/form-data' in str(request.content_type):
            print("FormData 처리")
            print("받은 폼 데이터:", request.form.to_dict())
            print("받은 파일:", list(request.files.keys()))
            
            title = request.form.get('title', '').strip()
            content = request.form.get('content', '').strip()
            tags = request.form.get('tags', '').strip()
            
        # JSON으로 받는 경우 (이미지가 없을 때)
        else:
            print("JSON 처리")
            try:
                data = request.get_json()
                print("받은 JSON 데이터:", data)
                
                title = data.get('title', '').strip()
                content = data.get('content', '').strip()
                tags = data.get('tags', '').strip()
                
            except Exception as e:
                print(f"JSON 파싱 오류: {e}")
                return jsonify({
                    'success': False,
                    'error': '잘못된 데이터 형식입니다'
                }), 400
        
        # JWT 토큰 또는 세션에서 사용자 ID 가져오기
        auth_header = request.headers.get('Authorization')        
        current_user_id = get_user_from_token(auth_header)      
          
        if not current_user_id:
            return jsonify({
                'success': False,
                'error': '로그인이 필요합니다'
            }), 401        

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
        
        # 이미지 업로드 처리
        uploaded_image_urls = []
        
        if 'multipart/form-data' in str(request.content_type):
            # 이미지 파일들 처리
            for key in request.files:
                if key.startswith('image'):  # image0, image1, image2 등
                    file = request.files[key]
                    if file and file.filename:
                        print(f"이미지 업로드 시작: {file.filename}")
                        
                        # Azure Blob Storage에 업로드
            
                        upload_result = storage_service.upload_image(file)
                        
                        if upload_result['success']:
                            uploaded_image_urls.append(upload_result['url'])
                            print(f"이미지 업로드 성공: {upload_result['url']}")
                        else:
                            print(f"이미지 업로드 실패: {upload_result['error']}")
                            return jsonify({
                                'success': False,
                                'error': f"이미지 업로드 실패: {upload_result['error']}"
                            }), 500
        
        print(f"업로드된 이미지 URLs: {uploaded_image_urls}")
        
        # BoardService의 create_post 메서드 호출
        result = board_service.create_post(
            user_id=current_user_id,
            title=title,
            content=content,
            images=uploaded_image_urls if uploaded_image_urls else None
        )
                
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
        print(f"게시글 작성 에러 상세: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
# 댓글 작성 --------------------------------
@api_bp.route('/boards/<int:board_id>/comments', methods=['POST'])
def create_comment(board_id):

    try:
        auth_header = request.headers.get('Authorization')
        current_user_id = get_user_from_token(auth_header)
        
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
                'comment': result.get('comment'),  # 새로 생성된 댓글 정보
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
#  Read 

#댓글 목록------------------
@api_bp.route('/boards/<int:board_id>/comments', methods=['GET'])
def get_comments(board_id):
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
# Update


# 게시글 수정------------------
@api_bp.route('/boards/<int:board_id>', methods=['PUT'])
def update_board(board_id):
    try:
        auth_header = request.headers.get('Authorization')
        current_user_id = get_user_from_token(auth_header)
        
        if not current_user_id:
            return jsonify({
                'success': False,
                'error': '로그인이 필요합니다'
            }), 401
        
        data = request.get_json()
        title = data.get('title', '').strip()
        content = data.get('content', '').strip()
        
        if not title or not content:
            return jsonify({
                'success': False,
                'error': '제목과 내용은 필수입니다'
            }), 400
        
        result = board_service.update_post(board_id, current_user_id, title, content)
        
        if result['success']:
            return jsonify({
                'success': True,
                'post': result.get('post'),
                'message': result['message']
            })
        else:
            status_code = 403 if '권한이 없습니다' in result['error'] else 500
            return jsonify({
                'success': False,
                'error': result['error']
            }), status_code
            
    except Exception as e:
        print(f"Error in PUT /boards/{board_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# 댓글 수정------------------

@api_bp.route('/comments/<int:comment_id>', methods=['PUT'])
def update_comment(comment_id):
    try:
        auth_header = request.headers.get('Authorization')
        current_user_id = get_user_from_token(auth_header)
        
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
        
        result = board_service.update_comment(comment_id, current_user_id, content)
        
        if result['success']:
            return jsonify({
                'success': True,
                'comment': result.get('comment'),  # 수정된 댓글 정보
                'message': result['message']
            })
        else:
            status_code = 403 if '권한이 없습니다' in result['error'] else 500
            return jsonify({
                'success': False,
                'error': result['error']
            }), status_code
            
    except Exception as e:
        print(f"Error in PUT /comments/{comment_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
        
# =================================================================
# Delete ( 실제로 DB에서 지우는게 아니라 delete한 날짜로 관리하는 소프트 삭제 방법)

# 댓글 삭제 API ----------------------------------------------------   
@api_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):

    try:
        auth_header = request.headers.get('Authorization')
        current_user_id = get_user_from_token(auth_header)
        
        if not current_user_id:
            return jsonify({
                'success': False,
                'error': '로그인이 필요합니다'
            }), 401
        
        result = board_service.delete_comment(comment_id, current_user_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': result['message']
            })
        else:
            status_code = 403 if '권한이 없습니다' in result['error'] else 500
            return jsonify({
                'success': False,
                'error': result['error']
            }), status_code
            
    except Exception as e:
        print(f"Error in DELETE /comments/{comment_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# 게시글 삭제 API  ----------------------------------------------------
@api_bp.route('/boards/<int:board_id>', methods=['DELETE'])
def delete_board(board_id):
    try:
        auth_header = request.headers.get('Authorization')
        current_user_id = get_user_from_token(auth_header)
        
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
            status_code = 403 if '권한이 없습니다' in result['error'] else 500
            return jsonify({
                'success': False,
                'error': result['error']
            }), status_code
            
    except Exception as e:
        print(f"Error in DELETE /boards/{board_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# =================================================================
# 좋아요  기능
# insert --------------------------------
@api_bp.route('/boards/<int:board_id>/like', methods=['POST'])
def add_like(board_id):
    try:
        print(f"=== 좋아요 요청 시작: board_id={board_id} ===")
        
        auth_header = request.headers.get('Authorization')
        print(f"Authorization 헤더: {auth_header}")
        
        current_user_id = get_user_from_token(auth_header)
        print(f"현재 사용자 ID: {current_user_id}")
        
        if not current_user_id:
            print("인증 실패: 로그인이 필요합니다")
            return jsonify({
                'success': False,
                'error': '로그인이 필요합니다'
            }), 401
        
        # JSON 파싱 안전하게 처리
        try:
            data = request.get_json() if request.is_json else {}
            print(f"요청 데이터: {data}")
        except Exception as json_error:
            print(f"JSON 파싱 에러: {json_error}")
            data = {}
        
        print(f"board_service.add_like 호출: board_id={board_id}, user_id={current_user_id}")
        result = board_service.add_like(board_id, current_user_id)
        print(f"board_service.add_like 결과: {result}")
        
        if result['success']:
            response_data = {
                'success': True,
                'likes_count': result['likes_count'],
                'is_liked': True,
                'message': '좋아요를 추가했습니다'
            }
            print(f"성공 응답: {response_data}")
            return jsonify(response_data), 201
        else:
            # 이미 좋아요를 눌렀거나 다른 에러
            status_code = 409 if '이미' in result['error'] else 500
            error_response = {
                'success': False,
                'error': result['error']
            }
            print(f"실패 응답: {error_response}, 상태코드: {status_code}")
            return jsonify(error_response), status_code
            
    except Exception as e:
        print(f"=== 예외 발생 in POST /boards/{board_id}/like ===")
        print(f"예외 타입: {type(e)}")
        print(f"예외 메시지: {str(e)}")
        import traceback
        print(f"스택 트레이스: {traceback.format_exc()}")
        
        return jsonify({
            'success': False,
            'error': f'서버 내부 오류: {str(e)}'
        }), 500

@api_bp.route('/boards/<int:board_id>/like', methods=['DELETE'])
def remove_like(board_id):
    try:
        auth_header = request.headers.get('Authorization')
        current_user_id = get_user_from_token(auth_header)
        
        if not current_user_id:
            return jsonify({
                'success': False,
                'error': '로그인이 필요합니다'
            }), 401
        
        # toggle_like이 아니라 remove_like 호출
        result = board_service.remove_like(board_id, current_user_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'likes_count': result['likes_count'],
                'is_liked': False  # DELETE는 항상 False
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
# 인기 태그 
# =================================================================
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
# =================================================================
# 인기 게시글 
# =================================================================
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


# =================================================================
# 게시글 검색 : 게시글 검색 
# =================================================================
        
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
# 게시글 상세 조회 : 특정 게시글의 상세 정보와  현재 사용자의 권한 정보 조회
# =================================================================
@api_bp.route('/boards/<int:board_id>', methods=['GET'])
def get_board_detail(board_id):
    try:
        
        auth_header = request.headers.get('Authorization')
        current_user_id = get_user_from_token(auth_header)
        
        if not current_user_id:
            return jsonify({
                'success': False,
                'error': '로그인이 필요합니다'
            }), 401
     
        result = board_service.get_post_detail(board_id, current_user_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'post': result['post'],
                'comments': result['comments'],
                'user_permissions': result.get('user_permissions', {})  # 사용자 권한 정보
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
        
# =================================================================
# 특정 사용자의 게시글 목록을 조회
# =================================================================
@api_bp.route('/users/<int:user_id>/boards', methods=['GET'])
def get_user_boards(user_id):  
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))        
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
# 게시글 목록 조회  (검색 포함)
# =================================================================
@api_bp.route('/boards', methods=['GET'])
def get_boards():   
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        query = request.args.get('query', '').strip()
        
        auth_header = request.headers.get('Authorization')
        current_user_id = get_user_from_token(auth_header)
        
        if query: 
            result = board_service.search_posts(query, page, limit)
        else:
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



#=================================================================
# 현재 사용자의 프로필 정보 조회 API
# =================================================================
@api_bp.route('/user/profile', methods=['GET'])
def get_current_user():

    try:
        auth_header = request.headers.get('Authorization')
        user_id = get_user_from_token(auth_header)
        
        
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
                    'profile_image': user.get('profile_image'),  
                    'provider': user.get('provider')  
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
#  현재 로그인 상태를 확인 -새로고침 시 로그인 상태 복원
@api_bp.route('/auth/status', methods=['GET'])
def auth_status():
    try:
        auth_header = request.headers.get('Authorization')
        current_user_id = get_user_from_token(auth_header)
        
        if not current_user_id:
            return jsonify({
                'success': False, 
                'message': 'Not authenticated',
                'is_logged_in': False
            }), 401
        
        # DB에서 사용자 정보 가져오기
        user_result = board_service.get_user_by_id(current_user_id)
        if not user_result['success']:
            session.clear()
            return jsonify({
                'success': False, 
                'message': 'User not found',
                'is_logged_in': False
            }), 401
        
        user_data = user_result['user']
        return jsonify({
            'success': True,
            'is_logged_in': True,
            'user': {
                'id': user_data['id'],
                'email': user_data['email'],
                'name': user_data['name'],
                'picture': user_data.get('picture') or user_data.get('profile_image')
            }
        })
        
    except Exception as e:
        print(f"인증 상태 확인 오류: {str(e)}")
        return jsonify({
            'success': False, 
            'error': str(e),
            'is_logged_in': False
        }), 500


# 사용자가 좋아요한 게시글 목록 조회
@api_bp.route('/user/liked-posts', methods=['GET'])
def get_user_liked_posts():
    try:
        auth_header = request.headers.get('Authorization')
        current_user_id = get_user_from_token(auth_header)
        
        if not current_user_id:
            return jsonify({
                'success': False,
                'error': '로그인이 필요합니다'
            }), 401
        
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        result = board_service.get_user_liked_posts(current_user_id, page=page, limit=limit)
        
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
        print(f"Error in /user/liked-posts: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
