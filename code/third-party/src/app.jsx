import React from 'react';
import ReactDOM from 'react-dom';
import Tags from './Tags.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);

    this._addNewTag = this._addNewTag.bind(this);
    this.state = {
      tags: ['JavaScript', 'CSS' ],
      newTag: null
    };
  }
  _addNewTag() {
    this.setState({ newTag: this.refs.field.value });
  }
  render() {
    return (
      <div>
        <p>Add new tag:</p>
        <div>
          <input type='text' ref='field' />
          <button onClick={ this._addNewTag }>Add</button>
        </div>
        <Tags tags={ this.state.tags } newTag={ this.state.newTag } />
      </div>
    );
  }
}
App.propTypes = {
  service: React.PropTypes.object
};

ReactDOM.render(<App />, document.querySelector('#container'));
