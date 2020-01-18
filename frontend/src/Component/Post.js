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

class Post extends Component {
  constructor() {
    super();
    this.state = {
      post_id: 0,
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
      current_user: "",
      showMapPopup: false,
      showOptions: false
    };
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  SubscribePost() {
    axios.defaults.withCredentials = true;
    axios
      .post("http://127.0.0.1:5000/subscribe/" + this.props.post_id)
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

  showOptions() {
    this.setState({
      showOptions: !this.state.showOptions
    });
    console.log(this.state.showOptions);
  }

  UnsubscribePost() {
    axios.defaults.withCredentials = true;
    axios
      .delete("http://127.0.0.1:5000/subscribe/" + this.props.post_id)
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

  toggleMapPopup() {
    this.setState({
      showMapPopup: !this.state.showMapPopup
    });
    console.log(this.state.showMapPopup);
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
        .get("http://127.0.0.1:5000/is_subscribed/" + this.props.post_id)
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
    document.addEventListener("mousedown", this.handleClickOutside);
  }
  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  showPostCreator() {
    // Simulate a mouse click:
    window.location.href = "http://127.0.0.1:3000/users/" + this.props.user_id;

    // Simulate an HTTP redirect:
    window.location.replace(
      "http://127.0.0.1:3000/users/" + this.props.user_id
    );
  }

  showEditPost() {
    console.log(this.props.post_id);
    // Simulate a mouse click:
    window.location.href =
      "http://127.0.0.1:3000/EditPost/" + this.props.post_id;

    // Simulate an HTTP redirect:
    window.location.replace(
      "http://127.0.0.1:3000/EditPost/" + this.props.post_id
    );
  }

  DeletePost() {
    axios.defaults.withCredentials = true;
    axios
      .delete("http://127.0.0.1:5000/deletePost/" + this.props.post_id)
      .then(response => {
        window.location.href = "http://127.0.0.1:3000/";

        // Simulate an HTTP redirect:
        window.location.replace("http://127.0.0.1:3000/");
      })
      .catch(err => {
        console.log(err);
      });
  }
  /**
   * Set the wrapper ref
   */
  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  /**
   * Alert if clicked on outside of element
   */
  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({
        showOptions: !this.state.showOptions
      });
    }
  }

  format_date(date)
  {
    let date_array = date.split(" ");
    let new_date  = date_array[0];
    for(let i=1; i<date_array.length-2; i++)
      new_date = new_date.concat(" "+ date_array[i]);
    return new_date
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
              <div style={{ width: "200px", float: "left" }}>
                <b style={{ float: "left" }}>&nbsp;&nbsp;{this.state.user_first}</b>
                <b
                  style={{ float: "left" }}
                >
                  &nbsp;{this.state.user_last}
                </b>
                <br />
                <b style={{ float: "left" }}>&nbsp;&nbsp;</b>
                <a
                  style={{ float: "left" }}
                  href={`/users/${this.props.user_id}`}
                >
                  {this.props.user_name}
                </a>
              </div>
            </div>
            <text
              style={{ float: "right" }}
            >
              {" "}
              <ReactTimeAgo date={this.props.date_posted} />
            </text>
          </div>
        </CardHeader>

        <CardBody>
          <CardTitle>
            <b>{this.props.title}</b>
            <div style={{ float: "right" }}>
              {this.props.current_user === this.props.user_id && (
                <div class="dropdown">
                  <div
                    onClick={this.showOptions.bind(this)}
                    style={{
                      width: "15px",
                      height: "15px",
                      backgroundImage:
                        "radial-gradient(circle at center, black 2px, transparent 2px)",
                      backgroundSize: "2px 5px",
                      cursor: "pointer"
                    }}
                  />
                  {this.state.showOptions && (
                    <div
                      id="myDropdown"
                      ref={this.setWrapperRef}
                      class="dropdown-content"
                    >
                      <a href="#deletePost">
                        <button onClick={this.showEditPost.bind(this)}>
                          Edit{" "}
                        </button>
                      </a>
                      <a href="#deletePost">
                        <button onClick={this.DeletePost.bind(this)}>
                          Delete{" "}
                        </button>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ float: "center", paddingRight:'100px' }}>{this.format_date(this.props.start_date)} &nbsp;&nbsp;to&nbsp;&nbsp;
              {this.format_date(this.props.end_date)}</div>
          </CardTitle>
          <CardText style={{ float: "left" }}>{this.props.content}</CardText>
          <text style={{ float: "right" }}>
            <button
              onClick={this.toggleMapPopup.bind(this)}
              style={{
                backgroundColor: "white",
                background: "white",
                border: "none",
                padding: "0!important",
                fontFamily: "arial, sans-serif",
                color: "#069",
                textDecoration: "underline",
                cursor: "pointer",
                backgroundImage: ""
              }}
            >
              <img src={require('../map.png')} width="40" height="40" />
            </button>

            {this.state.showMapPopup ? (
              <MapPopup
                closePopup={this.toggleMapPopup.bind(this)}
                position = {{'lat': this.props.latitude, 'lng': this.props.longitude}}
              />
            ) : null}
          </text>
        </CardBody>
        {this.props.current_user !== this.props.user_id && (
          <Button
            style={{ width: "200px" }}
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
