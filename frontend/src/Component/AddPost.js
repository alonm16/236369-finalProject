import React, { Component } from 'react';
import axios from "axios";
import Landing from "./Landing";

class AddPost extends React.Component {
    constructor(props) {
        super(props);
        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.handleContentChange = this.handleContentChange.bind(this);
        this.state = {
            title: '',
           content: ''
        };
        this.onSubmit = this.onSubmit.bind(this)
    }
onChange(e) {
      //  e.preventDefault()
        this.setState({ [e.target.name]: e.target.value });
  }
     onSubmit(e) {
        e.preventDefault();
        this.addPost();
     }

    handleTitleChange(e){
    this.setState({title:e.target.value})
    }

    handleContentChange(e){
        this.setState({body:e.target.value})
    }

    addPost(){
      axios.post('http://127.0.0.1:5000/addPost', {
        title: this.state.title,
        content: this.state.content
      })
      .then(function (response) {
        console.log('response from add post is ',response);
         this.props.history.push(`/`)
      })
      .catch(function (error) {
        console.log(error);
      });
    }


    render(){
      return (
        <div className="col-md-5">
          <div className="form-area">
              <form role="form">
              <br styles="clear:both" />
                <div className="form-group">
                  <input type="text" onChange={this.handleTitleChange} className="form-control" id="title" name="title" placeholder="Title" required />
                </div>

                <div className="form-group">
                  <textarea className="form-control" onChange={this.handleContentChange} type="textarea" id="content" placeholder="Content" maxLength="140" rows="7"></textarea>
                </div>

              <button type="submit"
                      onSubmit={this.onSubmit}
                className="btn btn-lg btn-primary btn-block">Add Post</button>
              </form>
          </div>
        </div>
      )
    }
}

export default AddPost