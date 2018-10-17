# Composition

One of the biggest benefits of React is composability. I personally don't know a framework that offers such an easy way to create and combine components. In this section we will explore a few composition techniques which proved to work well.

Let's get a simple example. Let's say that we have an application with a header and we want to place a navigation inside. We have three React components - `App`, `Header` and `Navigation`. They have to be nested into each other so we end up with the following dependencies:

```js
<App> -> <Header> -> <Navigation>
```

The trivial approach for combining these components is to reference them in the places where we need them.

```js
// app.jsx
import Header from './Header.jsx';

export default function App() {
  return <Header />;
}

// Header.jsx
import Navigation from './Navigation.jsx';

export default function Header() {
  return <header><Navigation /></header>;
}

// Navigation.jsx
export default function Navigation() {
  return (<nav> ... </nav>);
}
```

However, by following this approach we introduced a couple of problems:

* We may consider the `App` as a place where we do our main composition. The `Header` though may have other elements like a logo, search field or a slogan. It will be nice if they are passed somehow from the `App` component so we don't create hard-coded dependencies. What if we need the same `Header` component but without the `Navigation`. We can't easily achieve that because we have the two bound tightly together.
* It's difficult to test. We may have some business logic in the `Header` and in order to test it we have to create an instance of the component. However, because it imports other components we will probably create instances of those components too and it becomes heavy to test. We may break our `Header` test by doing something wrong in the `Navigation` component which is totally misleading. *(Note: to some extent [shallow rendering](https://facebook.github.io/react/docs/test-utils.html#shallow-rendering) solves this problem by rendering only the `Header` without its nested children.)*

## Using React's children API

