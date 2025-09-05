import os
from app import create_app

# app 폴더의 __init__.py에 있는 create_app 함수를 호출하여
# 모든 설정과 경로가 등록된 Flask 앱을 가져옵니다.
app = create_app()



if __name__ == '__main__':
    port = int(os.environ.get('PORT', '5001'))
    app.run(host='127.0.0.1', port=port, debug=True)
