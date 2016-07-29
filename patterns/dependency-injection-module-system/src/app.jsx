import React from 'react';
import ReactDOM from 'react-dom';
import Header from './Header.jsx';
import { register } from './di.jsx';

register('my-awesome-title', 'React in patterns');

class App extends React.Component {
  render() {
    return <Header />;
  }
};

ReactDOM.render(<App />, document.querySelector('#container'));