In React we have the handy [`children`](https://facebook.github.io/react/docs/multiple-components.html#children) prop. That's how the parent reads/accesses its children. This API will make our Header agnostic and dependency-free:

```js
export default function App() {
  return (
    <Header>
      <Navigation />
    </Header>
  );
}
export default function Header({ children }) {
  return <header>{ children }</header>;
};
```

Notice also that if we don't use `{ children }` in `Header`, the `Navigation` component will never be rendered.

It now becomes easier to test because we may render the `Header` with an empty `<div>`. This will isolate the component and will let us focus on one piece of our application.

## Passing a child as a prop

Every React component receives props. As we mentioned already there is no any strict rule about what these props are. We may even pass other components.

```js
const Title = function () {
  return <h1>Hello there!</h1>;
}
const Header = function ({ title, children }) {
  return (
    <header>
      { title }
      { children }
    </header>
  );
}
function App() {
  return (
    <Header title={ <Title /> }>
      <Navigation />
    </Header>
  );
};
```

This technique is useful when a component like `Header` needs to take decisions about its children but don't bother about what they actually are. A simple example is a visibility component that hides its children based on a specific condition.

## Higher-order component

For a long period of time higher-order components were the most popular way to enhance and compose React elements. They look really similar to the [decorator design pattern](http://robdodson.me/javascript-design-patterns-decorator/) because we have component wrapping and enhancing.

On the technical side the higher-order component is usually a function that accepts our original component and returns an enhanced/populated version of it. The most trivial example is as follows:

```js
var enhanceComponent = (Component) =>
  class Enhance extends React.Component {
    render() {
      return (
        <Component {...this.props} />
      )
    }
  };

var OriginalTitle = () => <h1>Hello world</h1>;
var EnhancedTitle = enhanceComponent(OriginalTitle);

class App extends React.Component {
  render() {
    return <EnhancedTitle />;
  }
};
```

The very first thing that the higher-order component does is to render the original component. It's a good practice to proxy pass the `props` to it. This way we will keep the input of our original component. And here comes the first big benefit of this pattern - because we control the input of the component we may send something that the component usually has no access to. Let's say that we have a configuration setting that `OriginalTitle` needs:

```js
var config = require('path/to/configuration');

var enhanceComponent = (Component) =>
  class Enhance extends React.Component {
    render() {
      return (
        <Component
          {...this.props}
          title={ config.appTitle }
        />
      )
    }
  };

var OriginalTitle  = ({ title }) => <h1>{ title }</h1>;
var EnhancedTitle = enhanceComponent(OriginalTitle);
```

The knowledge for the `appTitle` is hidden into the higher-order component. `OriginalTitle` knows only that it receives a `prop` called `title`. It has no idea that this is coming from a configuration file. That's a huge advantage because it allows us to isolate blocks. It also helps with the testing of the component because we can create mocks easily.

Another characteristic of this pattern is that we have a nice buffer for additional logic. For example, if our `OriginalTitle` needs data also from a remote server. We may query this data in the higher-order component and again send it as a prop.

<span class="new-page"></span>

```js
var enhanceComponent = (Component) =>
  class Enhance extends React.Component {
    constructor(props) {
      super(props);

      this.state = { remoteTitle: null };
    }
    componentDidMount() {
      fetchRemoteData('path/to/endpoint').then(data => {
        this.setState({ remoteTitle: data.title });
      });
    }
    render() {
      return (
        <Component
          {...this.props}
          title={ config.appTitle }
          remoteTitle={ this.state.remoteTitle }
        />
      )
    }
  };

var OriginalTitle  = ({ title, remoteTitle }) =>
  <h1>{ title }{ remoteTitle }</h1>;
var EnhancedTitle = enhanceComponent(OriginalTitle);
```

Again, the `OriginalTitle` knows that it receives two props and has to render them next to each other. Its only concern is how the data looks like not where it comes from and how.

*[Dan Abramov](https://github.com/gaearon) made a really [good point](https://github.com/krasimir/react-in-patterns/issues/12) that the actual creation of the higher-order component (i.e. calling a function like `enhanceComponent`) should happen at a component definition level. Or in other words, it's a bad practice to do it inside another React component because it may be slow and lead to performance issues.*

<br /><br />

## Function as a children, render prop

For the last couple of months, the React community started shifting in an interesting direction. So far in our examples the `children` prop was a React component. There is however a new pattern gaining popularity in which the same `children` prop is a JSX expression. Let's start by passing a simple object.

```js
function UserName({ children }) {
  return (
    <div>
      <b>{ children.lastName }</b>,
      { children.firstName }
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

This may look weird but in fact is really powerful. Like for example when we have some knowledge in the parent component and don't necessary want to send it down to children. The example below prints a list of TODOs. The `App` component has all the data and knows how to determine whether a TODO is completed or not. The `TodoList` component simply encapsulate the needed HTML markup.

<br /><br /><br /><br />

```js
function TodoList({ todos, children }) {
  return (
    <section className='main-section'>
      <ul className='todo-list'>{
        todos.map((todo, i) => (
          <li key={ i }>{ children(todo) }</li>
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
      {
        todo => isCompleted(todo) ?
          <b>{ todo.label }</b> :
          todo.label
      }
    </TodoList>
  );
}
```

Notice how the `App` component doesn't expose the structure of the data. `TodoList` has no idea that there is `label` or `status` properties.

The so called *render prop* pattern is almost the same except that we use the `render` prop and not `children` for rendering the todo.

<br /><br /><br />

```js
function TodoList({ todos, render }) {
  return (
    <section className='main-section'>
      <ul className='todo-list'>{
        todos.map((todo, i) => (
          <li key={ i }>{ render(todo) }</li>
        ))
      }</ul>
    </section>
  );
}

return (
  <TodoList
    todos={ todos }
    render={
      todo => isCompleted(todo) ?
        <b>{ todo.label }</b> : todo.label
    } />
);
```

These two patterns, *function as children* and *render prop* are probably one of my favorite ones recently. They provide flexibility and help when we want to reuse code. They are also a powerful way to abstract imperative code.

```js
class DataProvider extends React.Component {
  constructor(props) {
    super(props);

    this.state = { data: null };
    setTimeout(() => this.setState({ data: 'Hey there!' }), 5000);
  }
  render() {
    if (this.state.data === null) return null;
    return (
      <section>{ this.props.render(this.state.data) }</section>
    );
  }
}
```

`DataProvider` renders nothing when it first gets mounted. Five seconds later we update the state of the component and render a `<section>` followed by what is `render` prop returning. Imagine that this same component fetches data from a remote server and we want to display it only when it is available.

```js
<DataProvider render={ data => <p>The data is here!</p> } />
```

We do say what we want to happen but not how. That is hidden inside the `DataProvider`. These days we used this pattern at work where we had to restrict some UI to certain users having `read:products` permissions. And we used the *render prop* pattern.

```js
<Authorize
  permissionsInclude={[ 'read:products' ]}
  render={ () => <ProductsList /> } />
```

Pretty nice and self-explanatory in a declarative fashion. `Authorize` goes to our identity provider and checks what are the permissions of the current user. If he/she is allowed to read our products we render the `ProductList`.

## Final thoughts

Did you wonder why HTML is still here. It was created in the dawn of the internet and we still use it. That is because it's highly composable. React and its JSX looks like HTML on steroids and as such it comes with the same capabilities. So, make sure that you master the composition because that is one of the biggest benefits of React.
