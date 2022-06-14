import React from "react";
import Styled from 'styled-components';

interface info {
  percentage: string;
}

const Container = Styled.div`
  progress[value] {
    width: 100vw;
    --webkit-appearance : none;
    appearance: none;
  }

  progress[value]::-webkit-progress-bar {
    margin-top: 10px;
    height: 7.5px;
    border-radius: 20px;
    background-color: #eee;
  }
  
  progress[value]::-webkit-progress-value {
    margin-top: 10px;
    height: 7.5px;
    border-radius: 20px;
    background-color: #61DBFB;
  }

`;

const ProgressBar = (props: info) => {

  return (
    <Container>
      <progress value={parseInt(props.percentage)} max={200} />
    </Container>
  )
}

export default ProgressBar;