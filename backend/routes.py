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
from sqlalchemy import desc


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


@app.route("/image/<int:user_id>", methods=['PUT'])
def update_img(user_id):
    user = User.query.get_or_404(user_id)
    img_data = request.files['file']
    user.image_file = save_picture(img_data)
    db.session.add(user)
    db.session.commit()
    return jsonify({"image_file": url_for('static', filename='profile_pics/' + user.image_file)})



@app.route("/user/<string:name>", methods=['GET'])
def get_user_id(name):
    user = User.query.filter_by(username=name).first()
    if not user:
        abort(404)
    return jsonify({'id': user.id})


@app.route("/userDetails/<string:name>", methods=['GET'])
def get_user_details(name):
    user = User.query.filter_by(username=name).first()
    if not user:
        abort(404)
    return jsonify({'first': user.first_name, 'last': user.last_name})

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
                gender=data['gender'], birth_date=data['birth_date'], email=data['email'], password=hashed_password)
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


@app.route('/followers/<int:user_id>', methods=['GET'])
@login_required
def following_me(user_id):
    followers = []
    for cur_follow in Follow.query.filter_by(followed_id=user_id).all():
        image_file = url_for('static', filename='profile_pics/' + cur_follow.follower.image_file)
        cur_follower = cur_follow.follower
        followers.append({'image_file': image_file, 'id': cur_follower.id, 'username': cur_follower.username})
    return jsonify({'followers': followers})


@app.route('/following/<int:user_id>', methods=['GET'])
@login_required
def followed_by_me(user_id):
    followed = []
    for cur_follow in Follow.query.filter_by(follower_id=user_id).all():
        image_file = url_for('static', filename='profile_pics/' + cur_follow.followed.image_file)
        cur_followed = cur_follow.followed
        followed.append({'image_file': image_file, 'id': cur_followed.id, 'username': cur_followed.username})
    return jsonify({'following': followed})


@app.route('/getMarkers', methods=['GET'])
@login_required
def get_markers():
    markers = []
    descriptions = []
    lat = float(request.args.get('lat'))
    lng = float(request.args.get('lng'))
    radius = float(request.args.get('radius'))
    start_date = request.args.get('start')
    end_date = request.args.get('end')
    if request.args.get('onlyFollowing') == 'true':
        for cur_post in Posts.query.all():
            cur_user = User.query.get_or_404(cur_post.user_id)
            if current_user.is_following(cur_user):
                markers.append({'lat': cur_post.latitude, 'lng': cur_post.longitude})
                descriptions.append({'title': cur_post.title, 'user_name': cur_user.username,
                                     'endDate': cur_post.end_date, 'startDate': cur_post.start_date,
                                     'is_following': current_user.is_following(cur_user)})
        return jsonify({'markers': markers, 'descriptions': descriptions})

    for cur_post in Posts.query.all():
        if current_user.id == cur_post.user_id:
            continue
        cur_user = User.query.get_or_404(cur_post.user_id)
        if current_user.is_following(cur_user) or (cur_post.is_in_radius(lat, lng, radius) and
                                                   date_between(cur_post.start_date, cur_post.end_date,start_date, end_date)):
            markers.append({'lat': cur_post.latitude, 'lng': cur_post.longitude})
            descriptions.append({'title': cur_post.title, 'user_name': cur_user.username,
                                           'endDate': cur_post.end_date, 'startDate': cur_post.start_date,
                                           'is_following': current_user.is_following(cur_user)})
    return jsonify({'markers': markers,  'descriptions': descriptions})


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
    data = request.get_json()
    if not data or not 'title' in data or not 'content' in data or not 'startDate'in data or not 'endDate' in data\
            or not 'city' in data or not 'longitude' in data or not 'latitude' in data:
        abort(400)

    post = Posts(title=data['title'], date_posted=datetime.datetime.utcnow(), start_date=data['startDate'],
                 end_date=data['endDate'], country=data['country'], city=data['city'], content=data['content']
                 , latitude=data['latitude'], longitude=data['longitude'], traveler=current_user)
    db.session.add(post)
    db.session.commit()
    return 'Created'


@app.route("/deletePost/<int:post_id>", methods=['DELETE'])
@login_required
def deletePost(post_id):
    print('got here!')
    post = Posts.query.get_or_404(post_id)
    if post.user_id != current_user.id:
        return 'Not user post'
    db.session.delete(post)
    db.session.commit()
    return 'True'


@app.route("/posts", methods=['GET'])
@login_required
def get_posts():
    all_posts = []
    if current_user.is_authenticated:
        user = User.query.get_or_404(current_user.id)
        for post in (Posts.query.filter_by(traveler=current_user).union\
                    (Posts.query.join(Posts.traveler, aliased=True).join(User.followers, aliased=True)
                             .filter_by(follower_id=user.id))).order_by(desc(Posts.date_posted)).all():
            image_file = url_for('static', filename='profile_pics/' + post.traveler.image_file)
            all_posts.append({'id': post.id, 'title': post.title, 'date_posted': post.date_posted, 'user_id': post.user_id,
                                'user_name': post.traveler.username, 'user_image': image_file,
                              'start_date': post.start_date, 'end_date': post.end_date, 'country': post.country,
                              'city': post.city, 'latitude': post.latitude, 'longitude': post.longitude, 'content': post.content})

    return jsonify(all_posts)


