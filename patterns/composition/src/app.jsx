import React from 'react';
import ReactDOM from 'react-dom';

import Header from './Header.jsx';
import Navigation from './Navigation.jsx';

class App extends React.Component {
  render() {
    return (
      <Header track={ this._track } >
        <Navigation track={ this._track } />
      </Header>
    );
  }
  _track(label) {
    console.log(`Tracking: ${ label }`);
  }
};

ReactDOM.render(<App />, document.querySelector('#container'));