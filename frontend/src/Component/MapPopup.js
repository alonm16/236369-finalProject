import React from 'react';

class MapPopup extends React.Component {
  render() {
return (
<div className='popup'>
<div className='popup\_inner'>
<h1>{this.props.text}</h1>
<button onClick={this.props.closePopup}>close me</button>
</div>
</div>
);
}
}

export default MapPopup;