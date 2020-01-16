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
import he from "javascript-time-ago/locale/he";
// Initialize the desired locales.
JavascriptTimeAgo.locale(en);
JavascriptTimeAgo.locale(ru);
JavascriptTimeAgo.locale(he);

class Post extends Component {
  constructor() {
    super();
    this.state = {
      id: 0,
      title: "",
      date_posted: "",
      user_id: "",
      user_name: "",
      user_first: "",
      user_last: "",
      user_image: "",
      start_date: "",
      end_date: "",
      country: "",
      city: "",
      latitude: "",
      longitude: "",
      content: "",
      current_user: ""
    };
  }

  SubscribePost() {
    axios.defaults.withCredentials = true;
    axios
      .post("http://127.0.0.1:5000/subscribe/" + this.props.id)
      .then(response => {
        this.setState({
          isSubscribed: true
        });
        this.componentDidMount();
      })
      .catch(err => {
        console.log(err);
      });
  }

  UnsubscribePost() {
    axios.defaults.withCredentials = true;
    axios
      .delete("http://127.0.0.1:5000/subscribe/" + this.props.id)
      .then(response => {
        this.setState({
          isSubscribed: false
        });
        this.componentDidMount();
      })
      .catch(err => {
        console.log(err);
      });
  }
  componentDidMount() {
    const token = localStorage.usertoken;
    if (token) {
      const decoded = jwt_decode(token);
      this.setState({
        current_user: decoded.identity.id
      });
      axios.defaults.withCredentials = true;
      axios
        .get("http://127.0.0.1:5000/is_subscribed/" + this.props.id)
        .then(response => {
          const res = response.data == "True" ? true : false;
          this.setState({
            isSubscribed: res
          });
        })
        .catch(err => {
          console.log(err);
        });

      axios
        .get("http://127.0.0.1:5000/userDetails/" + this.props.user_name)
        .then(response => {
          this.setState({
            user_first: response.data.first,
            user_last: response.data.last
          });
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
  showPostCreator() {
    // Simulate a mouse click:
    window.location.href = "http://127.0.0.1:3000/users/" + this.props.user_id;

    // Simulate an HTTP redirect:
    window.location.replace(
      "http://127.0.0.1:3000/users/" + this.props.user_id
    );
  }

  render() {
    return (
      <Card style={{ width: "60rem" }}>
        <CardHeader align="right">
          <div id="textbox">
            <div style={{ verticalAlign: "top", float: "left" }}>
              <a href={`/users/${this.props.user_id}`}>
                <img
                  onClick={this.showPostCreator.bind(this)}
                  className="center"
                  className="rounded-circle account-img"
                  src={"http://127.0.0.1:5000" + this.props.user_image}
                  style={{ float: "left" }}
                  height="50"
                  width="50"
                />
              </a>
              &nbsp;&nbsp;&nbsp;
              <b>{this.state.user_first}</b>
              <b onClick={this.showPostCreator.bind(this)}>
                &nbsp;{this.state.user_last}
              </b>{" "}
              <br />
              <a href={`/users/${this.props.user_id}`}>
                {this.props.user_name}
              </a>
            </div>
            <text
              style={{ float: "right" }}
              onClick={this.showPostCreator.bind(this)}
            >
              {" "}
              <ReactTimeAgo date={this.props.date_posted} />
            </text>
          </div>
        </CardHeader>

        <CardBody>
          <CardTitle>
            <b>{this.props.title}</b>
          </CardTitle>
          <CardText>{this.props.content}</CardText>

        </CardBody>
        {this.props.current_user !== this.props.user_id && (
          <Button
            variant="outline-primary"
            onClick={
              this.state.isSubscribed
                ? this.UnsubscribePost.bind(this)
                : this.SubscribePost.bind(this)
            }
          >
            {this.state.isSubscribed ? "Unsubscribe" : "Subscribe"}
          </Button>
        )}
      </Card>
    );
  }
}

export default Post;
