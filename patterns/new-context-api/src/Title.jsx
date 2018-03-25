import React from 'react';
import { Consumer } from './context';

function Title() {
  return (
    <Consumer>{
      dependencies => <h1>Title: { dependencies.get('title') }</h1>
    }</Consumer>
  );
}

export default Title;
