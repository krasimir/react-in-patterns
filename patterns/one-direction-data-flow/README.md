## [React in patterns](../../README.md) / One direction data flow

> [Source code](https://github.com/krasimir/react-in-patterns/tree/master/patterns/one-direction-data-flow/src)

One direction data flow is a pattern that works nicely with React. It is around the idea that the components do not modify the data that they receive. They only register a change and provide the new value but they do not update the actual data store. This happens following another mechanism and the component just gets rendered with the new value.

Let's for example get a simple `Input` component that contains a single text box. Once we type in the component sends out the value.

```js
class Input extends React.Component {
  constructor(props) {
    super(props);
    this._onInputChange = e => this.props.onChange(e.target.value);
  }
  render() {
    return <input onChange={ this._onInputChange } />;
  }
};
```

`Input` expects a single prop called `onChange`.

To illustrates the concept we'll borrow some ideas from the [Flux](https://facebook.github.io/flux/docs/overview.html) architecture. One of the parts in there is the *Store*. That's the place where we keep our data. It also listens for changes coming from a so called *dispatcher* and reacts on these changes by updating its state and firing a new rendering of the views. We'll not use a dispatcher in this example but let's create a simple store:

```js
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
```

There are two *private* variables - `_handlers` will keep functions which are invoked once the `_data` changes. We may pass our handlers using the `onChange` method and update/retrieve the `_data` via `_set`/`_get`.

Let's say that we have an `Input` component that is just a text box. Once we type something we update the store:

```js
class Input extends React.Component {
  constructor(props) {
    super(props);
    this._onInputChange = e => Store.set(e.target.value);
  }
  render() {
    return <input onChange={ this._onInputChange } />;
  }
};
```
