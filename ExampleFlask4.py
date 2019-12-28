from flask import Flask, session, redirect, url_for, request, make_response
app = Flask(__name__)
app.config['SECRET_KEY'] = 'somesecret string'


@app.route('/set_cookie/<value>')
def set_cookie(value):
    resp = make_response('Cookie set', 200)
    resp.set_cookie('value', value)
    return resp

@app.route('/get_cookie')
def get_cookie():
    value = request.cookies.get('value')
    return 'Your cookie is ' + value
    
if __name__ == "__main__":
    app.run(debug=True)