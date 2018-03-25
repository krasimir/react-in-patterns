import React from 'react';
import PropTypes from 'prop-types';
import { wire } from './di.jsx';

var Title = function (props) {
  return <h1>{ props.title }</h1>;
};

Title.propTypes = {
  title: PropTypes.string
};

export default wire(Title, ['my-awesome-title'], title => ({ title }));
