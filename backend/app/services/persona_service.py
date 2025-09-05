import os
import json
import joblib

# --- 경로 설정 (파일 위치가 바뀌었으므로 경로 계산 수정) ---

# os.path.abspath(__file__) -> 현재 파일의 절대 경로
# os.path.dirname(...) -> 폴더 경로 ('services')
# os.path.dirname(...) -> 한 단계 위 폴더 경로 ('app')
# os.path.dirname(...) -> 또 한 단계 위 폴더 경로 ('backend')
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODELS_DIR = os.path.join(BASE_DIR, 'models')
QUESTIONS_PATH = os.path.join(DATA_DIR, 'persona_questions.json')
MODEL_PATH = os.path.join(MODELS_DIR, 'persona_classifier_model_k6.joblib')

# --- 전역 변수 ---
# 메모리 효율을 위해 모델과 질문은 한번만 로드합니다.
_PERSONA_MODEL = None
_QUESTIONS = None


def load_questions():
    global _QUESTIONS
    if _QUESTIONS is None:
        try:
            with open(QUESTIONS_PATH, 'r', encoding='utf-8') as f:
                _QUESTIONS = json.load(f)
        except Exception as e:
            # 파일이 없거나 오류 발생 시 기본값 반환
            _QUESTIONS = { 'questions': [] }
    return _QUESTIONS


def load_model():
    global _PERSONA_MODEL
    if _PERSONA_MODEL is None:
        try:
            _PERSONA_MODEL = joblib.load(MODEL_PATH)
        except Exception as e:
            # 모델 파일이 없거나 오류 발생 시 None 반환
            _PERSONA_MODEL = None
    return _PERSONA_MODEL


# --- 피처 엔지니어링 관련 설정 및 함수 ---
CATS_RVIT = ['v1','v2','v3','v4plus']
CATS_Q1 = ['leisure','friends']
CATS_R19HAP = ['h1','h2','h3','h4','h5']
CATS_COST = ['c1','c2','c3','c4','c5']
CATS_CONSIDERED = ['food','shopping','nature','relaxation','heritage','tradition','museum','kpop','arts','festival','nightlife','themepark','beauty','medical','sports_view','sports_play','other']

PERSONA_LABELS = ['문화 탐험가', '미식가', '자연 힐링러', '액티브 모험가', '럭셔리 트래블러']

ACT_LABEL = {
    'food':'식도락관광','shopping':'쇼핑','nature':'자연경관감상','relaxation':'휴양/휴식','heritage':'고궁/역사유적지',
    'tradition':'전통문화체험','museum':'박물관/전시관','kpop':'K-POP/한류체험','arts':'공연관람','festival':'지역축제',
    'nightlife':'유흥','themepark':'놀이공원/테마파크','beauty':'뷰티/미용 관광','medical':'치료/건강검진','sports_view':'스포츠/레포츠 관람','sports_play':'스포츠/레포츠 참가','other':'기타'
}

def one_hot(value, categories):
    return [1 if value == c else 0 for c in categories]

def multi_hot(values, categories):
    values = values or []
    return [1 if c in values else 0 for c in categories]

def encode_answers(answers: dict):
    rvit_vec = one_hot(answers.get('rvit'), CATS_RVIT)
    q1_vec = one_hot(answers.get('q1_purpose'), CATS_Q1)
    r19_vec = one_hot(answers.get('r19hap'), CATS_R19HAP)
    cost_vec = one_hot(answers.get('cost'), CATS_COST)
    considered_vec = multi_hot(answers.get('considered'), CATS_CONSIDERED)
    vec = rvit_vec + q1_vec + r19_vec + cost_vec + considered_vec
    answers['_vector_length'] = len(vec)
    return vec


