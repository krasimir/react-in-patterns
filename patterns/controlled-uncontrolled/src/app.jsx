import React from 'react';
import ReactDOM from 'react-dom';

// class App extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { value: '' };
//   }
//   render() {
//     return <input type='text' value={ this.state.value } />;
//   }
// };

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };
    this._change = this._handleInputChange.bind(this);
  }
  render() {
    return (
      <input
        type='text'
        value={ this.state.value }
        onChange={ this._change } />
    );
  }
  _handleInputChange(e) {
    this.setState({ value: e.target.value });
  }
};

ReactDOM.render(<App />, document.querySelector('#container'));
