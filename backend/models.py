from datetime import datetime
from backend import db, login_manager
from flask_login import UserMixin
from math import sin, cos, sqrt, atan2, radians


class Subscribe(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), primary_key=True)

    def __repr__(self):
        return f"Subscribe('{self.user_id}', '{self.post_id}')"


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    kind = db.Column(db.String(10), nullable=False)
    def __repr__(self):
        return f"Notification('{self.user_id}', '{self.post_id}')"


class Follow(db.Model):
    follower_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    followed_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"Follow('{self.timestamp}')"


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    first_name = db.Column(db.String(20))
    last_name = db.Column(db.String(20))
    gender = db.Column(db.String(20), nullable=False)
    birth_date = db.Column(db.Date())
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    image_file = db.Column(db.String(20), nullable=False, default='default.jpg')
    posts = db.relationship('Posts', backref='traveler', lazy='dynamic',cascade='all, delete-orphan')
    followed = db.relationship('Follow', foreign_keys=[Follow.follower_id], backref=db.backref('follower', lazy='joined'),
                               lazy='dynamic', cascade='all, delete-orphan')
    followers = db.relationship('Follow',
                                foreign_keys=[Follow.followed_id],
                                backref=db.backref('followed', lazy='joined'),
                                lazy='dynamic',
                                cascade='all, delete-orphan')
    subscribes = db.relationship('Subscribe', foreign_keys=[Subscribe.user_id], backref=db.backref('subscriber', lazy='joined'),
                               lazy='dynamic', cascade='all, delete-orphan')
    notifications = db.relationship('Notification', foreign_keys=[Notification.user_id], backref=db.backref('user', lazy='joined'),
                               lazy='dynamic', cascade='all, delete-orphan')
    def __repr__(self):
        return self.id

    def __str__(self):
        return str(self.id)

    def follow(self, user):
        if not self.is_following(user):
            f = Follow(follower=self, followed=user)
            db.session.add(f)

    def unfollow(self, user):
        f = self.followed.filter_by(followed_id=user.id).first()
        if f:
            db.session.delete(f)

    def is_following(self, user):
        if user.id is None:
            return False

        return self.followed.filter_by(
            followed_id=user.id).first() is not None

    def is_followed_by(self, user):
        if user.id is None:
            return False

        return self.followers.filter_by(
            follower_id=user.id).first() is not None

    def subscribe(self, post):
        if not self.is_subscribed(post):
            f = Subscribe(subscriber=self, post=post)
            db.session.add(f)

    def notify(self, post):
        f = Notification(user=self, post=post,kind='EDITED')
        db.session.add(f)

    def unsubscribe(self, post):
        f = self.subscribes.filter_by(post_id=post.id).first()
        if f:
            db.session.delete(f)

    def is_subscribed(self, post):
        if post.id is None:
            return False

        return self.subscribes.filter_by(
            post_id=post.id).first() is not None


class Posts(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Text, nullable=False)
    date_posted = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    country = db.Column(db.Text, nullable=False)
    city = db.Column(db.Text, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    content = db.Column(db.Text, nullable=False)
    subscribers = db.relationship('Subscribe', foreign_keys=[Subscribe.post_id], backref=db.backref('post', lazy='joined'),
                               lazy='dynamic', cascade='all, delete-orphan')
    notifications = db.relationship('Notification', foreign_keys=[Notification.post_id], backref=db.backref('post', lazy='joined'),
                                    lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        return f"Posts('{self.date_posted}','{self.traveler}')"

    def is_in_radius(self, lat, lng, radius):
        R = 6373.0

        lat1 = radians(self.latitude)
        lon1 = radians(self.longitude)
        lat2 = radians(lat)
        lon2 = radians(lng)

        dlon = lon2 - lon1
        dlat = lat2 - lat1

        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))

        distance = R * c
        return distance<=radius