def build_recommendations(label: str, activities: list):
    base = {
        '문화 탐험가': [
            { 'name': '경주', 'description': '신라 천년 고도의 매력', 'image_url': '', 'activities': ['사적지 투어','전통체험'] },
            { 'name': '전주', 'description': '한옥마을과 미식', 'image_url': '', 'activities': ['한옥 산책','미식 투어'] },
        ],
        '미식가': [
            { 'name': '서울', 'description': '골목맛집부터 파인다이닝까지', 'image_url': '', 'activities': ['미식 투어','시장 탐방'] },
            { 'name': '전주', 'description': '비빔밥과 한식 미식', 'image_url': '', 'activities': ['미식 투어'] },
        ],
        '자연 힐링러': [
            { 'name': '제주', 'description': '자연과 함께하는 힐링', 'image_url': '', 'activities': ['오름 트레킹','해안 드라이브'] },
            { 'name': '강원', 'description': '숲과 계곡의 청량함', 'image_url': '', 'activities': ['숲 산책','릴렉스 스파'] },
        ],
        '액티브 모험가': [
            { 'name': '양양', 'description': '서핑과 액티비티', 'image_url': '', 'activities': ['서핑','패러글라이딩'] },
            { 'name': '단양', 'description': '레포츠 천국', 'image_url': '', 'activities': ['레프팅','짚라인'] },
        ],
        '럭셔리 트래블러': [
            { 'name': '부산', 'description': '럭셔리 마리나&리조트', 'image_url': '', 'activities': ['요트','스파'] },
            { 'name': '제주', 'description': '럭셔리 풀빌라', 'image_url': '', 'activities': ['풀빌라','미식'] },
        ],
    }
    recs = base.get(label, [])
    if 'shopping' in (activities or []):
        recs.insert(0, { 'name': '서울(명동·강남)', 'description': '쇼핑과 야경, 트렌드의 중심', 'image_url': '', 'activities': ['쇼핑','야경'] })
    if 'food' in (activities or []):
        recs.insert(0, { 'name': '전주(한옥마을)', 'description': '전통과 미식의 조화', 'image_url': '', 'activities': ['미식','한옥'] })
    return recs[:3]


def analyze_persona(answers: dict):
    """
    답변 딕셔너리를 받아 페르소나 분석 결과를 반환하는 핵심 서비스 함수.
    """
    x = encode_answers(answers)
    model = load_model()
    scores = None
    model_loaded = model is not None

    if model is not None:
        try:
            if hasattr(model, 'predict_proba'):
                proba = model.predict_proba([x])[0]
                idx = int(max(range(len(proba)), key=lambda i: proba[i]))
                k = min(len(PERSONA_LABELS), len(proba))
                scores = { PERSONA_LABELS[i]: float(proba[i]) for i in range(k) }
            else:
                pred = model.predict([x])
                idx = int(pred[0]) if hasattr(pred, '__getitem__') else int(pred)
        except Exception:
            idx = 0  # 모델 추론 실패 시 기본값
    else:
        # 모델이 없을 경우를 대비한 간단한 규칙 기반 대체 로직
        style = answers.get('travel_style')
        if style == 'cultural': idx = 0
        elif style == 'luxury': idx = 4
        elif style in ('adventurous', 'adventure'): idx = 3
        elif style in ('relaxed', 'relaxation', 'nature'): idx = 2
        else: idx = 1

    label = PERSONA_LABELS[idx % len(PERSONA_LABELS)]
    activities = answers.get('considered') or []

    if scores is None:
        scores = { l: (0.7 if l == label else 0.075) for l in PERSONA_LABELS }

    # 최종 결과를 구성합니다.
    result = {
        'persona_type': label,
        'persona_description': {
            '문화 탐험가': '역사와 전통을 사랑하고 깊이 있는 경험을 선호합니다.',
            '미식가': '지역 미식과 로컬 푸드를 탐방합니다.',
            '자연 힐링러': '자연 속에서 휴식과 재충전을 즐깁니다.',
            '액티브 모험가': '액티비티와 도전을 즐기는 스타일입니다.',
            '럭셔리 트래블러': '프리미엄 서비스와 편안함을 추구합니다.'
        }.get(label, ''),
        'analysis_reason': '질문 응답을 바탕으로 모델이 추정한 페르소나입니다.',
        'scores': scores,
        'inputs': {
            'rvit': {'v1':'1회','v2':'2회','v3':'3회','v4plus':'4회 이상'}.get(answers.get('rvit')),
            'q1_purpose': {'leisure':'여가/위락/개별휴가', 'friends':'친구/친지 방문'}.get(answers.get('q1_purpose')),
            'stay': {'h1':'2~3일','h2':'4~7일','h3':'8~15일','h4':'16~30일','h5':'31일 이상'}.get(answers.get('r19hap')),
            'cost': {'c1':'$1,000 미만','c2':'$1,000~$2,000','c3':'$2,000~$3,000','c4':'$3,000~$5,000','c5':'$5,000 이상'}.get(answers.get('cost')),
            'considered': [ACT_LABEL.get(a, a) for a in (answers.get('considered') or [])]
        },
        'recommended_destinations': build_recommendations(label, activities),
        'model_loaded': model_loaded,
        'vector_length': answers.get('_vector_length')
    }
    return result

