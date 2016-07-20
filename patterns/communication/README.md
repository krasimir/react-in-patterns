## [React in patterns](../../README.md) / Communication

How is the communication between components looks like? Building with React for a couple of months and you'll realize that every React component it's like a small system that operates on its own. It has its own state, input and output.

### Input

The input for a React component is its props. That's how we pass data to it:

```js
// Title.jsx
class Title extends React.Component {
  render() {
    return <h1>{ this.props.text }</h1>;
  }
};
Title.propTypes = {
  text: React.PropTypes.string
};
Title.defaultProps = {
  text: 'Hello world'
};

// App.jsx
class App extends React.Component {
  render() {
    return <Title text='Hello React' />;
  }
};
```

The `Title` component has only one input - `text`. The parent component (`App`) should provide it as an attribute while using the `<Title>` tag. There are two additional settings that we see above.

* `propTypes` - defines the type of the props. This helps React to tell us when a provided prop is not what we expect.
* `defaultProps` - defines the default values of the props. We may require from the developer to provide certain props but for the rest is good practice to set a default value.

There is also `props.children` property that gives us an access to the child components passed by the owner of the component. For example:

```js
class Title extends React.Component {
  render() {
    return <h1>{ this.props.text }{ this.props.children }</h1>;
  }
};


```
