import React, { Component } from 'react'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css";
import {Map, TileLayer, Marker, Popup, MapControl, withLeaflet} from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import ReactLeafletSearch from "react-leaflet-search";
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
      latitude: newPost.latitude,
      longitude: newPost.longitude

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
};

class FindPartners extends Component {
  constructor() {
    super()
    this.state = {
      startDate: new Date(),
      endDate: new Date(),
      radius: 0,
      lat: 51.505,
      lng: -0.09,
      zoom: 13,
      markers: [],
      descriptions: [],
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
    if(this.state.markers.length==0)
        {
             this.setState({invalid: 1});
             return;
        }
     const newPost = {
      title: this.state.title,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      country: this.state.country,
      city: this.state.city,
      content: this.state.content,
      latitude: this.state.markers[0]['lat'] ,
      longitude: this.state.markers[0]['lng']
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

  addMarker = (e) => {
    const lat = e.latlng['lat'];
    const lng = e.latlng['lng'];
    this.setState({lat:lat, lng:lng});
    axios.defaults.withCredentials = true;
     axios
    .get('http://127.0.0.1:5000/getMarkers', {
        params: {lat: lat, lng: lng, radius: this.state.radius, start: this.state.startDate, end: this.state.endDate}
    })
    .then(response => {
        this.setState({
            markers: response.data.markers,
            descriptions: response.data.descriptions
        })
    })

  };



  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-6 mt-6 mx-auto" style={{paddingBottom:'20px'}}>
            <form noValidate onSubmit={this.onSubmit}>
              <h1 className="h3 mb-3 font-weight-normal">Find Travel Partners</h1>
              <div className="form-group">
                    {this.state.invalid >0 &&  this.state.markers.length==0 && <Alert color="danger">
                  Please choose a location on map
                </Alert> }
                 <div className="form-group">
                     <table>
                         <tr>
                             <td>
                                 <label htmlFor="name">Start date</label><br></br>
                                    <DatePicker
                                     name="StartDate"
                                     selected={this.state.startDate}
                                     onChange={this.handleChangeStart}
                                     dateFormat="dd/MM/yyyy"
                                     minDate = {new Date()}
                                    />
                             </td>
                             <td>
                                    <label htmlFor="name">End date</label><br></br>
                                    <DatePicker
                                     name="EndDate"
                                     selected={this.state.endDate}
                                     onChange={this.handleChangeEnd}
                                     dateFormat="dd/MM/yyyy"
                                     minDate = {new Date()}
                                    />
                             </td>
                             <td>
                                    <label htmlFor="name">Radius</label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      name="radius"
                                      placeholder="Enter a Radius"
                                      value={this.state.radius}
                                      onChange={this.onChange}
                                      noValidate
                                    />
                             </td>
                         </tr>
                     </table>
                 </div>
             <Map
            center={[51.505, -0.09]}
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
            {this.state.markers.map((position, idx) =>
              <Marker key={`marker-${idx}`} position={position}>
                  {this.state.markers.length>0 && <Popup>
                <span>latitude: {this.state.markers[idx]['lat']} <br/> longitude: {this.state.markers[idx]['lng']}
                <br/> title: {this.state.descriptions[idx]['title']}
                 <br/> user: {this.state.descriptions[idx]['user_name']}
                 <br/> title: {this.state.descriptions[idx]['title']}
                 <br/> start date: {this.state.descriptions[idx]['startDate'] }
                 <br/> end date: {this.state.descriptions[idx]['endDate']}</span>
              </Popup>}
            </Marker>
            )}
          </Map>
              </div>
            </form>
              <p className="text-secondary">
                  <h5>Latitude: {this.state.lat} &nbsp;&nbsp;&nbsp;&nbsp; Longitude: {this.state.lng}</h5>
                  </p>
          </div>
        </div>
      </div>
    )
  }
}

export default FindPartners