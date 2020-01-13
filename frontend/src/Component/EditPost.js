import React, { Component } from 'react'
import jwt_decode from 'jwt-decode'
import moment from "moment";
import axios from "axios";
import Alert from "reactstrap/es/Alert";
import DatePicker from "react-datepicker";
import Button from "reactstrap/es/Button";

const update = updatedPost => {
    axios.defaults.withCredentials = true;
  return axios
    .put('http://127.0.0.1:5000/EditPost/'+updatedPost.id, {
      title: updatedPost.title,
      startDate: updatedPost.startDate,
      endDate: updatedPost.endDate,
      country: updatedPost.country,
      city: updatedPost.city,
      content: updatedPost.content,
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
}

function PostInfo(props){
  return (
     <table className="table col-md-6 mx-auto">
            <tbody>
              <tr>
                <td><b>Title</b></td>
                <td>{props.title}</td>
              </tr>
              <tr>
                  <td><b>Country</b></td>
                <td>{props.country}</td>
              </tr>
              <tr>
                  <td><b>City</b></td>
                <td>{props.city}</td>
              </tr>
              <tr>
                  <td><b>Content</b></td>
                <td>{props.content}</td>
              </tr>
              <tr>
                  <td><b>Start Date</b></td>
                <td>{moment(props.startDate).format("LL")}</td>
              </tr>
               <tr>
                  <td><b>End Date</b></td>
                <td>{moment(props.endDate).format("LL")}</td>
              </tr>
            </tbody>
          </table>
  );
}


function EditPostFunc(props){
  return(
          <div className="col-md-6 mt-3 mx-auto">
     <form noValidate onSubmit={props.onSubmit}>
              <h1 className="h3 mb-3 font-weight-normal">Update Profile</h1>
              <div className="form-group">
                  {props.invalid >0 &&  <Alert color="danger">
                  Your update attempt is invalid. Please try again!
                </Alert> }
                <label htmlFor="name">Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  placeholder="Enter your title"
                  value={props.title}
                  onChange={props.onChange}
                  noValidate
                />
                 {props.errors.title.length > 0 &&
                <span className='error'>{props.errors.title}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="name">Country</label>
                <input
                  type="text"
                  className="form-control"
                  name="country"
                  placeholder="Enter a Country"
                  value={props.country}
                  onChange={props.onChange}
                  noValidate
                />
                {props.errors.country.length > 0 &&
                <span className='error'>{props.errors.country}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="name">City</label>
                <input
                  type="text"
                  className="form-control"
                  name="city"
                  placeholder="Enter a City"
                  value={props.city}
                  onChange={props.onChange}
                  noValidate
                />
                 {props.errors.city.length > 0 &&
                <span className='error'>{props.city}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="name">Content</label>
                <input
                  type="text"
                  className="form-control"
                  name="content"
                  placeholder="Enter a Content"
                  value={props.content}
                  onChange={props.onChange}
                  noValidate
                />
                 {props.errors.content.length > 0 &&
                <span className='error'>{props.content}</span>}
              </div>
              <div className="form-group">
                  <label htmlFor="name">Start date</label><br></br>
                <DatePicker
                 name="startDate"
                 selected={new Date(props.startDate)}
                 onChange={this.handleChangeStart}
                 dateFormat="dd/MM/yyyy"
                 maxDate={new Date()}
                />
              </div>
              <div className="form-group">
                  <label htmlFor="name">End date</label><br></br>
                <DatePicker
                 name="endDate"
                 selected={new Date(props.endDate)}
                 onChange={this.handleChangeEnd}
                 dateFormat="dd/MM/yyyy"
                 maxDate={new Date()}
                />
              </div>
              <button
                type="submit"
                className="btn btn-lg btn-primary btn-block"
              >
                Update
              </button>
            </form>

          </div>
  );
}

export class EditPost extends Component {
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
      invalid: 0,
      flag: true,
      file: null,
        path_img:''
    }
    this.onChange = this.onChange.bind(this)
    this.onChangeImg = this.onChangeImg.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }
  componentWillReceiveProps(){
    this.componentDidMount()
  }
  componentDidMount() {
     const token = localStorage.usertoken
    if (token) {
      const decoded = jwt_decode(token)
        this.setState({current_user: decoded.identity.id});
    }

        axios.get('http://127.0.0.1:5000/EditPost/' + this.props.id).then((response) => {
                this.setState({
                   title: response.data.title,
                  country: response.data.country,
                  city: response.data.city,
                  content: response.data.content,
                  startDate: response.data.startDate,
                  endDate: response.data.endDate
                })
            }).catch(err => {
                console.log(err)
            });
  }

  toggleUpdate(){
    this.setState({
      flag: !this.state.flag,
      errors: {
          title: '',
          content: '',
          city: '',
          country: '',
      },
      invalid: 0,
      file:null
    });
    if (!this.state.flag)
      this.componentDidMount();
  }


  onChange(e) {
      //  e.preventDefault()
        let errors = this.state.errors;
        const { name, value } = e.target;

        switch (name) {
            case 'username':
                this.setState({user_taken: 0});
                errors.username =
                  value.length < 1 || value.length > 20
                    ? 'Username is not valid!'
                    : '';
                break;
                case 'last_name':
                errors.last_name =
                  value.length > 20
                    ? 'Last name is too long'
                    : '';
                break;
              default:
                break;
        }
        this.setState({errors, [name]: value});
  }
  onChangeImg(e) {
    this.setState({file:e.target.files[0]})
  }
  uploadImg(){
      let img = this.state.file;
      const formData = new FormData();
      formData.append("file", img);
      axios.defaults.withCredentials = true;
      axios
        .put("http://127.0.0.1:5000/image/"+this.props.id, formData)
        .then(res =>
            {console.log(res.data.image_file)
                this.props.updatePic({image_file:res.data.image_file});
            }

        )
        .catch(err => {
            console.warn(err)
            this.setState({path_img:''})
        });

  }
  onSubmit(e) {
    e.preventDefault()
    this.setState({invalid: 0});
    this.setState({user_taken: 0});
    this.setState({email_taken: 0});

    const updatedUser = {
      id: this.props.id,
      username: this.state.username,
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      gender: this.state.gender,
      birth_date: this.state.birth_date,
      email: this.state.email,
    }
      const info={
        email: this.state.email,
          username: this.state.username
    }

     if (validateForm(this.state.errors)) {
         update(updatedUser).then(res => {
             if (res == 'Updated') {
                 if (this.state.file){
                     this.uploadImg()
                     this.props.updateInfo(info);
                 }
                 else
                     {
                                                console.log("here5");

                         this.props.updateInfo(info);
                     }
               this.setState({flag: true, file:null});
             }
             if (res == 'Username Taken'){
                 this.setState({user_taken: 1});
                 this.setState({invalid: 1});
             }
             if (res == 'Email Taken'){
                 this.setState({email_taken: 1});
                 this.setState({invalid: 1});
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
        <div className="jumbotron mt-1">
          {this.state.flag && <PostInfo
             title={this.state.title}
             startDate={this.state.startDate}
             endDate={this.state.endDate}
             country={this.state.country}
             city={this.state.city}
             content={this.state.content}
            />}
            <p className="m-md-4" align="center">
                <Button className="my-3" color="secondary" onClick={this.toggleUpdate.bind(this)}>Edit</Button>
            </p>
             {!this.state.flag && <EditPostFunc
              title={this.state.title}
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              country={this.state.country}
              city={this.state.city}
              content={this.state.content}
              errors={this.state.errors}
              onChange={this.onChange}
              onSubmit={this.onSubmit}
              invalid={this.state.invalid}
              flag={this.state.flag}
              toggleUpdate={this.toggleUpdate}
              onchangeimg={this.onChangeImg}
            />}
            <div className="col-md-6 mt-1 mx-auto">
            {!this.state.flag && <Button className="btn btn-lg btn-block" color="secondary" onClick={this.toggleUpdate.bind(this)}>Cancel</Button>}
            </div>
            </div>
      </div>
    )
  }
}


export default EditPost