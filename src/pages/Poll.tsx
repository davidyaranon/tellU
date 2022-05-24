import React from 'react';

interface MatchUserPostParams {
  options : any[];
  question: string;
  results: number[];
  timestamp: any;
  userName: string;
  voteMap: {};
  votes: number;
}

const Poll = (props : any) => {
  const options : any[] = props.options;
  return (
    null
  );
}

export default React.memo(Poll);