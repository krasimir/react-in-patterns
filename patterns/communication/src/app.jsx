import React from 'react';
import ReactDOM from 'react-dom';

class Title extends React.Component {
  constructor(props) {
    super(props);
    this._clickHandler = this._clickHandler.bind(this);
  }
  _clickHandler() {
    console.log(this.props.children);
  }
  render() {
    return (
      <h1>
        <a onClick={this.props.logoClicked}>
          <img src='path/to/logo.png' />
        </a>
        { this.props.text }
        { this.props.children }
        <a onClick={this._clickHandler}>click me</a>
      </h1>
    );
  }
};
Title.propTypes = {
  logoClicked: React.PropTypes.func,
  text: React.PropTypes.string,
  children: React.PropTypes.any
};

class SomethingElse extends React.Component {
  constructor(props) {
    super(props);
    this.state = { answer: 42 };
  }
  render() {
    return <div>The answer is {this.state.answer}</div>;
  }
}

class App extends React.Component {
  logoClicked() {
    console.log('logo clicked');
  }
  render() {
    return (
      <Title text='Hello React' logoClicked={this.logoClicked}>
        <span>community</span>
        <SomethingElse />
      </Title>
    );
  }
};

ReactDOM.render(<App />, document.querySelector('#container'));
