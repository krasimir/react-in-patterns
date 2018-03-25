## [React in patterns](../../README.md) / Communication

* [Source code](https://github.com/krasimir/react-in-patterns/tree/master/patterns/communication/src)

---

If you work with React for a couple of months you'll realize that every React component is like a small system that operates on its own. It has its own state, input and output. Let's see what are those.

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
  text: PropTypes.string
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

The `Title` component has only one input - `text`. The parent component (`App`) should provide it as an attribute while using the `<Title>` tag. There are two additional settings that we see above:

* `propTypes` - defines the type of the props. This helps React telling us when a provided prop is not what we expect.
* `defaultProps` - defines the default values of the props. We may require the existence of certain props but for the rest is good practice to set a default value.

React is not defining strictly what should be passed as a prop. It may be whatever we want. It even could be another component:

```js
class SomethingElse extends React.Component {
  render() {
    return <div>The answer is { this.props.answer }</div>;
  }
}

class Answer extends React.Component {
  render() {
    return <span>42</span>;
  }
}

// later somewhere in our application
<SomethingElse answer={ <Answer /> } />
```

There is also `props.children` property that gives us an access to the child components passed by the owner of the component. For example:

```js
class Title extends React.Component {
  render() {
    return (
      <h1>
        { this.props.text }
        { this.props.children }
      </h1>
    );
  }
};

class App extends React.Component {
  render() {
    return (
      <Title text='Hello React'>
        <span>community</span>
      </Title>
    );
  }
};
```

*Notice that if we don't return `{ this.props.children }` as part of the `Title`'s render method the `<span>` tag will not be rendered.*

An indirect input to a component may be also the so called `context`. The whole React tree may have a `context` object which is accessible by every component. More about that in the [dependency injection](https://github.com/krasimir/react-in-patterns/tree/master/patterns/dependency-injection) section.

### Output

The obvious output is the rendered HTML. Visually that's what we get from a React component. Of course some of the components contain logic that probably sends out transformed data or triggers an action/event in our system. To achieve that we again use component's props:

```js
class Title extends React.Component {
  render() {
    return (
      <h1>
        <a onClick={ this.props.logoClicked }>
          <img src='path/to/logo.png' />
        </a>
      </h1>
    );
  }
};

class App extends React.Component {
  render() {
    return <Title logoClicked={ this.logoClicked } />;
  }
  logoClicked() {
    console.log('logo clicked');
  }
};
```

We pass a callback which is invoked from within the component. The `logoClicked` function above may accept data which is how we transfer information back from the child to parent component.

We should mention that there is no API that allow us accessing child's state. Or in other words we can't use `this.props.children[0].state` or something like that. The proper way of retrieving information from the children is by using props (passing callbacks). And that's a good thing. This approach forces us defining clear APIs and encourage the [one-way direction data flow](https://github.com/krasimir/react-in-patterns/tree/master/patterns/one-direction-data-flow).
