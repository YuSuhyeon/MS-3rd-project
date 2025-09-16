import os
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)

    # 세션/서명키
    app.secret_key = os.environ.get("SECRET_KEY", "dev-secret")

    # CORS: 프론트 로컬 환경 허용
    CORS(
        app,
        resources={r"/api/*": {"origins": [
            "http://localhost:3000", "http://127.0.0.1:3000",
            "http://localhost:5000", "http://127.0.0.1:5000",
        ]}},
        supports_credentials=True,
    )

    # API 블루프린트 등록
    from .api.routes import api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    @app.route("/healthz")
    def healthz():
        return {"status": "ok"}

    return app
