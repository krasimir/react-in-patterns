import React from 'react';
import PropTypes from 'prop-types';

export default class Navigation extends React.Component {
  constructor(props) {
    super(props);

    this.links = [
      'About', 'Products', 'Contacts'
    ];
  }
  render() {
    return (
      <nav>
        <ul>
          { this.links.map(
            (label, index) => {
              let onClickHandler = this._onLinkClicked.bind(this, index);

              return (
                <li key={ index }>
                  <a onClick={ onClickHandler }>
                  { label }
                  </a>
                </li>
              );
            }
          ) }
        </ul>
      </nav>
    );
  }
  _onLinkClicked(index) {
    this.props.track && this.props.track(`${ this.links[index] }-clicked`);
  }
};

Navigation.propTypes = {
  track: PropTypes.func
};
