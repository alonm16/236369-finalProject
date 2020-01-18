import React from "react";
import "../index.css";
import {Map, Marker, Popup, TileLayer} from "react-leaflet";
import ReactLeafletSearch from "react-leaflet-search";
import Button from "react-bootstrap/Button";
class MapPopup extends React.Component {

  render() {
      const position = this.props.position;
    return (
      <div className="popup" >
        <div style={{backgroundColor:"#cc9966", marginLeft:"30px" , borderRadius: '10px'}}>
        <div className="popup\_inner">
          <Button variant="outline-dark" onClick={this.props.closePopup}  style={{marginLeft:'350px'}}>close</Button>
        </div>
           <Map style={{width:'600px', height:'400px', float:'none', margin:'0 auto'}}
            center={position}
            zoom={13}
            >

            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
            />
              <Marker position={position}>
               <Popup>
                <span>latitude: {position['lat']} <br/> longitude: {position['lng']}</span>
              </Popup>
            </Marker>
            )}
          </Map>
            <br/>
      </div>
      </div>
    );
  }
}

export default MapPopup;
