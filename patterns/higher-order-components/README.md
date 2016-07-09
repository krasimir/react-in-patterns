## [React in patterns](../../README.md) / Higher-order components

Higher-order components look really similar to the [decorator design pattern](http://robdodson.me/javascript-design-patterns-decorator/). It's basically wrapping a component and attaching some new functionalities to it or modifying it.

Here is a simple implementation of higher-order component:

```
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

```
var OriginalComponent = () => <p>Hello world.</p>;

class App extends React.Component {
  render() {
    var EnhancedContent = enhanceComponent(OriginalComponent);

    return <EnhancedContent />;
  }
};
```

The very first thing that the higher-order component does is to render the original component. It's also a good practice to pass the `state` and `props` to it. This is helpful when we want to inject data. Putting something in the middle gives us control on the input of our components. Let's say that we want to send a configuration setting to our `OriginalComponent` above:

```
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

The knowledge for the configuration is hidden into the higher-order component and all `OriginalComponent` knows is that it receives a `prop` called `title`. Where it comes it is not important. That's a huge advantage because it helps us testing the component in isolation and provides nice mechanism for mocking. Here is how the `title` may be used:

```
var OriginalComponent  = (props) => <p>{ props.title }</p>;
```

Higher-order components are in the center of another useful pattern - [dependency injection](../dependency-injection).
