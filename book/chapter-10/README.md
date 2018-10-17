# Dependency injection

Many of the modules/components that we write have dependencies. A proper management of these dependencies is critical for the success of the project. There is a technique (most people consider it a *pattern*) called [*dependency injection*](http://krasimirtsonev.com/blog/article/Dependency-injection-in-JavaScript) that helps solving the problem.

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

The string "React in patterns" should somehow reach the `Title` component. The direct way of doing this is to pass it from `App` to `Header` and then `Header` pass it down to `Title`. However, this may work for these three components but what happens if there are multiple properties and deeper nesting. Lots of components will act as proxy passing properties to their children.

We already saw how the [higher-order component](https://krasimir.gitbooks.io/react-in-patterns/content/chapter-04/#higher-order-component) may be used to inject data. Let's use the same technique to inject the `title` variable:

```js
// inject.jsx
const title = 'React in patterns';

export default function inject(Component) {
  return class Injector extends React.Component {
    render() {
      return (
        <Component
          {...this.props}
          title={ title }
        />
      )
    }
  };
}

// -----------------------------------
// Header.jsx
import inject from './inject.jsx';
import Title from './Title.jsx';

var EnhancedTitle = inject(Title);
export default function Header() {
  return (
    <header>
      <EnhancedTitle />
    </header>
  );
}
```

The `title` is hidden in a middle layer (higher-order component) where we pass it as a prop to the original `Title` component. That's all nice but it solves only half of the problem. Now we don't have to pass the `title` down the tree but how this data reaches the `inject.jsx` helper.

## Using React's context (prior v. 16.3)

*In v16.3 React's team introduced a new version of the context API and if you are going to use that version or above you'd probably skip this section.*

React has the concept of [*context*](https://facebook.github.io/react/docs/context.html). The *context* is something that every React component has access to. It's something like an [event bus](https://github.com/krasimir/EventBus) but for data. A single *store* which we access from everywhere.

```js
// a place where we will define the context
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

// a place where we use the context
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

Notice that we have to specify the exact signature of the context object. With `childContextTypes` and `contextTypes`. If those are not specified then the `context` object will be empty. That can be a little bit frustrating because we may have lots of stuff to put there. That is why it is a good practice that our `context` is not just a plain object but it has an interface that allows us to store and retrieve data. For example:

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
Then, if we go back to our example, the `App` component may look like that:

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

Ideally we don't want to specify the `contextTypes` every time when we need an access to the context. This detail may be wrapped again in a higher-order component. And even better, we may write an utility function that is more descriptive and helps us declare the exact wiring. I.e instead of accessing the context directly with `this.context.get('title')` we ask the higher-order component to get what we need and pass it as props to our component. For example:

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

The `wire` function accepts a React component, then an array with all the needed dependencies (which are `register`ed already) and then a function which I like to call `mapper`. It receives what is stored in the context as a raw data and returns an object which is later used as props for our component (`Title`). In this example we just pass what we get - a `title` string variable. However, in a real app this could be a collection of data stores, configuration or something else.

Here is how the `wire` function looks like:

```js
export default function wire(Component, dependencies, mapper) {
  class Inject extends React.Component {
    render() {
      var resolved = dependencies.map(
        this.context.get.bind(this.context)
      );
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

## Using React's context (v. 16.3 and above)

For years the context API was not really recommended by Facebook. They mentioned in the official docs that the API is not stable and may change. And that is exactly what happened. In the version 16.3 we got a new one which I think is more natural and easy to work with.

Let's use the same example with the string that needs to reach a `<Title>` component.

We will start by defining a file that will contain our context initialization:

```js
// context.js
import { createContext } from 'react';

const Context = createContext({});

export const Provider = Context.Provider;
export const Consumer = Context.Consumer;
```

`createContext` returns an object that has `.Provider` and `.Consumer` properties. Those are actually valid React classes. The `Provider` accepts our context in the form of a `value` prop. The consumer is used to access the context and basically read data from it. And because they usually live in different files it is a good idea to create a single place for their initialization. 

Let's say that our `App` component is the root of our tree. At that place we have to pass the context.

```js
import { Provider } from './context';

const context = { title: 'React In Patterns' };

class App extends React.Component {
  render() {
    return (
      <Provider value={ context }>
        <Header />
      </Provider>
    );
  }
};
```

The wrapped components and their children now share the same context. The `<Title>` component is the one that needs the `title` string so that is the place where we use the `<Consumer>`.

```js
import { Consumer } from './context';

function Title() {
  return (
    <Consumer>{
      ({ title }) => <h1>Title: { title }</h1>
    }</Consumer>
  );
}
```

*Notice that the `Consumer` class uses the function as children (render prop) pattern to deliver the context.*

The new API feels easier to understand and eliminates the boilerplate. It is still pretty new but looks promising. It opens a whole new range of possibilities.

## Using the module system

If we don't want to use the context there are a couple of other ways to achieve the injection. They are not exactly React specific but worth mentioning. One of them is using the module system.

As we know the typical module system in JavaScript has a caching mechanism. It's nicely noted in the [Node's documentation](https://nodejs.org/api/modules.html#modules_caching):

> Modules are cached after the first time they are loaded. This means (among other things) that every call to require('foo') will get exactly the same object returned, if it would resolve to the same file.

> Multiple calls to require('foo') may not cause the module code to be executed multiple times. This is an important feature. With it, "partially done" objects can be returned, thus allowing transitive dependencies to be loaded even when they would cause cycles.

How is that helping for our injection? Well, if we export an object we are actually exporting a [singleton](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#singletonpatternjavascript) and every other module that imports the file will get the same object. This allows us to `register` our dependencies and later `fetch` them in another file.

Let's create a new file called `di.jsx` with the following content:

```js
var dependencies = {};

export function register(key, dependency) {
  dependencies[key] = dependency;
}

export function fetch(key) {
  if (dependencies[key]) return dependencies[key];
  throw new Error(`"${ key } is not registered as dependency.`);
}

export function wire(Component, deps, mapper) {
  return class Injector extends React.Component {
    constructor(props) {
      super(props);
      this._resolvedDependencies = mapper(...deps.map(fetch));
    }
    render() {
      return (
        <Component
          {...this.state}
          {...this.props}
          {...this._resolvedDependencies}
        />
      );
    }
  };
}
```

We'll store the dependencies in `dependencies` global variable (it's global for our module, not for the whole application). We then export two functions `register` and `fetch` that write and read entries. It looks a little bit like implementing setter and getter against a simple JavaScript object. Then we have the `wire` function that accepts our React component and returns a [higher-order component](https://krasimir.gitbooks.io/react-in-patterns/content/chapter-04/#higher-order-component). In the constructor of that component we are resolving the dependencies and later while rendering the original component we pass them as props. We follow the same pattern where we describe what we need (`deps` argument) and extract the needed props with a `mapper` function.

Having the `di.jsx` helper we are again able to register our dependencies at the entry point of our application (`app.jsx`) and inject them wherever (`Title.jsx`) we need.

<span class="new-page"></span>

```js
// app.jsx
import Header from './Header.jsx';
import { register } from './di.jsx';

register('my-awesome-title', 'React in patterns');

class App extends React.Component {
  render() {
    return <Header />;
  }
};

// -----------------------------------
// Header.jsx
import Title from './Title.jsx';

export default function Header() {
  return (
    <header>
      <Title />
    </header>
  );
}

// -----------------------------------
// Title.jsx
import { wire } from './di.jsx';

var Title = function(props) {
  return <h1>{ props.title }</h1>;
};

export default wire(
  Title,
  ['my-awesome-title'],
  title => ({ title })
);
```

*If we look at the `Title.jsx` file we'll see that the actual component and the wiring may live in different files. That way the component and the mapper function become easily unit testable.*

## Final thoughts

Dependency injection is a tough problem. Especially in JavaScript. Lots of people didn't realize that but putting a proper dependency management is a key process of every development cycle. JavaScript ecosystem offers different tools and we as developers should pick the one that fits in our needs.
