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


class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True)
    users = db.relationship('User', backref='role')
    
    def __repr__(self):
        return '<Role %r>' % self.name


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, index=True)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))

    
    def __repr__(self):
        return '<User %r>' % self.username


@app.route('/set_user/<name>')
def set_user(name):
	user = User.query.filter_by(username=name).first()
	if user is None:
		user = User(username=name)
		db.session.add(user)
		db.session.commit()
		session['already_exists'] = False
		session['user'] = name
	else:
		session['already_exists'] = True
	return redirect(url_for('index'))

@app.route('/')
def index():
	if session['already_exists'] is True:
		return 'User already exists'
	else:
		return 'Hello ' + session['user']
		
if __name__ == "__main__":
	app.run()