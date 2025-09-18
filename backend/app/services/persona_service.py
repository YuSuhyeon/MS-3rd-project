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


# Canonical 6 persona labels (K6)
K6_LABELS = [
    '알뜰 필수코스 정복자',
    '플렉스 장기 체류객',
    '관계 중심 체류객',
    '실속파 쇼핑 원정대',
    '문화유산 탐험가',
    '미니멀 K-컬처 팬',
]


def _canonicalize_persona(name_or_id: Any) -> Optional[str]:
    try:
        if isinstance(name_or_id, (int, float)) or (isinstance(name_or_id, str) and name_or_id.isdigit()):
            idx = int(name_or_id)
            if 0 <= idx < len(K6_LABELS):
                return K6_LABELS[idx]
    except Exception:
        pass
    s = str(name_or_id or '').strip()
    if s in K6_LABELS:
        return s
    # Legacy labels → K6
    legacy = {
        '문화 체험가': '문화유산 탐험가',
        '미식가': '알뜰 필수코스 정복자',
        '자연 힐링러': '알뜰 필수코스 정복자',
        '액티비티 모험가': '미니멀 K-컬처 팬',
        '럭셔리 트래블러': '플렉스 장기 체류객',
    }
    return legacy.get(s)


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
    # raw answers from UI
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
    if not columns:
        return [[0]]
    cols = list(columns)
    feat: Dict[str, int] = {c: 0 for c in cols}

    for ck in ('rvit_key', 'q1_key', 'stay_key', 'budget_key'):
        c = mapped.get(ck)
        if c and c in feat:
            feat[c] = 1
    for ck in mapped.get('considered_keys') or []:
        if ck in feat:
            feat[ck] = 1

    pd = _try_import_pandas()
    if pd is not None and cols:
        return pd.DataFrame([feat]).reindex(columns=cols, fill_value=0)
    return [[feat.get(c, 0) for c in cols]]


def _persona_description(name: str) -> str:
    desc = {
        '알뜰 필수코스 정복자': '서울 핵심 랜드마크와 필수코스를 효율적으로 즐기는 타입입니다.',
        '플렉스 장기 체류객': '프리미엄 숙소와 여유로운 일정으로 깊이 있게 머무는 타입입니다.',
        '관계 중심 체류객': '가족·친구·연인과 함께 소통하며 추억을 쌓는 타입입니다.',
        '실속파 쇼핑 원정대': '합리적인 쇼핑 스팟을 전략적으로 공략하는 타입입니다.',
        '문화유산 탐험가': '궁·박물관·전통 골목 등 문화유산을 탐구하는 타입입니다.',
        '미니멀 K-컬처 팬': 'K-POP/드라마/공연 등 한류 문화를 가볍고 알차게 즐기는 타입입니다.',
    }
    return desc.get(name, '')


def _recommend_destinations(label: str, activities: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    # CSV 기반 스팟을 별도 섹션에서 렌더링하므로 여기서는 비워 둡니다.
    return []


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
                raw = _LABEL_ENCODER.inverse_transform([pred_id])[0]  # type: ignore[attr-defined]
            except Exception:
                raw = pred_id
            persona_name = _canonicalize_persona(raw) or _canonicalize_persona(pred_id) or None
            proba = getattr(_MODEL, 'predict_proba', None)
            if callable(proba):
                probs = proba(X)[0]
                for i, p in enumerate(probs):
                    label_i = _canonicalize_persona(i)
                    if label_i:
                        scores[label_i] = float(round(p, 4))
        except Exception:
            persona_name = None

    # Heuristic fallback (when model missing or fails)
    if not persona_name:
        cons = set(answers.get('considered') or [])
        purpose = str(answers.get('q1_purpose') or '')
        stay = str(answers.get('r19hap') or '')
        budget = str(answers.get('cost') or '')
        if stay in ('h4','h5') or budget in ('c4','c5'):
            persona_name = '플렉스 장기 체류객'
        elif 'shopping' in cons:
            persona_name = '실속파 쇼핑 원정대'
        elif any(x in cons for x in ('kpop','arts','festival','nightlife')):
            persona_name = '미니멀 K-컬처 팬'
        elif any(x in cons for x in ('culture','heritage','museum','tradition')):
            persona_name = '문화유산 탐험가'
        elif purpose == 'friends':
            persona_name = '관계 중심 체류객'
        else:
            persona_name = '알뜰 필수코스 정복자'
        if not scores:
            for n in K6_LABELS:
                scores[n] = 0.7 if n == persona_name else round(0.3/(len(K6_LABELS)-1), 3)

    # Canonicalize again for safety
    persona_name = _canonicalize_persona(persona_name) or persona_name

    # Build code-style inputs for UI (humanize mapping on frontend expects these)
    rvit_code = { 'v1':'RVIT_1','v2':'RVIT_2','v3':'RVIT_3','v4plus':'RVIT_4' }.get(str(answers.get('rvit')))
    q1_code = { 'leisure':'Q1_1','friends':'Q1_2' }.get(str(answers.get('q1_purpose')))
    stay_code = { 'h1':'STAY_1','h2':'STAY_2','h3':'STAY_3','h4':'STAY_4','h5':'STAY_5' }.get(str(answers.get('r19hap')))
    budget_code = { 'c1':'BUDGET_1','c2':'BUDGET_2','c3':'BUDGET_3','c4':'BUDGET_4','c5':'BUDGET_4' }.get(str(answers.get('cost')))

    recs = _recommend_destinations(persona_name or '', activities=answers.get('considered'))

    return {
        'model_loaded': bool(model_loaded),
        'persona_type': persona_name,
        'persona_description': _persona_description(persona_name or ''),
        'analysis_reason': '질문 응답을 바탕으로 도출된 결과입니다.',
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

