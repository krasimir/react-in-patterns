import React from 'react';
import ReactDOM from 'react-dom';

import Header from './Header.jsx';
import Navigation from './Navigation.jsx';

const Title = () => <h1>Hello there!</h1>;

class App extends React.Component {
  render() {
    return (
      <Header track={ this._track } title={ <Title /> }>
        <Navigation track={ this._track } />
      </Header>
    );
  }
  _track(label) {
    console.log(`Tracking: ${ label }`);
  }
};

ReactDOM.render(<App />, document.querySelector('#container'));
