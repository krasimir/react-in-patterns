## [React in patterns](../../README.md) / Dependency injection

> [Source code](https://github.com/krasimir/react-in-patterns/tree/master/patterns/dependency-injection/src)

Big part of the modules/components that we write have dependencies. A proper management of these dependencies is critical for the success of the project. There is a technique (some people consider it as a *pattern*) called [*dependency injection*](http://krasimirtsonev.com/blog/article/Dependency-injection-in-JavaScript) that helps solving the problem.

In React the need of dependency injector is easily visible. Let's consider the following application tree:

```js
// Title.jsx
export default function Title(props) {
  return <h1>{ props.title }</h1>;
}

// Header.jsx
import Title from './Title.jsx';
export default function Header() {
  return (
    <header>
      <Title />
    </header>
  );
}

// App.jsx
import Header from './Header.jsx';
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { title: 'React in patterns' };
  }
  render() {
    return <Header />;
  }
};
```

The string "React in patterns" should somehow reach the `Title` component. The direct way of doing this is to pass it from `App` to `Header` and then `Header` to pass it to `Title`. However, this may work for these three components but what happens if there are multiple properties and deeper nesting. Lots of components will have to mention properties that they are not interested in.

We already saw how the [higher-order component](https://github.com/krasimir/react-in-patterns/tree/master/patterns/higher-order-components) may be used to inject data. Let's use the same technique to inject the `title` variable:

```js
// enhance.jsx
var title = 'React in patterns';
var enhanceComponent = (Component) =>
  class Enhance extends React.Component {
    render() {
      return (
        <Component
          {...this.state}
          {...this.props}
          title={ title }
        />
      )
    }
  };
export default enhanceComponent;

// Header.jsx
import enhance from './enhance.jsx';
import Title from './Title.jsx';

var EnhancedTitle = enhance(Title);
export default function Header() {
  return (
    <header>
      <EnhancedTitle />
    </header>
  );
}
```

The `title` is hidden in a middle layer (higher-order component) where we pass it as a prop to the original `Title` component. That's all nice but it solves only half of the problem. Now we don't have to pass the `title` down the tree but how this data will reach the `enhance.jsx` helper.

React has the concept of [*context*](https://facebook.github.io/react/docs/context.html). The *context* is something that every component may have access to. It's something like an [event bus](https://github.com/krasimir/EventBus) but for data. A single model which we can access from everywhere.

```js
// a place where we'll define the context
var context = { title: 'React in patterns' };
class App extends React.Component {
  getChildContext() {
    return context;
  }
  ...
};
App.childContextTypes = {
  title: React.PropTypes.string
};

// a place where we need data
class Inject extends React.Component {
  render() {
    var title = this.context.title;
    ...
  }
}
Inject.contextTypes = {
  title: React.PropTypes.string
};
```

Notice that we have to specify the exact signature of the context object. With `childContextTypes` and `contextTypes`. If those are not specified then the `context` object will be empty. That may be a little bit frustrating because we may have lots of stuff to put there. That's why it is a good practice that our `context` is not just a plain object but it has an interface that allows us to store and retrieve data. For example:

```js
// dependencies.js
export default {
  data: {},
  get(key) {
    return this.data[key];
  },
  register(key, value) {
    this.data[key] = value;
  }
}
```
Then, if we go back to our example, the very top `App` component may look like that:

```js
import dependencies from './dependencies';

dependencies.register('title', 'React in patterns');

class App extends React.Component {
  getChildContext() {
    return dependencies;
  }
  render() {
    return <Header />;
  }
};
App.childContextTypes = {
  data: React.PropTypes.object,
  get: React.PropTypes.func,
  register: React.PropTypes.func
};
```

And our `Title` component gets it's data through the context:

```js
// Title.jsx
export default class Title extends React.Component {
  render() {
    return <h1>{ this.context.get('title') }</h1>
  }
}
Title.contextTypes = {
  data: React.PropTypes.object,
  get: React.PropTypes.func,
  register: React.PropTypes.func
};
```

Ideally we don't want to specify the `contextTypes` every time when we need an access to the context. This detail may be wrapped in a higher-order component. And even more, we may write an utility function that is more descriptive and helps us declare the exact wiring. I.e instead of accessing the context directly with `this.context.get('title')` we ask the higher-order component to get what we need and to pass it as a prop to our component. For example:

```js
// Title.jsx
import wire from './wire';

function Title(props) {
  return <h1>{ props.title }</h1>;
}

export default wire(Title, ['title'], function resolve(title) {
  return { title };
});
```

The `wire` function accepts first a React component, then an array with all the needed dependencies (which are `register`ed already) and then a function which I like to call `mapper`. It receives what's stored in the context as a raw data and returns an object which is the actual React props for our component (`Title`). In this example we just pass what we get - a `title` string variable. However, in a real app this could be a collection of data stores, configuration or something else. So, it's nice that we pass exactly what we need and don't pollute the components with data that they don't need.

Here is how the `wire` function looks like:

```js
export default function wire(Component, dependencies, mapper) {
  class Inject extends React.Component {
    render() {
      var resolved = dependencies.map(this.context.get.bind(this.context));
      var props = mapper(...resolved);

      return React.createElement(Component, props);
    }
  }
  Inject.contextTypes = {
    data: React.PropTypes.object,
    get: React.PropTypes.func,
    register: React.PropTypes.func
  };
  return Inject;
};
```

`Inject` is a higher-order component that gets access to the context and retrieves all the items listed under `dependencies` array. The `mapper` is a function receiving the `context` data and transforms it to props for our component.

### Final thoughts

Most of the solutions for dependency injection in React components are based on context. I think that it's good to know what happens under the hood. As the time of this writing one of the most popular ways for building React apps involves [Redux](https://github.com/reactjs/react-redux). The *famous* `connect` function and the `Provider` there use the `context`.

I personally found this technique really useful. It successfully fullfills my dependencies needs and makes my components pure and highly testable.
