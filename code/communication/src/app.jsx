import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

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
          <img src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K' width='30'/>
        </a>
        { this.props.text }
        { this.props.children }
        <a onClick={this._clickHandler}>click me</a>
      </h1>
    );
  }
};
Title.propTypes = {
  logoClicked: PropTypes.func,
  text: PropTypes.string,
  children: PropTypes.any
};

class SomethingElse extends React.Component {
  render() {
    return <div>The answer is { this.props.answer }</div>;
  }
}
SomethingElse.propTypes = {
  answer: PropTypes.element
};

class Answer extends React.Component {
  render() {
    return <span>42</span>;
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
        <SomethingElse answer={ <Answer /> } />
      </Title>
    );
  }
};

ReactDOM.render(<App />, document.querySelector('#container'));
