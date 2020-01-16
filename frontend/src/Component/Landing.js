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
import JavascriptTimeAgo from "javascript-time-ago";

import en from "javascript-time-ago/locale/en";
import ru from "javascript-time-ago/locale/ru";
import Post from "./Post";

// Initialize the desired locales.
JavascriptTimeAgo.locale(en);
JavascriptTimeAgo.locale(ru);

class Landing extends Component {
  state = {
    users: [],
    feed: [],
    current_user: ""
  };

  componentDidMount() {
    const token = localStorage.usertoken;
    if (token) {
      const decoded = jwt_decode(token);
      this.setState({ current_user: decoded.identity.id });
      if (this.props.type == 1) {
        axios
          .get("http://127.0.0.1:5000/my_posts/" + this.props.id)
          .then(response => {
            this.setState({
              feed: response.data
            });
            console.log(this.state.feed);
          })
          .catch(err => {
            console.log(err);
          });
      } else {
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
  }

  render() {
    return (
      <div className="container">
        <ul className="list-unstyled">
          {this.state.feed.map(listitem => (
            <li key={listitem.id} className={listitem.modifier}>
              <Post
                id={listitem.id}
                title={listitem.title}
                date_posted={listitem.date_posted}
                user_id={listitem.user_id}
                user_name={listitem.user_name}
                user_image={listitem.user_image}
                start_date={listitem.start_date}
                end_date={listitem.end_date}
                country={listitem.country}
                city={listitem.city}
                latitude={listitem.latitude}
                longitude={listitem.longitude}
                content={listitem.content}
                current_user={this.state.current_user}
                history={this.props.history}
              >
                .
              </Post>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default Landing;
