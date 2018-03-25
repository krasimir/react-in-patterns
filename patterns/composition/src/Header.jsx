import React from 'react';
import PropTypes from 'prop-types';

export default class Header extends React.Component {
  render() {
    return (
      <header>
        <a className='button' onClick={ this._logoClicked.bind(this) }>
          Logo
        </a>
        <hr />
        { this.props.title }
        <hr />
        { this.props.children }
      </header>
    );
  }
  _logoClicked() {
    this.props.track && this.props.track('logo-clicked');
  }
};

Header.propTypes = {
  title: PropTypes.any,
  track: PropTypes.func,
  children: PropTypes.any
};
