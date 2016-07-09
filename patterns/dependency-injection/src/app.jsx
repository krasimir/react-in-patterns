import React from 'react';
import ReactDOM from 'react-dom';
import Header from './Header.jsx';
import CONFIG from './config';
import dependencies from './dependencies';

dependencies.register('config', CONFIG);

class App extends React.Component {
  getChildContext() {
    return dependencies;
  }
  render() {
    return <Header />;
  }
};
App.childContextTypes = {
  data: React.PropTypes.object,
  get: React.PropTypes.func,
  register: React.PropTypes.func
};

ReactDOM.render(<App />, document.querySelector('#container'));
