import React from 'react';
import ReactDOM from 'react-dom';

import { Provider, connect } from 'react-redux';
import { createStore, combineReducers } from 'redux';

// Action creators

const ADD = 'ADD';
const SUBTRACT = 'SUBTRACT';
const CHANGE_VISIBILITY = 'CHANGE_VISIBILITY';

const add = () => ({ type: ADD });
const subtract = () => ({ type: SUBTRACT });
const changeVisibility = visible => ({ type: CHANGE_VISIBILITY, visible });

// Reducers

const initialState = {
  counter: {
    value: 0
  },
  visible: true
};
const counterReducer = function (state, action) {
  console.log(state, action);
  if (action.type === ADD) {
    return { value: state.value + 1 };
  } else if (action.type === SUBTRACT) {
    return { value: state.value - 1 };
  }
  return state || { value: 0 };
};
const visibilityReducer = function (state, action) {
  if (action.type === CHANGE_VISIBILITY) {
    return action.visible;
  }
  return true;
};
const rootReducer = combineReducers({
  counter: counterReducer,
  visible: visibilityReducer
});

// Selectors

const getCounterValue = state => state.counter.value;
const getVisibility = state => state.visible;

// Store creation

const store = createStore(rootReducer, initialState);

// React components

function Counter({ value, add, subtract }) {
  return (
    <div>
      <p>Value: { value }</p>
      <button onClick={ add }>Add</button>
      <button onClick={ subtract }>Subtract</button>
    </div>
  );
}
const CounterConnected = connect(
  state => ({
    value: getCounterValue(state)
  }),
  dispatch => ({
    add: () => dispatch(add()),
    subtract: () => dispatch(subtract())
  })
)(Counter);

function Visibility({ changeVisibility }) {
  return (
    <div>
      <button onClick={ () => changeVisibility(true) }>Visible</button>
      <button onClick={ () => changeVisibility(false) }>Hidden</button>
    </div>
  );
}
const VisibilityConnected = connect(
  null,
  dispatch => ({
    changeVisibility: value => dispatch(changeVisibility(value))
  })
)(Visibility);

function App({ visible }) {
  return (
    <div>
      <VisibilityConnected />
      { visible && <CounterConnected /> }
    </div>
  );
}
const AppConnected = connect(
  state => ({
    visible: getVisibility(state)
  })
)(App);

ReactDOM.render(<Provider store={ store }><AppConnected /></Provider>, document.querySelector('#container'));
