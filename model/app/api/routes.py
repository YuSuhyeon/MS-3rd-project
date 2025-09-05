from flask import Blueprint, jsonify, request
# 'services' 폴더의 전문가(persona_service)를 호출합니다.
from ..services import persona_service

# 'api' 라는 이름의 블루프린트(부서)를 만듭니다.
api_bp = Blueprint('api', __name__)

@api_bp.route('/persona/questions', methods=['GET'])
def get_questions():
    """
    페르소나 분석에 필요한 질문 목록을 반환하는 API
    """
    # 실제 질문을 로드하는 작업은 persona_service에게 위임합니다.
    questions = persona_service.load_questions()
    return jsonify(questions)


@api_bp.route('/persona/analyze', methods=['POST'])
def analyze():
    """
    사용자의 답변을 받아 페르소나를 분석하고 결과를 반환하는 API
    """
    # 1. 프론트엔드에서 보낸 JSON 데이터를 받습니다.
    payload = request.get_json(force=True, silent=True) or {}
    answers = payload.get('answers') or {}

    # 2. 실제 분석 작업은 persona_service에게 위임합니다.
    result = persona_service.analyze_persona(answers)

    # 3. 받은 결과를 JSON 형태로 프론트엔드에 전달합니다.
    return jsonify(result)

