import React, { useState } from 'react';
import ReactDOM from 'react-dom';

/*
function Title(props) {
  return <h1>{ props.text }</h1>;
}
// App.jsx
function App() {
  return <Title text='Hello React' />;
}
*/

function NameField({ valueUpdated }) {
  return (
    <input onChange={ event => valueUpdated(event.target.value) } />
  );
};
function App() {
  const [ name, setName ] = useState('');
  return (
    <div>
      <NameField valueUpdated={ name => setName(name) } />
      Name: { name }
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#container'));
