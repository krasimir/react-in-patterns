import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Header from './Header.jsx';
import Navigation from './Navigation.jsx';

const Title = () => <h1>Hello there!</h1>;

class DataProvider extends React.Component {
  constructor(props) {
    super(props);

    this.state = { data: null };
    setTimeout(() => this.setState({ data: 'Hey there!' }), 5000);
  }
  render() {
    if (this.state.data === null) return null;
    return <section>{ this.props.render(this.state.data) }</section>;
  }
}
DataProvider.propTypes = {
  render: PropTypes.func
};

class App extends React.Component {
  render() {
    return (
      <Header track={ this._track } title={ <Title /> }>
        <Navigation track={ this._track } />
        <DataProvider render={ message => <p>{ message }</p> } />
      </Header>
    );
  }
  _track(label) {
    console.log(`Tracking: ${ label }`);
  }
};

ReactDOM.render(<App />, document.querySelector('#container'));
