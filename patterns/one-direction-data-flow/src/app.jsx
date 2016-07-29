import React from 'react';
import ReactDOM from 'react-dom';

var Store = {
  _handlers: [],
  _flag: '',
  onChange: function (handler) {
    this._handlers.push(handler);
  },
  set: function (value) {
    this._flag = value;
    this._handlers.forEach(handler => handler());
  },
  get: function () {
    return this._flag;
  }
};

class Switcher extends React.Component {
  constructor(props) {
    super(props);
    this._onButtonClick = e => {
      this.props.onChange(!this.props.value);
    };
  }
  render() {
    return (
      <button onClick={ this._onButtonClick }>
        { this.props.value ? 'lights on' : 'lights off' }
      </button>
    );
  }
};
Switcher.propTypes = {
  value: React.PropTypes.bool,
  onChange: React.PropTypes.func
};

class App extends React.Component {
  constructor(props) {
    super(props);
    Store.onChange(this.forceUpdate.bind(this));
  }
  render() {
    return (
      <div>
        <Switcher
          value={ !!Store.get() }
          onChange={ Store.set.bind(Store) } />
      </div>
    );
  }
};

ReactDOM.render(<App />, document.querySelector('#container'));
