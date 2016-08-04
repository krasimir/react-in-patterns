## [React in patterns](../../README.md) / Higher-order components

* [Source code](https://github.com/krasimir/react-in-patterns/tree/master/patterns/higher-order-components/src)

---

### Creating a higher-order component

Higher-order components look really similar to the [decorator design pattern](http://robdodson.me/javascript-design-patterns-decorator/). It is wrapping a component and attaching some new functionalities or props to it.

Here is a function that returns a higher-order component:

```js
var enhanceComponent = (Component) =>
  class Enhance extends React.Component {
    render() {
      return (
        <Component
          {...this.state}
          {...this.props}
        />
      )
    }
  };

export default enhanceComponent;
```

Very often we expose a factory function that accepts our original component and when called returns the enhanced/wrapped version of it. For example:

```js
var OriginalComponent = () => <p>Hello world.</p>;
var EnhancedComponent = enhanceComponent(OriginalComponent);

class App extends React.Component {
  render() {
    return <EnhancedComponent />;
  }
};
```

The very first thing that the higher-order component does is to render the original component. It's a good practice to pass the `state` and `props` to it. This is helpful when we want to proxy data and use the higher-order component as it is our original component.

[Dan Abramov](https://github.com/gaearon) made a really [good point](https://github.com/krasimir/react-in-patterns/issues/12) that the actual creation of the higher-order component (i.e. calling a function like `enhanceComponent`) should happen at a component definition level. Or in other words, it's a bad practice to do it inside another React component because it's slow and we basically generate a new type every time.

### Benefits

The higher-order component gives us control on the input. The data that we want to send as props. Let's say that we have a configuration setting that `OriginalComponent` needs:

```js
var config = require('path/to/configuration');

var enhanceComponent = (Component) =>
  class Enhance extends React.Component {
    render() {
      return (
        <Component
          {...this.state}
          {...this.props}
          title={ config.appTitle }
        />
      )
    }
  };
```

The knowledge for the configuration is hidden into the higher-order component. `OriginalComponent` knows only that it receives a `prop` called `title`. Where it comes from it is not important. That's a huge advantage because it helps us testing the component in an isolation and provides nice mechanism for mocking. Here is how the `title` may be used:

```js
var OriginalComponent  = (props) => <p>{ props.title }</p>;
```

### What's next

Check out [dependency injection](https://github.com/krasimir/react-in-patterns/tree/master/patterns/dependency-injection) and [presentational and container ](https://github.com/krasimir/react-in-patterns/tree/master/patterns/presentational-and-container) sections. There are good example of higher-order components.
