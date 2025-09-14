from app import create_app
app = create_app()
with app.test_client() as c:
    rv = c.get('/api/persona/courses?ptype=%EC%86%8C%EC%8A%A4&grouped=1')
    print('STATUS', rv.status_code)
    j = rv.get_json()
    print('keys', list(j.keys()))
    print('count', len(j.get('items', [])))