@app.route("/my_posts/<int:user_id>", methods=['GET'])
def get_my_posts(user_id):
    all_posts = []
    traveler = User.query.get_or_404(user_id)
    for post in Posts.query.filter_by(traveler=traveler).order_by(desc(Posts.date_posted)).all():
        image_file = url_for('static', filename='profile_pics/' + post.traveler.image_file)
        all_posts.append({'id': post.id, 'title': post.title, 'date_posted': post.date_posted, 'user_id': post.user_id,
                            'user_name': post.traveler.username, 'user_image': image_file,
                          'start_date': post.start_date, 'end_date': post.end_date, 'country': post.country,
                          'city': post.city, 'latitude': post.latitude, 'longitude': post.longitude, 'content': post.content})
    return jsonify(all_posts)


@app.route("/deleteAccount/<int:user_id>", methods=['DELETE'])
def deleteAccount(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return 'True'


@app.route("/getPost/<int:post_id>", methods=['GET'])
def get_post(post_id):
    post = Posts.query.get_or_404(post_id)
    image_file = url_for('static', filename='profile_pics/' + post.traveler.image_file)
    return jsonify({'user_id': post.user_id, 'user_name': post.traveler.username, 'user_image': image_file, 'id': post_id,
                    'title': post.title, 'date_posted': post.date_posted, 'country': post.country, 'city': post.city, 'content': post.content,
                    'start_date': post.start_date, 'end_date': post.end_date, 'latitude': post.latitude,
                    'longitude': post.longitude})


@app.route("/editPost/<int:post_id>", methods=['PUT'])
@login_required
def update_post(post_id):
    post = Posts.query.get_or_404(post_id)
    if current_user.id != post.user_id:
        return "Not Post creator"
    post_update = request.get_json()
    post.title = post_update['title']
    post.content = post_update['content']
    post.country = post_update['country']
    post.city = post_update['city']
    post.start_date = post_update['start_date']
    post.end_date = post_update['end_date']
    post.latitude = post_update['latitude']
    post.longitude = post_update['longitude']
    for element in Subscribe.query.filter_by(post=post):
        user = User.query.get_or_404(element.user_id)
        post = Posts.query.get_or_404(element.post_id)
        user.notify(post)
    db.session.add(post)
    db.session.commit()
    return 'Updated'


@app.route("/anonymousSign", methods=['POST'])
def anonymous_register():
    if current_user.is_authenticated:
        abort(400)
    data = request.get_json()
    if not data or not 'title' in data or not 'content' in data:
        abort(400)

    if not 'password' in data or not 'username' in data or not 'first_name' in data \
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
                gender=data['gender'], birth_date=datetime.datetime.utcnow(), email=data['email'], password=hashed_password)

    post = Posts(title=data['title'], date_posted=datetime.datetime.utcnow(), start_date=data['startDate'],
                 end_date=data['endDate'], country=data['country'], city=data['city'], content=data['content']
                 , latitude=data['latitude'], longitude=data['longitude'], traveler=user)

    db.session.add(user)
    db.session.add(post)
    db.session.commit()
    return 'Created'


def date_between(start_date, end_date, start_date_arg, end_date_arg):
    start_date_arg_converted = datetime.datetime.strptime(start_date_arg.split('T')[0], '%Y-%m-%d').date()
    end_date_arg_converted = datetime.datetime.strptime(end_date_arg.split('T')[0], '%Y-%m-%d').date()

    if start_date.date() <= end_date_arg_converted:
        return end_date.date() >= start_date_arg_converted
    return False


@app.route('/subscribe/<int:post_id>', methods=['POST', 'DELETE'])
@login_required
def subscribe(post_id):
    post = Posts.query.get_or_404(post_id)
    if not current_user.is_subscribed(post):
        current_user.subscribe(post)
    else:
        current_user.unsubscribe(post)
    db.session.commit()
    return 'True'


@app.route('/is_subscribed/<int:post_id>', methods=['GET'])
@login_required
def is_subscribed(post_id):
    post = Posts.query.get_or_404(post_id)
    if current_user.is_subscribed(post):
        return 'True'
    return 'False'


@app.route("/notifications", methods=['GET'])
@login_required
def get_notifications():
    all_notifications = []
    if current_user.is_authenticated:
        for notification in (Notification.query.filter_by(user=current_user).order_by(desc(Notification.timestamp)).all()):
            all_notifications.append({'id': notification.id, 'title': notification.post.title, 'user_id': notification.post.user_id,
                                'user_name': notification.post.traveler.username,
                              'timestamp': notification.timestamp, 'post_id': notification.post_id,
                                'kind': notification.kind})
    print(all_notifications)
    return jsonify(all_notifications)


@app.route('/delete_notification/<int:notification_id>', methods=['DELETE'])
@login_required
def deleteNotification(notification_id):
    print('got here tho')
    notification = Notification.query.get_or_404(notification_id)
    db.session.delete(notification)
    db.session.commit()
    return 'True'
