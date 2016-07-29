import React from 'react';
import { wire } from './di.jsx';

var Title = function(props) {
  return <h1>{ props.title }</h1>;
};

export default wire(Title, ['my-awesome-title'], title => ({ title }));
