import os
import requests
from dotenv import load_dotenv
from flask import Blueprint, jsonify, request
from ..services import persona_service
# from ..services import persona_service , tourism_service

api_bp = Blueprint('api', __name__)


load_dotenv()
AZURE_VISION_ENDPOINT = os.getenv('AZURE_VISION_ENDPOINT')
AZURE_VISION_KEY = os.getenv('AZURE_VISION_KEY')
# Azure Computer Vision OCR API
@api_bp.route('/vision/ocr', methods=['POST'])
def ocr_image():
    api_version = '2024-02-01'
    features = 'read'
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
    

    return jsonify({'error': 'No image_file provided'}), 400

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


#