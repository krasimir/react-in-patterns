import React from 'react';

export default function Clock(props) {
  var [ hours, minutes, seconds ] = [
    props.hours,
    props.minutes,
    props.seconds
  ].map(num => num < 10 ? '0' + num : num);

  return <h1>{ hours } : { minutes } : { seconds }</h1>;
};
Clock.propTypes = {
  hours: React.PropTypes.number.isRequired,
  minutes: React.PropTypes.number.isRequired,
  seconds: React.PropTypes.number.isRequired
};
