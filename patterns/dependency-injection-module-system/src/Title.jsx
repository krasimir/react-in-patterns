import React from 'react';
import { wire } from './di.jsx';

export default wire(
  function Title(props) {
    return <h1>{ props.title }</h1>;
  },
  ['my-awesome-title'],
  title => ({ title })
);
