import React, { Component } from 'react'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css";
import {Map, TileLayer, Marker, Popup, MapControl, withLeaflet, Circle} from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet';
import ReactLeafletSearch from "react-leaflet-search";
import Alert from "reactstrap/es/Alert";
import axios from "axios";

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
      clicked: false,
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


  addMarker = (e) => {
    const lat = e.latlng['lat'];
    const lng = e.latlng['lng'];

    this.setState({lat:lat, lng:lng, clicked:true});
    axios.defaults.withCredentials = true;
     axios
    .get('http://127.0.0.1:5000/getMarkers', {
        params: {lat: lat, lng: lng, radius: this.state.radius, start: this.state.startDate, end: this.state.endDate
        ,onlyFollowing: false}
    })
    .then(response => {
        this.setState({
            markers: response.data.markers,
            descriptions: response.data.descriptions
        })
    })

  };

  componentDidMount() {
       axios.defaults.withCredentials = true;
     axios
    .get('http://127.0.0.1:5000/getMarkers', {
        params: {lat: 0, lng: 0, radius: this.state.radius, start: this.state.startDate, end: this.state.endDate
            , onlyFollowing: true}
    })
    .then(response => {
        this.setState({
            markers: response.data.markers,
            descriptions: response.data.descriptions
        })
    })
  }

    render() {
      const greenIcon = new L.Icon({
      iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    return (
      <div className="container">
        <div className="row">
          <div className="mt-6 mx-auto" style={{paddingBottom:'20px', paddingRight:'500px'}}>
            <form noValidate onSubmit={this.onSubmit}>
              <h1 className="h3 mb-3 font-weight-normal" align="center" style={{paddingTop:'20px',paddingLeft:'300px'}}>Find Travel Partners</h1>
              <div className="form-group">
                    {this.state.invalid >0 &&  this.state.markers.length==0 && <Alert color="danger">
                  Please choose a location on map
                </Alert> }
                 <div className="form-group" class = "left"  style={{ paddingLeft:'150px'}}>
                       <label htmlFor="name">Start date</label><br></br>
                                    <DatePicker
                                     name="StartDate"
                                     selected={this.state.startDate}
                                     onChange={this.handleChangeStart}
                                     dateFormat="dd/MM/yyyy"
                                     minDate = {new Date()}
                                    />
                                    <br></br>
                         <label htmlFor="name">End date</label><br></br>
                                    <DatePicker
                                     name="EndDate"
                                     selected={this.state.endDate}
                                     onChange={this.handleChangeEnd}
                                     dateFormat="dd/MM/yyyy"
                                     minDate = {new Date()}
                                    />
                                     <br></br>
                       <label htmlFor="name">Radius</label>
                                    <input
                                        style={{width:"70%"}}
                                      type="text"
                                      className="form-control"
                                      name="radius"
                                      placeholder="Enter a Radius"
                                      value={this.state.radius}
                                      onChange={this.onChange}
                                      noValidate
                                    />
                 </div>
                  <div class = "right" style={{paddingTop:'10px'}}>
                     <Map
                    center={[51.505, -0.09]}
                    onClick={this.addMarker}
                    zoom={13}
                    >
                         <ReactLeafletSearch position="topleft"
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
                         {this.state.clicked?   <Circle center={[this.state.lat, this.state.lng]} fillColor="red" color = "red" radius={this.state.radius*1000} />: null}
                    {this.state.markers.map((position, idx) => this.state.descriptions[idx]['is_following']?
                      <Marker key={`marker-${idx}`} icon={greenIcon}  position={position}>
                          {this.state.markers.length>0 && <Popup>
                        <span>
                         <br/> user: {this.state.descriptions[idx]['user_name']}
                         <br/> title: {this.state.descriptions[idx]['title']}
                         <br/> start date: {(new Date(this.state.descriptions[idx]['startDate'])).toLocaleDateString('en-GB') }
                         <br/> end date: {(new Date(this.state.descriptions[idx]['endDate'])).toLocaleDateString('en-GB')}</span>
                      </Popup>}
                    </Marker>:  <Marker key={`marker-${idx}`}   position={position}>
                          {this.state.markers.length>0 && <Popup>
                        <span>
                         <br/> user: {this.state.descriptions[idx]['user_name']}
                         <br/> title: {this.state.descriptions[idx]['title']}
                         <br/> start date: {(new Date(this.state.descriptions[idx]['startDate'])).toLocaleDateString('en-GB') }
                         <br/> end date: {(new Date(this.state.descriptions[idx]['endDate'])).toLocaleDateString('en-GB')}</span>
                      </Popup>}
                    </Marker>
                    )}
                  </Map>
                  </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default FindPartners