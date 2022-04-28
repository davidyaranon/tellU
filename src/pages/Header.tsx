import React, { Component } from 'react';
import { IonToolbar, IonTabBar, IonHeader, IonFab } from '@ionic/react';
import IconButton from '@mui/material/IconButton';
import logo from '../images/React.webp'
import FCM from '../images/FCM.png'
import tellU from '../images/tellU.png';
import tellU_white from '../images/tellU_white.png';
import tellU_gray from '../images/tellU_gray.png';
import '../App.css';
import { any } from 'prop-types';

export const ionHeaderStyle = {
  textAlign: 'center',
  padding: "5vh",
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