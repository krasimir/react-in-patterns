# Event handlers

React provides a series of attributes for handling events. The solution is almost the same as the one used in the standard DOM. There are some differences like using camel case or the fact that we pass a function but overall it is pretty similar.

```js
const theLogoIsClicked = () => alert('Clicked');

<Logo onClick={ theLogoIsClicked } />
<input
  type='text'
  onChange={event => theInputIsChanged(event.target.value) } />
```

Usually we handle events in the component that contains the elements dispatching the events. Like in the example below, we have a click handler and we want to run a function or a method of the same component:

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

That's all fine because `_handleButtonClick` is a function and we indeed pass a function to the `onClick` attribute. The problem is that as it is the code doesn't keep the same context. So, if we have to use `this` inside `_handleButtonClick` to refer the current `Switcher` component we will get an error.

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

What we normally do is to use `bind`:

```js
<button onClick={ this._handleButtonClick.bind(this) }>
  click me
</button>
```

However, this means that the `bind` function is called again and again because we may render the button many times. A better approach would be to create the bindings in the constructor of the component:

<span class="new-page"></span>

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

Facebook by the way [recommends](https://reactjs.org/docs/handling-events.html) the same technique while dealing with functions that need the context of the same component.

The constructor is also a nice place for partially executing our handlers. For example, we have a form but want to handle every input in a single function.

<span class="new-page"></span>

```js
class Form extends React.Component {
  constructor(props) {
    super(props);
    this._onNameChanged = this._onFieldChange.bind(this, 'name');
    this._onPasswordChanged =
      this._onFieldChange.bind(this, 'password');
  }
  render() {
    return (
      <form>
        <input onChange={ this._onNameChanged } />
        <input onChange={ this._onPasswordChanged } />
      </form>
    );
  }
  _onFieldChange(field, event) {
    console.log(`${ field } changed to ${ event.target.value }`);
  }
};
```

## Final thoughts

There is not much to learn about event handling in React. The authors of the library did a good job in keeping what's already there. Since we are using HTML-like syntax it makes total sense that we also have a DOM-like event handling.
