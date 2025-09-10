import os
import json
from typing import Any, Dict, List, Optional

try:
    import joblib  # type: ignore
except Exception:  # pragma: no cover
    joblib = None


# Paths relative to backend/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODELS_DIR = os.path.join(BASE_DIR, 'models')
QUESTIONS_PATH = os.path.join(DATA_DIR, 'persona_questions.json')


# Caches
_MODEL = None
_LABEL_ENCODER = None
_MODEL_COLUMNS: Optional[List[str]] = None
_QUESTIONS: Optional[Dict[str, Any]] = None


def _artifact_paths() -> List[str]:
    return [
        os.path.join(MODELS_DIR, 'persona_classifier_model_k6.joblib'),
        os.path.join(BASE_DIR, 'persona_classifier_model_k6.joblib'),
    ]


def _try_import_pandas():
    try:
        import pandas as pd
        return pd
    except Exception:
        return None


def load_questions() -> Dict[str, Any]:
    global _QUESTIONS
    if _QUESTIONS is None:
        try:
            with open(QUESTIONS_PATH, 'r', encoding='utf-8') as f:
                _QUESTIONS = json.load(f)
        except Exception:
            _QUESTIONS = { 'questions': [] }
    return _QUESTIONS


def _load_artifacts():
    global _MODEL, _LABEL_ENCODER, _MODEL_COLUMNS
    if _MODEL is not None:
        return
    if joblib is None:
        return
    for p in _artifact_paths():
        try:
            if not os.path.exists(p):
                continue
            obj = joblib.load(p)
            if isinstance(obj, dict):
                _MODEL = obj.get('model')
                _LABEL_ENCODER = obj.get('label_encoder')
                cols = obj.get('columns')
                if isinstance(cols, (list, tuple)):
                    _MODEL_COLUMNS = list(cols)
            else:
                _MODEL = obj
            break
        except Exception:
            continue


def _map_simple_answers_to_feature_keys(answers: Dict[str, Any]) -> Dict[str, Any]:
    
    vmap_rvit = {'v1': 1, 'v2': 2, 'v3': 3, 'v4plus': 4}
    vmap_q1 = {'leisure': 1, 'friends': 2}
    vmap_stay = {'h1': 1, 'h2': 2, 'h3': 3, 'h4': 4, 'h5': 5}
    vmap_budget = {'c1': 1, 'c2': 2, 'c3': 3, 'c4': 4, 'c5': 4}

    def pick_col(prefix_hints: List[str], idx: int) -> Optional[str]:
        if not _MODEL_COLUMNS:
            return None
        idx_str = f"_{idx}"
        up_cols = [(c, c.upper()) for c in _MODEL_COLUMNS]
        for hint in prefix_hints:
            U = hint.upper()
            for orig, up in up_cols:
                if U in up and up.endswith(idx_str):
                    return orig
        return None

    rvit_idx = vmap_rvit.get(str(answers.get('rvit', '')).lower())
    q1_idx = vmap_q1.get(str(answers.get('q1_purpose', '')).lower())
    stay_idx = vmap_stay.get(str(answers.get('r19hap', '')).lower())
    budget_idx = vmap_budget.get(str(answers.get('cost', '')).lower())

    rvit_key = pick_col(['RVIT_'], rvit_idx) if rvit_idx else None
    q1_key = pick_col(['Q1_'], q1_idx) if q1_idx else None
    stay_key = pick_col(['R19HAP_', 'RHAP_', 'HAP_', 'STAY_'], stay_idx) if stay_idx else None
    budget_key = pick_col(['TOT2_', 'BUDGET_', 'C'], budget_idx) if budget_idx else None

    considered = answers.get('considered') or []
    considered_keys: List[str] = []
    if _MODEL_COLUMNS:
        colset = set(_MODEL_COLUMNS)
        for t in considered:
            if t in colset:
                considered_keys.append(t)
                continue
            cand = f"considered_{t}"
            if cand in colset:
                considered_keys.append(cand)
                continue
            t_up = str(t).upper()
            hits = [c for c in _MODEL_COLUMNS if t_up in c.upper()]
            if hits:
                considered_keys.append(hits[0])

    return {
        'rvit_key': rvit_key,
        'q1_key': q1_key,
        'stay_key': stay_key,
        'budget_key': budget_key,
        'considered_keys': considered_keys,
    }


