from flask import Flask, session, redirect, url_for
app = Flask(__name__)
app.config['SECRET_KEY'] = 'somesecret string'


@app.route('/')
def index():
    if 'username' in session:
        return 'Logged in as ' + session['username']
    else:
        return 'Not logged in'

@app.route('/login/<name>')
def login(name):
    session['username'] = name
    return redirect(url_for('index'))
    
if __name__ == "__main__":
    app.run(debug=True)