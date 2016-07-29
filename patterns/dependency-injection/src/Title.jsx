import React from 'react';
import wire from './wire';

function Title(props) {
  return <h1>{ props.title }</h1>;
}
Title.propTypes = {
  title: React.PropTypes.string
};

export default wire(Title, ['config'], function (config) {
  return { title: config.name };
});