def _vectorize(columns: Optional[List[str]], mapped: Dict[str, Any]):
    cols = columns or []
    feat = { c: 0 for c in cols }
    for k in ('rvit_key', 'q1_key', 'stay_key', 'budget_key'):
        ck = mapped.get(k)
        if ck in feat:
            feat[ck] = 1
    for ck in mapped.get('considered_keys') or []:
        if ck in feat:
            feat[ck] = 1

    pd = _try_import_pandas()
    if pd is not None and cols:
        return pd.DataFrame([feat]).reindex(columns=cols, fill_value=0)
    return [[feat.get(c, 0) for c in cols]]


def _persona_description(name: str) -> str:
    desc = {
        '문화 체험가': '전통·유산·박물관 등 문화 경험을 선호합니다.',
        '미식가': '현지 맛집 탐방과 다양한 음식 경험을 선호합니다.',
        '자연 힐링형': '자연 풍경 감상과 휴식을 선호합니다.',
        '액티브 모험가': '액티비티와 역동적인 체험을 즐깁니다.',
        '럭셔리 트래블러': '프리미엄 숙소와 편안한 휴식을 선호합니다.',
    }
    return desc.get(name, '')


def _recommend_destinations(label: str, activities: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    base = {
        '문화 체험가': [
            { 'name': '경주 불국사', 'description': '천년의 숨결을 느끼는 문화유산 탐방', 'image_url': '', 'activities': ['유적지', '전통체험'] },
            { 'name': '전주 한옥마을', 'description': '한옥 골목 산책과 전통문화 체험', 'image_url': '', 'activities': ['한옥', '전통체험'] },
            { 'name': '서울 국립중앙박물관', 'description': '대한민국 최대 규모의 박물관 전시', 'image_url': '', 'activities': ['박물관'] },
        ],
        '미식가': [
            { 'name': '서울 미슐랭 골목', 'description': '로컬부터 미슐랭까지 다채로운 미식 코스', 'image_url': '', 'activities': ['미식', '시장투어'] },
            { 'name': '전주 비빔밥 거리', 'description': '전통 미식의 정수, 전주의 맛', 'image_url': '', 'activities': ['미식'] },
            { 'name': '부산 자갈치 시장', 'description': '신선한 해산물 미식 경험', 'image_url': '', 'activities': ['미식', '시장'] },
        ],
        '자연 힐링형': [
            { 'name': '제주 오름', 'description': '한적한 오름 산책과 드라이브', 'image_url': '', 'activities': ['자연', '산책'] },
            { 'name': '강원 설악산', 'description': '계곡과 숲길이 어우러진 힐링 트레일', 'image_url': '', 'activities': ['등산', '트레킹'] },
            { 'name': '서울 한강공원', 'description': '도심 속 여유로운 강변 산책', 'image_url': '', 'activities': ['산책', '피크닉'] },
        ],
        '액티브 모험가': [
            { 'name': '양양 서핑', 'description': '동해 바다에서 즐기는 서핑 액티비티', 'image_url': '', 'activities': ['서핑', '액티비티'] },
            { 'name': '용인 짚라인', 'description': '스릴 넘치는 공중 활강 체험', 'image_url': '', 'activities': ['짚라인', '액티비티'] },
            { 'name': '한강 카약', 'description': '도심 속 수상 레저 경험', 'image_url': '', 'activities': ['카약', '수상'] },
        ],
        '럭셔리 트래블러': [
            { 'name': '부산 럭셔리 리조트', 'description': '오션뷰 스파와 프리미엄 다이닝', 'image_url': '', 'activities': ['스파', '휴식'] },
            { 'name': '서울 5성급 호텔', 'description': '클래식한 객실과 미식 경험', 'image_url': '', 'activities': ['호텔', '미식'] },
            { 'name': '제주 프라이빗 빌라', 'description': '프라이버시를 중시한 여유로운 휴식', 'image_url': '', 'activities': ['프라이빗', '휴식'] },
        ],
    }
    out = list(base.get(label, []))
    acts = activities or []
    if 'shopping' in acts:
        out.insert(0, { 'name': '서울(명동·강남)', 'description': '쇼핑과 트렌드의 중심지', 'image_url': '', 'activities': ['쇼핑', '도심'] })
    if 'food' in acts:
        out.insert(0, { 'name': '전주 한옥마을', 'description': '전통과 미식의 조화', 'image_url': '', 'activities': ['미식', '전통'] })
    return out[:3]


def analyze_persona(answers: Dict[str, Any]) -> Dict[str, Any]:
    """Persona analysis integrating model artifacts when available.

    Accepts UI answers with keys: rvit, q1_purpose, r19hap, cost, considered.
    """
    _load_artifacts()
    model_loaded = all([_MODEL is not None, _LABEL_ENCODER is not None])

    mapped = _map_simple_answers_to_feature_keys(answers)
    persona_name: Optional[str] = None
    scores: Dict[str, float] = {}

    if model_loaded and _MODEL_COLUMNS:
        try:
            X = _vectorize(_MODEL_COLUMNS, mapped)
            pred_ids = _MODEL.predict(X)  # type: ignore[attr-defined]
            pred_id = int(pred_ids[0]) if hasattr(pred_ids, '__getitem__') else int(pred_ids)
            try:
                persona_name = str(_LABEL_ENCODER.inverse_transform([pred_id])[0])  # type: ignore[attr-defined]
            except Exception:
                persona_name = str(pred_id)
            proba = getattr(_MODEL, 'predict_proba', None)
            if callable(proba):
                probs = proba(X)[0]
                for i, p in enumerate(probs):
                    try:
                        name_i = str(_LABEL_ENCODER.inverse_transform([i])[0])  # type: ignore[attr-defined]
                    except Exception:
                        name_i = str(i)
                    scores[name_i] = float(round(p, 4))
        except Exception:
            persona_name = None

    if not persona_name:
        cons = answers.get('considered') or []
        purpose = str(answers.get('q1_purpose') or '')
        if 'food' in cons:
            persona_name = '미식가'
        elif 'culture' in cons or 'heritage' in cons:
            persona_name = '문화 체험가'
        elif 'nature' in cons or 'relaxation' in cons:
            persona_name = '자연 힐링형'
        elif purpose == 'friends':
            persona_name = '액티브 모험가'
        else:
            persona_name = '럭셔리 트래블러'
        if not scores:
            candidates = ['문화 체험가','미식가','자연 힐링형','액티브 모험가','럭셔리 트래블러']
            for n in candidates:
                scores[n] = 0.7 if n == persona_name else round(0.3/(len(candidates)-1), 3)

    recs = _recommend_destinations(persona_name or '', activities=answers.get('considered'))

    # Build dataset-like input codes for UI
    rvit_code = mapped.get('rvit_key') or {
        'v1':'RVIT_1','v2':'RVIT_2','v3':'RVIT_3','v4plus':'RVIT_4'
    }.get(str(answers.get('rvit')))
    q1_code = mapped.get('q1_key') or {
        'leisure':'Q1_1','friends':'Q1_2'
    }.get(str(answers.get('q1_purpose')))
    stay_code = mapped.get('stay_key') or {
        'h1':'STAY_1','h2':'STAY_2','h3':'STAY_3','h4':'STAY_4','h5':'STAY_5'
    }.get(str(answers.get('r19hap')))
    budget_code = mapped.get('budget_key') or {
        'c1':'BUDGET_1','c2':'BUDGET_2','c3':'BUDGET_3','c4':'BUDGET_4','c5':'BUDGET_4'
    }.get(str(answers.get('cost')))

    return {
        'model_loaded': bool(model_loaded),
        'persona_type': persona_name,
        'persona_description': _persona_description(persona_name or ''),
        'analysis_reason': '질문 응답을 바탕으로 산출된 결과입니다.',
        'scores': scores,
        'recommended_destinations': recs,
        'inputs': {
            'rvit': rvit_code,
            'q1_purpose': q1_code,
            'stay': stay_code,
            'budget': budget_code,
            'considered': answers.get('considered') or [],
        },
    }
