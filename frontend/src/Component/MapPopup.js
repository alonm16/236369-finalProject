import React from "react";
import "../index.css";
import {Map, Marker, Popup, TileLayer} from "react-leaflet";
import ReactLeafletSearch from "react-leaflet-search";
class MapPopup extends React.Component {

  render() {
      const position = this.props.position;
    return (
      <div className="popup" >
        <div style={{backgroundColor:"white", marginLeft:"30px"}}>
        <div className="popup\_inner">
          <button onClick={this.props.closePopup}>close me</button>
        </div>
           <br/>
           <Map style={{width:'600px', height:'400px'}}
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
      </div>
      </div>
    );
  }
}

export default MapPopup;
