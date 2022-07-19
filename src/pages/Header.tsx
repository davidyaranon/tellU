import React, { Component } from 'react';
import { IonHeader } from '@ionic/react';
import tellU from '../images/tellU.png';
import tellU_white from '../images/tellU_white.png';
import '../App.css';
export const ionHeaderStyle = {
  textAlign: 'center',
  padding: "2.5vh",
};

class Header extends Component<any, any>{
  render() {
    const dark : boolean = this.props.darkMode;
    const zoom : number = this.props.zoom;
    if (dark) {
      return (
        <div style={{ width: "100%" }}>
          <IonHeader class="ion-no-border" style={{ textAlign: "center" }}>
            {/* <IconButton> */}
              <img
                draggable={false}
                className='quantum_logo'
                src={tellU_white}
                alt="QUANTUM"
                style={{ zoom: zoom }}
              />
            {/* </IconButton> */}
            <p style={{ fontWeight: "bold" }}>{this.props.schoolName}</p>
          </IonHeader>
        </div>
      )
    } else {
      return (
        <div style={{ width: "100%" }}>
          <IonHeader class="ion-no-border" style={{ textAlign: "center" }}>
            {/* <IconButton> */}
              <img
                draggable={false}
                className='quantum_logo'
                src={tellU}
                alt="QUANTUM"
                style={{ zoom: zoom }}
              />
            {/* </IconButton> */}
            <p style={{ fontWeight: "bold" }}>{this.props.schoolName}</p>
          </IonHeader>
        </div>
      )
    }
  }
}

export default React.memo(Header);