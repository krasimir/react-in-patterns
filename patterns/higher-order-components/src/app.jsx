import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import enhanceComponent from './enhanceComponent.jsx';

var Content = (props) => <p>I am { props.name }</p>;
var EnhancedContent = enhanceComponent(Content);

Content.propTypes = {
  name: PropTypes.string
};

class App extends React.Component {
  render() {
    return <EnhancedContent name='Content component' />;
  }
};

ReactDOM.render(<App />, document.querySelector('#container'));
