from flask_login import UserMixin, LoginManager, login_user, logout_user, login_required
import os
from flask import Flask, render_template, session, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash



basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config['SECRET_KEY'] = 'hard to guess string'
app.config['SQLALCHEMY_DATABASE_URI'] =\
    'sqlite:///' + os.path.join(basedir, 'data.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


login_manager = LoginManager()
login_manager.session_protection = 'strong'
login_manager.login_view = 'login'
login_manager.init_app(app)

class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True)
    users = db.relationship('User', backref='role')
    
    def __repr__(self):
        return '<Role %r>' % self.name


class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(64), unique=True, index=True)
    username = db.Column(db.String(64), unique=True, index=True)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))
    password_hash = db.Column(db.String(128))
     
    @property
    def password(self):
        raise AttributeError("Not accessible")
        
    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)
        
    def __repr__(self):
        return '<User %r>' % self.username




@login_manager.user_loader
def load_user(user_id):
    print(user_id)
    return User.query.get(int(user_id))

@app.route('/login')
def login():
    name, passw = 'Neta', 'adminadmin'
    user = User.query.filter_by(username=name).first()
    if user is not None and user.verify_password(passw):
        login_user(user)
        return redirect(url_for('secret'))
    return 'Invalid username or password'
  
@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))
  
@app.route('/secret')
@login_required
def secret():
    return 'Secret, only for authenticated user...'
  

@app.route('/home')
def home():
    return 'Welcome Home!'

@app.route('/')
def index():
	return 'Please login first'
		
if __name__ == "__main__":
	app.run()