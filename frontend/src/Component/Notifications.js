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
import MapPopup from "./MapPopup";
import en from "javascript-time-ago/locale/en";
import ru from "javascript-time-ago/locale/ru";
import he from "javascript-time-ago/locale/he";
import "../index.css";
// Initialize the desired locales.
JavascriptTimeAgo.locale(en);
JavascriptTimeAgo.locale(ru);
JavascriptTimeAgo.locale(he);

class Notifications extends Component {
  constructor() {
    super();
    this.state = {
      post_id: 0,
      title: "",
      user_id: "",
      user_name: "",
      user_first: "",
      user_last: "",
      kind: "",
      current_user: "",
      timestamp: "",
      cardDeleted: false
    };
  }

  componentDidMount() {
    const token = localStorage.usertoken;
    if (token) {
      const decoded = jwt_decode(token);
      this.setState({
        current_user: decoded.identity.id
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
  deleteNotification(e) {
    e.preventDefault();
    axios.defaults.withCredentials = true;
    const id = this.state.current_user;
    axios.defaults.withCredentials = true;
    axios.delete("http://127.0.0.1:5000/delete_notification/" + id);
    this.setState({
      cardDeleted: true
    });
  }

  showPost() {
    // Simulate a mouse click:
    window.location.href = "http://127.0.0.1:3000/Post/" + this.props.post_id;

    // Simulate an HTTP redirect:
    window.location.replace("http://127.0.0.1:3000/Post/" + this.props.post_id);
  }

  render() {
    return (
      !this.state.cardDeleted && (
        <Card style={{ width: "25rem" }}>
          <div>
            <div
              id="text"
              style={{
                float: "left",
                width: "22.8rem",
                textOverflow: "ellipsis",
                overflow: "hidden"
              }}
            >
              {" "}
              <button
                onClick={this.showPost.bind(this)}
                style={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  float: "left",
                  width: "22.8rem"
                }}
              >
                <b>
                  {this.state.user_first}&nbsp;{this.state.user_last}
                </b>{" "}
                has edited a post on {this.props.title}
              </button>
            </div>
            <div id="text" style={{ float: "right", width: "2rem" }}>
              <div id="text" style={{ float: "center", width: "2rem" }}>
                <button>x</button>
              </div>
            </div>
          </div>
        </Card>
      )
    );
  }
}

export default Notifications;
