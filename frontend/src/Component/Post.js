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

// Initialize the desired locales.
JavascriptTimeAgo.locale(en);
JavascriptTimeAgo.locale(ru);

class Post extends Component {
  constructor() {
    super();
    this.state = {
      id: 0,
      title: "",
      date_posted: "",
      user_id: "",
      user_name: "",
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
    }
  }

  render() {
    return (
      <Card style={{ width: "60rem" }}>
        <CardHeader align="right">
          <div id="textbox">
            <p style={{ float: "left" }}>
              <img
                className="center"
                className="rounded-circle account-img"
                src={"http://127.0.0.1:5000" + this.props.user_image}
                height="40"
                width="40"
              />
              <b>&nbsp;&nbsp;&nbsp;{this.props.user_name}</b>
            </p>
            <p style={{ float: "right" }}>
              {" "}
              <ReactTimeAgo date={this.props.start_date} />
            </p>
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
