import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
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
  data: PropTypes.object,
  get: PropTypes.func,
  register: PropTypes.func
};

ReactDOM.render(<App />, document.querySelector('#container'));
