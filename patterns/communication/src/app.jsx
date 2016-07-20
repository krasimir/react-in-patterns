import React from 'react';
import ReactDOM from 'react-dom';

class Title extends React.Component {
  render() {
    return (
      <h1>
        <a onClick={ this.props.logoClicked }>
          <img src='path/to/logo.png' />
        </a>
        { this.props.text }
        { this.props.children }
        <a onClick={ this._clickHandler.bind(this) }>click me</a>
      </h1>
    );
  }
  _clickHandler() {
    console.log(this.props.children);
  }
};

class SomethingElse extends React.Component {
  constructor(props) {
    super(props);
    this.state = { answer: 42 };
  }
  render() {
    return <div>The answer is { this.state.answer }</div>;
  }
}

class App extends React.Component {
  render() {
    return (
      <Title text='Hello React' logoClicked={ this.logoClicked }>
        <span> community</span>
        <SomethingElse />
      </Title>
    );
  }
  logoClicked() {
    console.log('logo clicked');
  }
};

ReactDOM.render(<App />, document.querySelector('#container'));
