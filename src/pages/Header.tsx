import React, { Component } from 'react';
import { IonToolbar, IonTabBar, IonHeader, IonFab } from '@ionic/react';
import IconButton from '@mui/material/IconButton';
import logo from '../images/React.webp'
import FCM from '../images/FCM.png'
import '../App.css';
import { any } from 'prop-types';

export const ionHeaderStyle = {
    textAlign: 'center',
    padding: "2.5vh",
};

class Header extends Component<any, any>{
    render(){
        return (

            <div className='header'>
                <IconButton>
                    <img 
                        className='quantum_logo'
                        src={logo}
                        alt="QUANTUM"
                        style={{zoom: 1.5}}
                    />
                </IconButton>
                <IonFab horizontal='end'>
                    <p style={{fontWeight:"bold"}}>{this.props.schoolName}</p>
                </IonFab>
            </div>
        )
    }
}

export default React.memo(Header);