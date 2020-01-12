import React, { Component } from 'react'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css";
import Alert from "reactstrap/es/Alert";
import axios from "axios";

export const addPost = newPost => {
  return axios
    .post('http://127.0.0.1:5000/addPost', {
      title: newPost.title,
      startDate: newPost.startDate,
      endDate: newPost.endDate,
      country: newPost.country,
      city: newPost.city,
      content: newPost.content,
    })
    .then(response => {
        return response.data
    })
}

const validateForm = (errors) => {
  let valid = true;
  Object.values(errors).forEach(
    (val) => val.length > 0 && (valid = false)
  );
  return valid;
};

class AddPost extends Component {
  constructor() {
    super()
    this.state = {
      title: '',
      startDate: new Date(),
      endDate: new Date(),
      country: '',
      city: '',
      content: '',
      errors: {
          title: '',
          country: '',
          content: '',
      },
      invalid: 0
    }

    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  handleChangeStart = date => {
    this.setState({
      startDate: date
    });
  };

  handleChangeEnd = date => {
    this.setState({
      endDate: date
    });
  };

  onChange(e) {
      //  e.preventDefault()
        let errors = this.state.errors;
        const { name, value } = e.target;
        this.setState({ [e.target.name]: e.target.value });

        switch (name) {
            case 'title':
                errors.title =
                  value.length < 1 || value.length > 30
                    ? 'Title is not valid!'
                    : '';
                break;
            case 'country':
                errors.country =
                  value.length < 1 || value.length > 30
                    ? 'Country is not valid!'
                    : '';
                break;
            case 'city':
                errors.city =
                  value.length < 1 || value.length > 30
                    ? 'City is not valid!'
                    : '';
                break;
            case 'content':
                errors.content =
                  value.length < 1 || value.length > 5000
                    ? 'Content is not valid!'
                    : '';
                break;
              default:
                break;
        }
        this.setState({errors, [name]: value});
  }
  onSubmit(e) {
    e.preventDefault()
    this.setState({invalid: 0});

     const newPost = {
      title: this.state.title,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      country: this.state.country,
      city: this.state.city,
      content: this.state.content,
    };

     if (validateForm(this.state.errors)) {
         addPost(newPost).then(res => {
             if (res == 'Created') {
                 this.props.history.push(`/`)
             }
         })
     }
     else{
         this.setState({invalid: 1});
     }
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-6 mt-5 mx-auto">
            <form noValidate onSubmit={this.onSubmit}>
              <h1 className="h3 mb-3 font-weight-normal">Add Post</h1>
              <div className="form-group">
                <label htmlFor="name">Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  placeholder="Enter a Title"
                  value={this.state.title}
                  onChange={this.onChange}
                  noValidate
                />
              </div>
              <div className="form-group">
                  <label htmlFor="name">Start date</label><br></br>
                <DatePicker
                 name="StartDate"
                 selected={this.state.startDate}
                 onChange={this.handleChangeStart}
                 dateFormat="dd/MM/yyyy"
                 maxDate={new Date()}
                />
              </div>
              <div className="form-group">
                  <label htmlFor="name">End date</label><br></br>
                <DatePicker
                 name="EndDate"
                 selected={this.state.endDate}
                 onChange={this.handleChangeEnd}
                 dateFormat="dd/MM/yyyy"
                 maxDate={new Date()}
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">Country</label>
                <input
                  type="text"
                  className="form-control"
                  name="country"
                  placeholder="Enter a Country"
                  value={this.state.country}
                  onChange={this.onChange}
                  noValidate
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">City</label>
                <input
                  type="text"
                  className="form-control"
                  name="city"
                  placeholder="Enter a City"
                  value={this.state.city}
                  onChange={this.onChange}
                  noValidate
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">Content</label>
               <textarea name="content" placeholder="Enter Content" cols="75" rows="5"
                         value={this.state.content} onChange={this.onChange}></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-lg btn-primary btn-block"
              >
                Post!
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default AddPost