import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import axios from "axios";
import jwt_decode from "jwt-decode";
import Autosuggest from "react-bootstrap-autosuggest";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import Notifications from "./Notifications";

class Navbar extends Component {
  constructor() {
    super();
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }
  state = {
    current_user: 0,
    username: "",
    search_msg: "Search for a user",
    showNotifications: false,
      notifications: []
  };

  handleClickOutside(event) {
    console.log("bla");
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({
        showNotifications: !this.state.showNotifications
      });
    }
  }

  get_user() {
    this.setState({ search_msg: "Search for a user" });
    axios.defaults.withCredentials = true;
    axios
      .get("http://127.0.0.1:5000/user/" + this.state.username)
      .then(response => {
        this.setState({ username: "" });
        this.props.history.push(`/users/` + response.data.id);
      })
      .catch(err => {
        this.setState({ username: "", search_msg: "User not found" });
      });
  }

  onChange(e) {
    this.setState({
      username: e.target.value,
      search_msg: "Search for a user"
    });
  }


  logOut(e) {
    e.preventDefault();
    axios.defaults.withCredentials = true;
    axios
      .get("http://127.0.0.1:5000/logout")
      .then(response => {
        localStorage.removeItem("usertoken");
        this.props.history.push(`/`);
      })
      .catch(err => {
        console.log(err);
      });
  }
  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.componentDidMount();
    }
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
        .get("http://127.0.0.1:5000/notifications")
        .then(response => {
          this.setState({
            notifications: response.data
          });
          console.log(this.state.notifications);
        })
        .catch(err => {
          console.log(err);
        });
      console.log(token);
    }
    document.addEventListener("mousedown", this.handleClickOutside);

    }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }


  /**
   * Set the wrapper ref
   */
  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  showNotifications() {
    this.setState({
      showNotifications: !this.state.showNotifications
    });
    console.log(this.state.showNotifications);
    console.log("got here");
  }

  render() {
    const loginRegLink = (
      <ul className="navbar-nav">
        <li className="nav-item">
                <Link to="/" className="nav-link" style={{color:"white"}}>
                  Home
                </Link>
              </li>
        <li className="nav-item">
          <Link to="/login" className="nav-link" style={{color:"white"}}>
            Login
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/register" className="nav-link" style={{color:"white"}}>
            Register
          </Link>
        </li>
      </ul>
    );

    const userLink = (
      <ul className="navbar-nav">
          <li className="nav-item">
                <Link to="/" className="nav-link" style={{color:"white"}}>
                  Home
                </Link>
              </li>
        <li className="nav-item">
          <Link to={"/users/" + this.state.current_user} className="nav-link"  style={{color:"white"}}>
            User
          </Link>
        </li>
        <Form
          inline
          onSubmit={e => {
            e.preventDefault();
            this.get_user();
          }}
        >
          <FormControl
            type="text"
            placeholder={this.state.search_msg}
            onChange={this.onChange.bind(this)}
            value={this.state.username}
            className="mr-md-1"
          />

          <Button
            variant="outline-primary"  style={{color:"white"}}
            onClick={this.get_user.bind(this)}
          >
            Search
          </Button>
        </Form>
        <li className="nav-item">
          <Link to="/AddPost" className="nav-link"  style={{color:"white"}}>
            New Post
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/FindPartners" className="nav-link"  style={{color:"white"}}>
            Find Partners
          </Link>
        </li>
        <li className="nav-item">
          <b className="nav-link">
            <div
              onClick={this.showNotifications.bind(this)}
              style={{
                cursor: "pointer"
              }}
            > <img src={require('../bell5.png')} width="25" height="25" /></div>
            {this.state.showNotifications && (
              <div
                id="myDropdown"
                ref={this.setWrapperRef}
                className="dropdown-content"
              >
                <ul className="list-unstyled">
                  {this.state.notifications.map(listitem => (
                    <li
                      key={listitem.id}
                      className={listitem.modifier}
                      style={{ margin: "0 0 10px 0" }}
                    >
                      <Notifications
                        id="notificationid"
                        post_id={listitem.post_id}
                        title={listitem.title}
                        kind={listitem.kind}
                        user_id={listitem.user_id}
                        user_name={listitem.user_name}
                        timestamp={listitem.timestamp}
                        current_user={this.state.current_user}
                        history={this.props.history}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </b>
        </li>
        <li className="nav-item">
          <a href="" onClick={this.logOut.bind(this)} className="nav-link"  style={{color:"white"}}>
            Logout
          </a>
        </li>
      </ul>
    );

    return (

      <div>
        <nav className="navbar navbar-expand-lg navbar-dark  rounded" style={{backgroundColor:"#2aa700"}}>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarsExample10"
            aria-controls="navbarsExample10"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div
            className="collapse navbar-collapse justify-content-md-center col-md-12 "
            id="navbarsExample10"
          >

            {localStorage.usertoken ? userLink : loginRegLink}
          </div>
        </nav>
      </div>
    );
  }
}

export default withRouter(Navbar);
