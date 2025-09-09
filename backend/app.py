import os
from app import create_app

# 선택적으로 .env 파일을 로드해 백엔드 포트/호스트를 제어
try:
    from dotenv import load_dotenv
    import pathlib
    here = pathlib.Path(__file__).resolve().parent
    repo_root = here.parent
    # 우선순위: backend/.env -> repo root/.env -> map-app/.env
    for p in [repo_root / 'backend' / '.env', repo_root / '.env', repo_root / 'map-app' / '.env']:
        if p.exists():
            load_dotenv(dotenv_path=str(p), override=False)
except Exception:
    pass

app = create_app()

if __name__ == '__main__':
    host = os.environ.get('BACKEND_HOST', '127.0.0.1')
    port = int(os.environ.get('BACKEND_PORT') or os.environ.get('PORT', '5001'))
    app.run(host=host, port=port, debug=True)
