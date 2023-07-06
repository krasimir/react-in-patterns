import React from 'react';
import ReactDOM from 'react-dom';

function Title(props) {
  return <h1>{ props.text }</h1>;
}

// App.jsx
function App() {
  return <Title text='Hello React' />;
}

ReactDOM.render(<App />, document.querySelector('#container'));
