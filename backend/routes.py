import datetime
import os
import secrets
from PIL import Image
from flask import url_for, request, abort, jsonify, make_response
from backend import app, db, bcrypt, login_manager, geolocator
from backend.models import User, Posts, Follow, Subscribe, Notification
from flask_login import login_user, current_user, logout_user, login_required
from flask_jwt_extended import (create_access_token)
import datetime


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


def save_picture(form_picture):
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(form_picture.filename)
    picture_fn = random_hex + f_ext
    picture_path = os.path.join(app.root_path, 'static/profile_pics', picture_fn)

    output_size = (125, 125)
    i = Image.open(form_picture)
    i.thumbnail(output_size)
    i.save(picture_path)
    return picture_fn


@app.errorhandler(404)
def not_found(error):
    return make_response((jsonify({'error': 'Not Found'})), 404)


@app.errorhandler(400)
def bad_request(error):
    return make_response((jsonify({'error': 'Bad Request'})), 400)


@app.errorhandler(403)
def forbidden(error):
    return make_response((jsonify({'error': 'Forbidden'})), 403)


@app.route("/users/<int:user_id>", methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    image_file = url_for('static', filename='profile_pics/' + user.image_file)

    return jsonify({'username': user.username, 'first_name': user.first_name, 'last_name': user.last_name,
                    'gender': user.gender, 'birth_date': user.birth_date, 'email': user.email,
                    'image_file': image_file, 'followers': len(user.followers.all()),
                    'followed': len(user.followed.all())})


@app.route("/user/<string:name>", methods=['GET'])
def get_user_id(name):
    user = User.query.filter_by(username=name).first()
    if not user:
        abort(404)
    return jsonify({'id': user.id})


@app.route("/user/new", methods=['POST'])
def register():
    if current_user.is_authenticated:
        abort(400)
    data = request.get_json()

    if not data or not 'password' in data or not 'username' in data or not 'first_name' in data \
            or not 'last_name' in data or not 'gender' in data or not 'birth_date' in data or not 'email' in data:
        abort(400)
    check_user = User.query.filter_by(email=data['email']).first()
    if check_user:
        return 'Email Taken'
    check_user = User.query.filter_by(username=data['username']).first()
    if check_user:
        return 'Username Taken'
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(username=data['username'], first_name=data['first_name'], last_name=data['last_name'],
                gender=data['gender'], birth_date=datetime.datetime.now(), email=data['email'], password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return 'Created'


@app.route('/users/<int:user_id>', methods=['PUT'])
@login_required
def user_update(user_id):
    updated_user = request.get_json()
    user = User.query.get_or_404(user_id)
    user_by_username = User.query.filter_by(username=updated_user['username']).first()
    user_by_email = User.query.filter_by(email=updated_user['email']).first()
    if user_by_username and user.id != user_by_username.id and user_by_username.username == updated_user['username']:
        return 'Username Taken'
    if user_by_email and user.id != user_by_email.id and user_by_email.email == updated_user['email']:
        return 'Email Taken'
    user.birth_date = updated_user['birth_date']
    user.email = updated_user['email']
    user.first_name = updated_user['first_name']
    user.last_name = updated_user['last_name']
    user.gender = updated_user['gender']
    user.username = updated_user['username']
    db.session.add(user)
    db.session.commit()
    return 'Updated'


@app.route("/login", methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        abort(404)
    user_data = request.get_json()
    if not user_data or not 'password' in user_data or not 'email' in user_data:
        abort(400)

    user = User.query.filter_by(email=user_data['email']).first()
    if user and bcrypt.check_password_hash(user.password, user_data['password']):
        login_user(user, remember=True)
        access_token = create_access_token(identity={'id': user.id})
        result = access_token
    else:
        abort(400)

    return result


@app.route("/logout", methods=['GET'])
@login_required
def logout():
    print('logging out')
    logout_user()
    return 'Logged Out', 201


@app.route('/is_following/<int:user_id>', methods=['GET'])
@login_required
def is_following(user_id):
    user = User.query.get_or_404(user_id)

    if current_user.is_following(user):
        return 'True'
    return 'False'


@app.route('/is_following_me/<int:user_id>', methods=['GET'])
@login_required
def is_following_me(user_id):
    user = User.query.get_or_404(user_id)

    if user.is_following(current_user):
        return 'True'
    return 'False'


@app.route('/follow/<int:user_id>', methods=['POST', 'DELETE'])
@login_required
def follow(user_id):
    user = User.query.get_or_404(user_id)
    if not current_user.is_following(user):
        current_user.follow(user)
    else:
        current_user.unfollow(user)

    db.session.commit()
    return 'True'


@app.route("/addPost", methods=['POST'])
@login_required
def addPost():
    print('what')
    data = request.get_json()
    if not data or not 'title' in data or not 'content' in data:
        abort(400)

    post = Posts(title=data['title'], date_posted=datetime.datetime.now(), start_date=data['startDate'],
                 end_date=data['endDate'], country=data['country'], city=data['city'], content=data['content']
                 , latitude=5, longitude=5, traveler=current_user)
    db.session.add(post)
    db.session.commit()
    return 'Created'


@app.route("/deletePost/<int:post_id>", methods=['DELETE'])
@login_required
def deletePost(post_id):
    post = Posts.query.get_or_404(post_id)
    if post.user_id != current_user.id:
        return 'Not user post'
    subscribers = post.subscribers
    for sub in subscribers:
        notification = Notification(user_id=sub.user_id, post_id=post.id, timestamp=atetime.datetime.now(),
                                    kind="delete")
        db.session.add(notification)
    db.session.delete(post)
    db.session.commit()
    return 'True'


@app.route("/deleteAccount/<int:user_id>", methods=['DELETE'])
def deleteAccount(user_id):
    print('hello')
    user = User.query.get_or_404(user_id)
    print(user_id)
    print(user.id)
    print('hi')
    db.session.delete(user)
    print('bye')
    db.session.commit()
    print('see u')
    return 'True'


def date_between(start_date, end_date, start_date_arg, end_date_arg):
    start_date_arg_converted = datetime.datetime.strptime(start_date_arg.split('T')[0], '%Y-%m-%d').date()
    end_date_arg_converted = datetime.datetime.strptime(end_date_arg.split('T')[0], '%Y-%m-%d').date()

    if start_date.date() <= end_date_arg_converted:
        return end_date.date() >= start_date_arg_converted
    return False

