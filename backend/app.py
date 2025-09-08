import os
from app import create_app

# create_app() 함수에서 이미 모든 blueprint가 등록됩니다
app = create_app()



if __name__ == '__main__':
    port = int(os.environ.get('PORT', '8000'))
    app.run(host='127.0.0.1', port=port, debug=True)