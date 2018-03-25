## [React in patterns](../../README.md) / Composition

* [Source code](https://github.com/krasimir/react-in-patterns/tree/master/patterns/composition/src)

---

One of the biggest benefits of [React](http://krasimirtsonev.com/blog/article/The-bare-minimum-to-work-with-React) is composability. I personally don't know a framework that offers such an easy way to create and combine components. In this section we will explore few composition techniques which proved to work well.

Let's get a simple example. Let's say that we have an application with a header and we want to place a navigation inside. We have three React components - `App`, `Header` and `Navigation`. They have to be nested into each other so we end up with the following markup:

```js
<App>
  <Header>
    <Navigation> ... </Navigation>
  </Header>
</App>
```

The trivial approach for combining these components is to reference them in the places where we need them.

```js
// app.jsx
import Header from './Header.jsx';

export default class App extends React.Component {
  render() {
    return <Header />;
  }
}

// Header.jsx
import Navigation from './Navigation.jsx';

export default class Header extends React.Component {
  render() {
    return <header><Navigation /></header>;
  }
}

// Navigation.jsx
export default class Navigation extends React.Component {
  render() {
    return (<nav> ... </nav>);
  }
}
```

However, following this pattern we introduce several problems:

* We may consider the `App` as a place where we wire stuff, as an entry point. So, it's a good place for such composition. The `Header` though may have other elements like a logo, search field or a slogan. It will be nice if they are passed somehow from the outside so we don't create a hard-coded dependencies. What if we need the same `Header` component but without the `Navigation`. We can't easily achieve that because we have the two bound tightly together.
* It's difficult to test. We may have some business logic in the `Header` and in order to test it we have to create an instance of the component. However, because it imports other components we will probably create instances of those components too and it becomes heavy to test. We may break our `Header` test by doing something wrong in the `Navigation` component which is totally misleading. *(Note: to some extent [shallow rendering](https://facebook.github.io/react/docs/test-utils.html#shallow-rendering) solves this problem by rendering only the `Header` without its nested children.)*

### Using React's children API

In React we have the handy [`this.props.children`](https://facebook.github.io/react/docs/multiple-components.html#children). That's how the parent reads/accesses its children. This API will make our Header agnostic and dependency-free:

```js
// App.jsx
export default class App extends React.Component {
  render() {
    return (
      <Header>
        <Navigation />
      </Header>
    );
  }
}

// Header.jsx
export default class Header extends React.Component {
  render() {
    return <header>{ this.props.children }</header>;
  }
};
```

Notice also that if we don't use `this.props.children` the `Navigation` component will never be rendered.

It now becomes easier to test because we may render the `Header` with an empty `<div>`. This will isolate the component and will let us focus on only one piece of our application.

### Passing a child as a property

Every React component receive props. It's nice that these props may contain all kind of data. Even other components.

```js
// App.jsx
const Title = () => <h1>Hello there!</h1>;

class App extends React.Component {
  render() {
    return (
      <Header title={ <Title /> }>
        <Navigation />
      </Header>
    );
  }
};

// Header.jsx
export default class Header extends React.Component {
  render() {
    return (
      <header>
        { this.props.title }
        <hr />
        { this.props.children }
      </header>
    );
  }
};

```

This technique is helpful when we have a mix between components that exist inside the `Header` and components that have to be provided from the outside.

### Children as function and render prop

So far `props.children` was a React component. It is interesting that we may pass a JSX expression too.

```js
function UserName(props) {
  return (
    <div>
      <b>{ props.children.lastName }</b>,
      { props.children.firstName }
    </div>
  );
}

function App() {
  const user = {
    firstName: 'Krasimir',
    lastName: 'Tsonev'
  };
  return (
    <UserName>{ user }</UserName>
  );
}
```

This may look weird but may be useful in some cases. Like for example when we have some knowledge in the parent component and don't necessary want to send it down the tree. The example below prints a list of TODOs. The `App` component has all the data and knows how to determine whether a TODO is completed or not. The `TodoList` component simply encapsulate the needed HTML markup.

```js
function TodoList(props) {
  return (
    <section className='main-section'>
      <ul className='todo-list'>{
        props.todos.map((todo, i) => (
          <li key={ i }>{ props.children(todo) }</li>
        ))
      }</ul>
    </section>
  );
}

function App() {
  const todos = [
    { label: 'Write tests', status: 'done' },
    { label: 'Sent report', status: 'progress' },
    { label: 'Answer emails', status: 'done' }
  ];
  const isCompleted = todo => todo.status === 'done';
  return (
    <TodoList todos={ todos }>
    	{ todo => isCompleted(todo) ? <b>{ todo.label }</b> : todo.label }
    </TodoList>
  );
}
```

Notice how the `App` component doesn't expose the structure of the data. `TodoList` has no idea that there is `label` or `status` properties.

We may slightly change our `TodoList` component to demonstrate the *render prop* pattern:

```js
function TodoList(props) {
  return (
    <section className='main-section'>
      <ul className='todo-list'>{
        props.todos.map((todo, i) => (
          <li key={ i }>{ props.render(todo) }</li>
        ))
      }</ul>
    </section>
  );
}
```

Instead of using `props.children` we use `props.render`. Later in the `App` component we still pass the same function but as a prop:

```js
return (
  <TodoList
    todos={ todos }
    render={ todo => isCompleted(todo) ? <b>{ todo.label }</b> : todo.label } />
);
```

These two patterns, *children as a function* and *render prop* are probably one of my favorite ones. They provide flexibility and help when we want to reuse code. They are also a powerful way to abstract imperative code. Let's take the following example:

```js
class DataProvider extends React.Component {
  constructor(props) {
    super(props);

    this.state = { data: null };
    setTimeout(() => this.setState({ data: 'Hey there!' }), 5000);
  }
  render() {
    if (this.state.data === null) return null;
    return <section>{ this.props.render(this.state.data) }</section>;
  }
}
```

`DataProvider` renders nothing when first gets mounted. Five seconds later we update the state of the component and we render a `<section>` followed by what is `render` prop returning. Imagine that this same component fetches data from a remote server and we want to display it only when it is available.

```js
<DataProvider render={ message => <p>{ message }</p> } />
```

We do say what we want to happen but not how. That is hidden inside the `DataProvider`. Recently I used this pattern at work where we had to restrict some UI to certain users.

```js
<Authorize permissionsInclude={[ 'read:products' ]} render={ () => <ProductsList /> } />
```

Pretty nice and self-explanatory in a declarative fashion. `Authorize` goes to our identity provider and checks what are the permissions of the current user.

### Higher-order component

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

