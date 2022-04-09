import { Component } from 'react';
import IconButton from '@mui/material/IconButton';
import logo from '../images/React.webp'
import FCM from '../images/FCM.png'
import '../App.css';

class Header extends Component {
    render(){
        return (
            <div className='header'>
                <IconButton>
                    <img 
                        className='quantum_logo'
                        src={FCM}
                        alt="QUANTUM"
                        style={{zoom: 1.5}}
                    />
                </IconButton>
            </div>
        )
    }
}

export default Header;