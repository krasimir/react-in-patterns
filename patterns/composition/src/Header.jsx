import React from 'react';

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
  title: React.PropTypes.any,
  track: React.PropTypes.func,
  children: React.PropTypes.any
};
