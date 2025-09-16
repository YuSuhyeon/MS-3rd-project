import os
from dotenv import load_dotenv
import pathlib
from app import create_app

# --- 1) .env 로드 (map-app → repo → backend) ---
HERE = pathlib.Path(__file__).resolve().parent         # .../backend
REPO = HERE.parent                                     # repo root
ENV_FILES = [
    REPO / "map-app" / ".env",
    REPO / ".env",
    HERE / ".env",
]
for p in ENV_FILES:
    if p.exists():
        load_dotenv(dotenv_path=str(p), override=True)

# --- 2) 앱 생성 ---
app = create_app()

if __name__ == "__main__":
    host = os.environ.get("BACKEND_HOST", "127.0.0.1")
    port = int(os.environ.get("BACKEND_PORT") or os.environ.get("PORT", "5000"))

    # 디버그/리로더를 환경변수로 제어
    debug_flag   = os.environ.get("FLASK_DEBUG", "1").lower()   in ("1", "true", "yes")
    use_reloader = os.environ.get("FLASK_USE_RELOADER", "0").lower() in ("1", "true", "yes")

    print(f"[app.py] host={host} port={port} debug={debug_flag}")
    print(f"[app.py] CWD={os.getcwd()}")

    app.run(host=host, port=port, debug=debug_flag,
            use_reloader=use_reloader, threaded=True)
