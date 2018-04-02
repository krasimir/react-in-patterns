import React from 'react';
import ReactDOM from 'react-dom';
import Header from './Header.jsx';
import { Provider } from './context';

class App extends React.Component {
  render() {
    return (
      <Provider value={ { title: 'React In Patterns' } }>
        <Header />
      </Provider>
    );
  }
};

ReactDOM.render(<App />, document.querySelector('#container'));
