import React from 'react';
import ReactDOM from 'react-dom';

export default class Header extends React.Component {
  render() {
    return (
      <header>
        <a class="button" onClick={ this._logoClicked.bind(this) }>
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
