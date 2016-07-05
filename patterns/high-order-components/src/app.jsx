import React from 'react';
import ReactDOM from 'react-dom';

import enhanceComponent from './enhanceComponent.jsx';

class Content extends React.Component {
  render() {
    return <p>I am content</p>;
  }
}

class App extends React.Component {
  render() {
    var EnhancedContent = enhanceComponent(Content);

    return <EnhancedContent />;
  }
};

ReactDOM.render(<App />, document.querySelector('#container'));
