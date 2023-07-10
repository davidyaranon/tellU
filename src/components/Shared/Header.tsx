import React, { Component } from 'react';
import { IonHeader } from '@ionic/react';

import tellU from '../../images/tellU.png';
import tellU_white from '../../images/tellU_white.png';

import humboldtImage from '../../images/humboldt_school.png'
import berkeleyImage from '../../images/berkeley_school.png'
import davisImage from '../../images/davis_school.webp';

import '../../App.css';

export const ionHeaderStyle = {
  textAlign: 'center',
  padding: "2.5vh",
};

const headerInfo: Record<string, { url: string; backgroundSize: string, backgroundPosition: string }> = {
  "Cal Poly Humboldt": {
    url: humboldtImage,
    backgroundSize: '95vw',
    backgroundPosition: '10% 80%'
  },
  "UC Berkeley": {
    url: berkeleyImage,
    backgroundSize: '135vw',
    backgroundPosition: '25% 80%'
  },
  "UC Davis": {
    url: davisImage,
    backgroundSize: '95vw',
    backgroundPosition: '10% 60%'
  },
  "": {
    url: "",
    backgroundSize: "",
    backgroundPosition: ""
  }
}

/**
 * tellU Header Component containing logo, school name, and (possible) background photo
 */
class TellUHeader extends Component<any, any>{

  render() {
    const dark: boolean = this.props.darkMode;
    const zoom: number = this.props.zoom;
    const schoolStyle = this.props.style || { fontWeight: "bold" };

    const schoolName = this.props.schoolName in headerInfo ? this.props.schoolName : "";

    return (
      <div style={{ width: "100%" }} >
        <div style={{ width: "100%", borderRadius: "10px", display: "inline-block", backgroundImage: `url(${headerInfo[schoolName].url})`, backgroundSize: `${headerInfo[schoolName].backgroundSize}`, backgroundPosition: `${headerInfo[schoolName].backgroundPosition}` }}>
          <IonHeader className="ion-no-border" style={{ textAlign: "center", top: "1vh" }}>
            <img draggable={false} className='quantum_logo' src={dark ? tellU_white : tellU} alt="QUANTUM" style={{ zoom: zoom }} />
            <p style={schoolStyle}>{schoolName}</p>
          </IonHeader>
        </div>
      </div>
    );
  }
}

export default React.memo(TellUHeader);