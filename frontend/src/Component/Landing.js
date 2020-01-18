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
import Register, { register } from "./Register";
import AddPost from "./AddPost";

// Initialize the desired locales.
JavascriptTimeAgo.locale(en);
JavascriptTimeAgo.locale(ru);

export const register_post = (newUser, newPost) => {
  return axios
    .post("http://127.0.0.1:5000/anonymousSign", {
      username: newUser.username,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      gender: newUser.gender,
      birth_date: newUser.birth_date,
      email: newUser.email,
      password: newUser.password,
      title: newPost.title,
      startDate: newPost.startDate,
      endDate: newPost.endDate,
      country: newPost.country,
      city: newPost.city,
      content: newPost.content,
      latitude: newPost.latitude,
      longitude: newPost.longitude
    })
    .then(response => {
      return response.data;
    });
};

const validateForm = errors => {
  let valid = true;
  Object.values(errors).forEach(val => val.length > 0 && (valid = false));
  return valid;
};

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches(".dropbtn")) {
    let posts = document.getElementById("postid");
  }
};

class Landing extends Component {
  constructor() {
    super();
    this.state = {
      users: [],
      feed: [],
      current_user: ""
    };
    this.registerRef = React.createRef();
    this.postRef = React.createRef();
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    const token = localStorage.usertoken;
    if (token) {
      const decoded = jwt_decode(token);
      this.setState({ current_user: decoded.identity.id });
      if (this.props.type == 1) {
            axios.defaults.withCredentials = true;

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
          axios.defaults.withCredentials = true;
        axios
          .get("http://127.0.0.1:5000/posts")
          .then(response => {
            this.setState({
              feed: response.data
            });
          })
          .catch(err => {
            console.log(err);
          });
      }
    }
  }


  onSubmit(e) {
    e.preventDefault();
    const reg = this.registerRef.current;
    const pos = this.postRef.current;
    const newUser = reg.onSubmit(e);
    const newPost = pos.onSubmit(e);

    if (validateForm(reg.state.errors) && validateForm(pos.state.errors)) {
      register_post(newUser, newPost).then(res => {
        if (res == "Created") {
          this.props.history.push(`/login`);
        }
        if (res == "Username Taken") {
          reg.setState({ user_taken: 1 });
          reg.setState({ invalid: 1 });
        }
        if (res == "Email Taken") {
          reg.setState({ email_taken: 1 });
          reg.setState({ invalid: 1 });
        }
      });
    } else {
      if (!validateForm(reg.state.errors)) reg.setState({ invalid: 1 });
      if (!validateForm(pos.state.errors)) pos.setState({ invalid: 1 });
    }
  }



  render() {
    return localStorage.usertoken ? (
      <div className="container">
        <ul className="list-unstyled">
          {this.state.feed.map(listitem => (
            <li
              key={listitem.id}
              className={listitem.modifier}
              style={{ margin: "0 0 10px 0" }}
            >
              <Post
                id="postid"
                post_id={listitem.id}
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
    ) : (
      <div className="container">
        <div>
            <h1 className="h3 mb-3 font-weight-normal" style={{textAlign:'center', paddingTop:'20px'}}>Register & Post</h1>
          <div class="home-left">
            <Register
              ref={this.registerRef}
              in_home={true}
              history={this.props.history}
            />
          </div>
          <div class="home-right">
            <AddPost ref={this.postRef} in_home={true}></AddPost>
          </div>
          <div >
            <button
                style={{alignSelf:'center'}}
              type="submit"
              onClick={this.onSubmit.bind(this)}
              onSubmit={this.onSubmit.bind(this)}
              className="btn btn-lg btn-primary btn-block"
              style={{ width: "700px" }}
            >
              Sign Up & Post!
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Landing;
