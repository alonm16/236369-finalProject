from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///'  # in-memory
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

example_data = [
    (1, '2018-01-01'),
    (1, '2018-01-05'),
    (3, '2018-01-07'),
    (1, '2018-02-06'),
    (3, '2018-01-31'),
    (2, '2018-02-01'),
    (3, '2018-02-01'),
    (3, '2018-01-20'),
    (2, '2018-02-07'),
]


class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, index=True)
    order_date = db.Column(db.String, index=True)


def load_data():
    db.create_all()
    for row in example_data:
        order = Order(customer_id=row[0], order_date=row[1])
        db.session.add(order)
    db.session.commit()


def main():
    load_data()

    # TODO: create a query that returns the rows of the table sorted by
    # customer_id, with the most recent customer first, according to
    # last order. The entries of a customer need to be sorted with the
    # most recent order first.
    query = Order.query
	
    last_orders = db.session.query(
		Order.customer_id, db.func.max(Order.order_date).label('last_order_date')
	).group_by(Order.customer_id).subquery()
	
    query = Order.query.join(
		last_orders, Order.customer_id == last_orders.c.customer_id
	).order_by(last_orders.c.last_order_date.desc(), Order.order_date.desc())
    # print results
    for row in query:
        print(row.id, row.customer_id, row.order_date)
	
    print(str(last_orders))
    print(str(query))


if __name__ == '__main__':
    main()