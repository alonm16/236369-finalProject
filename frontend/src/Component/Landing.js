import React, { Component } from "react";
import jwt_decode from "jwt-decode";
import axios from "axios";
import {
  Card,
  Button,
  CardImg,
  CardTitle,
  CardText,
  CardDeck,
  CardSubtitle,
  CardHeader,
  CardBody
} from "reactstrap";
import ReactTimeAgo from "react-time-ago";
import JavascriptTimeAgo from 'javascript-time-ago'

import en from "javascript-time-ago/locale/en";
import ru from "javascript-time-ago/locale/ru";

// Initialize the desired locales.
JavascriptTimeAgo.locale(en);
JavascriptTimeAgo.locale(ru);

class Landing extends Component {
  state = {
    users: [],
    feed: []
  };

  componentDidMount() {
    const token = localStorage.usertoken;
    if (token) {
      const decoded = jwt_decode(token);
      this.setState({ current_user: decoded.identity.id });
      axios
        .get("http://127.0.0.1:5000/posts")
        .then(response => {
          this.setState({
            feed: response.data
          });
          console.log(this.state.feed);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }

  render() {
    return (
      <div className="container">
        <ul className="list-unstyled">
          {this.state.feed.map(listitem => (
            <li key={listitem.id} className={listitem.modifier}>
              <Card style={{ width: "60rem" }}>
                <CardHeader>
                  {" "}
                  date posted: <ReactTimeAgo date={listitem.start_date} /> end
                  date: {listitem.end_date}{" "}
                </CardHeader>
                <CardBody>
                  <CardTitle>
                    <b>{listitem.title}</b>
                  </CardTitle>
                  <CardText>{listitem.content}</CardText>
                  <Button variant="primary">Subscribe</Button>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default Landing;
