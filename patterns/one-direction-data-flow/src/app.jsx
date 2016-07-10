import React from 'react';
import ReactDOM from 'react-dom';

var Store = {
  _handlers: [],
  _data: '',
  onChange: function(handler) {
    this._handlers.push(handler);
  },
  set: function(value) {
    this._data = value;
    this._handlers.forEach(handler => handler())
  },
  get: function() {
    return this._data;
  }
};

class Input extends React.Component {
  constructor(props) {
    super(props);
    this._onInputChange = e => Store.set(e.target.value);
  }
  render() {
    return <input value={ this.props.value } onChange={ this._onInputChange } />;
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    }
    Store.onChange(() => {
      this.setState({ value: Store.get() })
    });
  }
  render() {
    return <Input value={ this.state.value }/>;
  }
};

ReactDOM.render(<App />, document.querySelector('#container'));
