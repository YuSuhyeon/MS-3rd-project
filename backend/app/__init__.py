from flask import Flask, send_from_directory
from flask_cors import CORS
import os
 
def create_app():
   
    here = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(os.path.dirname(here))
    react_build = os.path.join(repo_root, 'map-app', 'build')
 
    if os.path.isdir(react_build):  
        app = Flask(__name__, static_folder=os.path.join(react_build, 'static'), static_url_path='/static')
    else:
        app = Flask(__name__)
   
     # 세션 사용을 위한 시크릿 키 설정
    app.secret_key = os.getenv('FLASK_SECRET_KEY', 'microsoft1aiscchool2team3finalaproject4tripadvisor250909')
       
    #CORS(app)  2025.09.09 CORS 설정 추가를 위해 주석 처리함    
    # 개발 환경에서 여러 포트 허용
    allowed_origins = [
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        'http://127.0.0.1:5000',
        'http://localhost:5000'
        
    ]
   
    # 환경변수에서 추가 origin 가져오기
    frontend_origin = os.getenv('FRONTEND_URL')
    if frontend_origin and frontend_origin not in allowed_origins:
        allowed_origins.append(frontend_origin)
   
    CORS(app,
         origins=allowed_origins,  
         supports_credentials=True
    )  
 
   
    app.config['JSON_AS_ASCII'] = False
 
    from .api.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
 
    if os.path.isdir(react_build):
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve_spa(path):
            target = os.path.join(react_build, path)
            if path and os.path.exists(target) and os.path.isfile(target):
                return send_from_directory(react_build, path)
            return send_from_directory(react_build, 'index.html')
 
    return app
 
 
 