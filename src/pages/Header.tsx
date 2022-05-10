import React, { Component } from 'react';
import { IonHeader } from '@ionic/react';
import IconButton from '@mui/material/IconButton';
import tellU from '../images/tellU.png';
import tellU_white from '../images/tellU_white.png';
import tellU_gray from '../images/tellU_gray.png';
import '../App.css';
export const ionHeaderStyle = {
  textAlign: 'center',
  padding: "2.5vh",
};

class Header extends Component<any, any>{
  render() {
    const dark: boolean = this.props.darkMode;
    if (dark) {
      return (

        <IonHeader class="ion-no-border" style={{ textAlign: "center" }}>
          <IconButton>
            <img
              className='quantum_logo'
              src={tellU_white}
              alt="QUANTUM"
              style={{ zoom: 1.2 }}
            />
          </IconButton>
          <p style={{ fontWeight: "bold" }}>{this.props.schoolName}</p>
        </IonHeader>
      )
    } else {
      return (

        <IonHeader class="ion-no-border" style={{textAlign: "center"}}>
            <IconButton>
                <img 
                    className='quantum_logo'
                    src={tellU}
                    alt="QUANTUM"
                    style={{zoom: 1.2}}
                />
            </IconButton>
            <p style={{fontWeight:"bold"}}>{this.props.schoolName}</p>
        </IonHeader>
      )
    }
  }
}

export default React.memo(Header);