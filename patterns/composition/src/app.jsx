import React from 'react';
import ReactDOM from 'react-dom';

import Header from './Header.jsx';
import Navigation from './Navigation.jsx';

class App extends React.Component {
  render() {
    var title = <h1>Hello there!</h1>;

    return (
      <Header track={ this._track } title={ title }>
        <Navigation track={ this._track } />
      </Header>
    );
  }
  _track(label) {
    console.log(`Tracking: ${ label }`);
  }
};

ReactDOM.render(<App />, document.querySelector('#container'));
