## [React in patterns](../../README.md) / Event handlers

* [Source code](https://github.com/krasimir/react-in-patterns/tree/master/patterns/event-handlers/src)

---

Most of the times we handle DOM events in the component that contains the elements dispatching the events. Like in the example below, we have a click handler and we want to run a function of the same component:

```js
class Switcher extends React.Component {
  render() {
    return (
      <button onClick={ this._handleButtonClick }>
        click me
      </button>
    );
  }
  _handleButtonClick() {
    console.log('Button is clicked');
  }
};
```

That's all fine because `_handleButtonClick` is a function and we indeed pass a function to the `onClick` attribute. The problem is that as it is the code doesn't keep the scope. So, if we have to use `this` inside `_handleButtonClick` we'll get an error.

```js
class Switcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name: 'React in patterns' };
  }
  render() {
    return (
      <button onClick={ this._handleButtonClick }>
        click me
      </button>
    );
  }
  _handleButtonClick() {
    console.log(`Button is clicked inside ${ this.state.name }`);
    // leads to
    // Uncaught TypeError: Cannot read property 'state' of null
  }
};
```

What we normally do is to use `bind` like so:

```js
<button onClick={ this._handleButtonClick.bind(this) }>
  click me
</button>
```

However, this means that the `bind` function is called again and again because we may render the button many times. A better approach would be to create the bindings in the constructor of the component:

```js
class Switcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name: 'React in patterns' };
    this._buttonClick = this._handleButtonClick.bind(this);
  }
  render() {
    return (
      <button onClick={ this._buttonClick }>
        click me
      </button>
    );
  }
  _handleButtonClick() {
    console.log(`Button is clicked inside ${ this.state.name }`);
  }
};
```

Facebook by the way [recommend](https://facebook.github.io/react/docs/reusable-components.html#no-autobinding) the same technique while dealing with functions that need the context of the same component. The binding in the constructor may be also useful if we pass callbacks down the tree.
