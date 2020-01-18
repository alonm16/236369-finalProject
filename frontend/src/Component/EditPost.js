import React, { Component } from 'react'
import jwt_decode from 'jwt-decode'
import moment from "moment";
import axios from "axios";
import Alert from "reactstrap/es/Alert";
import DatePicker from "react-datepicker";
import Button from "reactstrap/es/Button";
import {Map, Marker, Popup, TileLayer} from "react-leaflet";
import ReactLeafletSearch from "react-leaflet-search";

const update = updatedPost => {
    axios.defaults.withCredentials = true;
  return axios
    .put('http://127.0.0.1:5000/editPost/'+updatedPost.id, {
      title: updatedPost.title,
      startDate: updatedPost.startDate,
      endDate: updatedPost.endDate,
      country: updatedPost.country,
      city: updatedPost.city,
      content: updatedPost.content,
      latitude: updatedPost.latitude,
      longitude: updatedPost.longitude
    })
    .then(response => {
        return response.data
    })
};


const validateForm = (errors) => {
  let valid = true;
  Object.values(errors).forEach(
    (val) => val.length > 0 && (valid = false)
  );
  return valid;
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
      zoom: 13,
      markers: [],
      center: [51.505, -0.09],
      errors: {
          title: '',
          country: '',
          content: '',
          city: ''
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
        axios.defaults.withCredentials = true;
        axios.get('http://127.0.0.1:5000/getPost/' + this.props.match.params.id).then((response) => {
                if(response.data.user_id != this.state.current_user)
                        this.props.history.push(`/`);
                this.setState({
                  title: response.data.title,
                  country: response.data.country,
                  city: response.data.city,
                  content: response.data.content,
                  startDate: response.data.startDate,
                  endDate: response.data.endDate,
                  markers: [{'lat':response.data.latitude, 'lng': response.data.longitude}],
                  center: [response.data.latitude, response.data.longitude]
                });
            }).catch(err => {
                this.props.history.push(`/`);
                console.log(err)
            });
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

    emptyFields()
  {
      const errors = this.state.errors;
      errors.title =
                  this.state.title.length < 1
                    ? 'Title is not valid!'
                    : '';
      errors.country =
                  this.state.country.length < 1
                    ? 'Country is not valid!'
                    : '';
      errors.city =
                  this.state.city.length < 1
                    ? 'City is not valid!'
                    : '';
      errors.content =
                  this.state.content.length < 1
                    ? 'Content is not valid!'
                    : '';


  }

  onSubmit(e) {
    e.preventDefault()
    this.setState({invalid: 0});
    if(this.state.markers.length==0)
        {
             this.setState({invalid: 1});
             return;
        }
    const updatedUser = {
      id: this.props.match.params.id,
      title:this.state.title,
      startDate:this.state.startDate,
      endDate:this.state.endDate,
      country:this.state.country,
      city:this.state.city,
      content:this.state.content,
      latitude: this.state.markers[0]['lat'] ,
      longitude: this.state.markers[0]['lng']
    }

    this.emptyFields();

     if (validateForm(this.state.errors)) {
         update(updatedUser).then(res => {
             if (res == 'Updated') {
               this.setState({flag: true, file:null});
               this.props.history.push(`/`);
             }
         })
     }
     else{
         this.setState({invalid: 1});
     }
  }

    addMarker = (e) => {
    const markers = [];
    markers.push(e.latlng);
    this.setState({markers})
  };

  render() {
    return (
      <div className="container">
          <div className="row">
          <div className="mt-5 mx-auto" style={{paddingBottom:'20px'}}>
     <form noValidate onSubmit={this.onSubmit}>
              <h1 className="h3 mb-3 font-weight-normal">Update Post</h1>
              <div className="form-group">
                  {this.state.invalid >0 &&  <Alert color="danger">
                  Your update attempt is invalid. Please try again!
                </Alert> }

             <Map style={{width:'600px', height:'400px'}}
            center={this.state.center}
            onClick={this.addMarker}
            zoom={13}
            >
                 <ReactLeafletSearch  position="topleft"
                    inputPlaceholder="Enter a place"
                    search={[]} // Setting this to [lat, lng] gives initial search input to the component and map flies to that coordinates, its like search from props not from user
                    zoom={12} // Default value is 10
                    showMarker={false}
                    showPopup={true}
                    openSearchOnLoad={false} // By default there's a search icon which opens the input when clicked. Setting this to true opens the search by default.
                    closeResultsOnClick={true} // By default, the search results remain when you click on one, and the map flies to the location of the result. But you might want to save space on your map by closing the results when one is clicked. The results are shown again (without another search) when focus is returned to the search input.
                    providerOptions={{searchBounds: []}} // The BingMap and OpenStreetMap providers both accept bounding coordinates in [se,nw] format. Note that in the case of OpenStreetMap, this only weights the results and doesn't exclude things out of bounds.
                    customProvider={undefined | {search: (searchString)=> {}}}  />

            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
            />
                 {console.log(this.state.markers)}
            {this.state.markers.map((position, idx) =>
              <Marker key={`marker-${idx}`} position={position}>
              <Popup>
                <span>latitude: {this.state.markers[0]['lat']} <br/> longitude: {this.state.markers[0]['lng']}</span>
              </Popup>
            </Marker>
            )}
          </Map>
                  <br/>
                <label htmlFor="name">Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  placeholder="Enter your title"
                  value={this.state.title}
                  onChange={this.onChange}
                  noValidate
                />
                 {this.state.errors.title.length > 0 &&
                <span className='error'>{this.state.errors.title}</span>}
              </div>
         <div className="form-group">
             <table>
                 <tr>
                     <td>
                            <label htmlFor="name">Start date &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                            <DatePicker
                             name="startDate"
                             selected={new Date(this.state.startDate)}
                             onChange={this.handleChangeStart}
                             dateFormat="dd/MM/yyyy"
                             minDate = {new Date()}

                            />
                     </td>
                     <td>
                               <label htmlFor="name">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;End date
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                            <DatePicker
                             name="endDate"
                             selected={new Date(this.state.endDate)}
                             onChange={this.handleChangeEnd}
                             dateFormat="dd/MM/yyyy"
                             minDate = {new Date()}
                            />
                     </td>
                 </tr>
             </table>
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
                {this.state.errors.country.length > 0 &&
                <span className='error'>{this.state.errors.country}</span>}
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
                 {this.state.errors.city.length > 0 &&
                <span className='error'>{this.state.errors.city}</span>}
              </div>


             <div className="form-group">
                <label htmlFor="name">Content</label>
                  <br></br>
               <textarea name="content" placeholder="Enter Content" cols="75" rows="5"
                         value={this.state.content} onChange={this.onChange}></textarea>
                  <br/>
                     {this.state.errors.content.length  > 0 &&
                                     <span className='error'>{this.state.errors.content}</span> }
              </div>
              <button
                type="submit"
                className="btn btn-lg btn-primary btn-block"
              >
                Update
              </button>
            </form>

          </div>
          </div>
      </div>
    )
  }
}


export default EditPost