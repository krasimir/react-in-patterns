import React from 'react';
import ReactDOM from 'react-dom';
import Header from './Header.jsx';
import dependencies from './dependencies';
import { Provider } from './context';

dependencies.register('title', 'React in patterns');

class App extends React.Component {
  render() {
    return (
      <Provider value={ dependencies }>
        <Header />
      </Provider>
    );
  }
};

ReactDOM.render(<App />, document.querySelector('#container'));
