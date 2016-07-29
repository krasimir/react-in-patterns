import React from 'react';
import ReactDOM from 'react-dom';

import enhanceComponent from './enhanceComponent.jsx';

var Content = (props) => <p>I am { props.name }</p>;

Content.propTypes = {
  name: React.PropTypes.string
};

class App extends React.Component {
  render() {
    var EnhancedContent = enhanceComponent(Content);

    return <EnhancedContent name='Content component' />;
  }
};

ReactDOM.render(<App />, document.querySelector('#container'));
