from flask import Flask, redirect, url_for, abort
from werkzeug.debug import get_current_traceback
app = Flask(__name__)

@app.errorhandler(404)
def page_not_found(e):
    return '404 Not Found', 404
	
@app.errorhandler(500)
def internal_error(e):
    return "500 Error"
	
@app.route('/')
def index():
    try:
        raise Exception("Can't connect to database")
    except Exception:
        track = get_current_traceback(skip=1, show_hidden_frames=True, 
            ignore_system_exceptions=False)
        track.log()
        abort(500)

if __name__ == '__main__':
	app.run()