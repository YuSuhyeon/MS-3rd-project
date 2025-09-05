from flask import Blueprint, jsonify, request
from ..services import persona_service , tourism_service

api_bp = Blueprint('api', __name__)

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


@api_bp.route('/docent/chatbot', methods=['GET'])
def docent_chatbot():
    try:
        # GET 파라미터에서 query와 location 추출
        query = request.args.get('query')
        location = request.args.get('location', 'Seoul,KR')  # 기본값: Seoul,KR
        
        # query 파라미터 검증
        if not query:
            return jsonify({
                'error': 'query 파라미터가 필요합니다.',
                'message': 'query parameter is required'
            }), 400
        
        if not query.strip():
            return jsonify({
                'error': '빈 질문은 처리할 수 없습니다.',
                'message': 'Empty query is not allowed'
            }), 400
        
        # 서비스 호출
        result = tourism_service.get_tourism_info(query, location)
        
        if result is None:
            return jsonify({
                'error': '관광 정보를 가져오는데 실패했습니다.',
                'message': 'Failed to get tourism information'
            }), 500
        
        # 성공 응답
        return jsonify({
            'success': True,
            'query': query,
            'location': location,
            'answer': result
        }), 200
        
    except Exception as e:
        # 예외 처리
        return jsonify({
            'error': '서버 내부 오류가 발생했습니다.',
            'message': str(e)
        }), 500

@api_bp.route('/docent/chatbot', methods=['POST'])
def docent_chatbot_post():
    try:
        # JSON 데이터 추출
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'JSON 데이터가 필요합니다.',
                'message': 'JSON data is required'
            }), 400
        
        query = data.get('query')
        location = data.get('location', 'Seoul,KR')
        
        # query 검증
        if not query:
            return jsonify({
                'error': 'query 필드가 필요합니다.',
                'message': 'query field is required'
            }), 400
        
        if not query.strip():
            return jsonify({
                'error': '빈 질문은 처리할 수 없습니다.',
                'message': 'Empty query is not allowed'
            }), 400
        
        # 서비스 호출
        result = tourism_service.get_tourism_info(query, location)
        
        if result is None:
            return jsonify({
                'error': '관광 정보를 가져오는데 실패했습니다.',
                'message': 'Failed to get tourism information'
            }), 500
        
        # 성공 응답
        return jsonify({
            'success': True,
            'query': query,
            'location': location,
            'answer': result
        }), 200
        
    except Exception as e:
        # 예외 처리
        return jsonify({
            'error': '서버 내부 오류가 발생했습니다.',
            'message': str(e)
        }), 500

