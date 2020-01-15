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

class MiniUser extends Component {
  constructor() {
    super();
    this.state = {
      id: 0,
      user_id: "",
      user_name: "",
      user_first: "",
      user_last: "",
      user_image: "",
    };
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
        .get("http://127.0.0.1:5000/users/" + this.props.id)
        .then(response => {
          this.setState({
              user_name: response.data.username,
              user_first: response.data.first_name,
              user_last: response.data.last_name,
              user_image: response.data.image_file,
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

              <b>&nbsp;&nbsp;&nbsp;{this.state.user_first}</b>
              <b>&nbsp;{this.state.user_last}</b>
            </p>
          </div>

        </CardHeader>
      </Card>
    );
  }
}

export default MiniUser;
