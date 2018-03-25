## [React in patterns](../../README.md) / Dependency injection

* [Source code using React's context](https://github.com/krasimir/react-in-patterns/tree/master/patterns/dependency-injection/src)
* [Source code using module system](https://github.com/krasimir/react-in-patterns/tree/master/patterns/dependency-injection-module-system/src)

---

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

The string "React in patterns" should somehow reach the `Title` component. The direct way of doing this is to pass it from `App` to `Header` and then `Header` to pass it to `Title`. However, this may work for these three components but what happens if there are multiple properties and deeper nesting. Lots of components will have to mention properties that they are not interested in. It is clear that most React components receive their dependencies via props but the question is how these dependencies reach that point.

We already saw how the [higher-order component](https://github.com/krasimir/react-in-patterns/tree/master/patterns/higher-order-components) may be used to inject data. Let's use the same technique to inject the `title` variable:

```js
// inject.jsx
var title = 'React in patterns';
export default function inject(Component) {
  return class Injector extends React.Component {
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

React has the concept of [*context*](https://facebook.github.io/react/docs/context.html). The *context* is something that every component may have access to. It's something like an [event bus](https://github.com/krasimir/EventBus) but for data. A single *store* which we access from everywhere.

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

The `wire` function accepts a React component, then an array with all the needed dependencies (which are `register`ed already) and then a function which I like to call `mapper`. It receives what's stored in the context as a raw data and returns an object which is the actual React props for our component (`Title`). In this example we just pass what we get - a `title` string variable. However, in a real app this could be a collection of data stores, configuration or something else.

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

## Using React's context (v. 16.3 and above)

For years the context API was not really recommended by Facebook. They mention in the official docs that the API is not stable and may change. And that is exactly what happened. In the 16.3 version we got another API which is more natural and easy to work with. Let's use the same example and pass the title string following the new API.

We will start by defining a file that will contain our context creation:

```js
// context.js
import { createContext } from 'react';

const Context = createContext({});

export const Provider = Context.Provider;
export const Consumer = Context.Consumer;
```

`createContext` accepts a default value of our context and returns an object that has `.Provider` and `.Consumer` properties. Those are actually valid React classes. The provider is delivering the dependency while the consumer gets access to it. And because they usually live in different files we better create a single place for their initialization. 

Let's say that our `App` component is the root of our tree. At that place we have to pass the context.

```js
import { Provider } from './context';

class App extends React.Component {
  render() {
    return (
      <Provider value={ { title: 'React In Patterns' } }>
        <Header />
      </Provider>
    );
  }
};
```

The wrapped components and their child now share the same context. `<Header>` contains `<Title>` and in side `<Title>` we use the consumer.

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

Notice that the `Consumer` class uses the function as children (render prop) pattern to deliver the context. 

The new API feels easier to understand and eliminates the boilerplate. It is still pretty new but I think it worth trying. It opens a whole new range of possibilities.

## Using the module system

If we don't want to use the context there are a couple of other ways to achieve the injection. They are not exactly React specific but worth mentioning. One of them is using the module system.

As we know the typical module system in JavaScript has a caching mechanism. It's nicely noted in the [Node's documentation](https://nodejs.org/api/modules.html#modules_caching):

> Modules are cached after the first time they are loaded. This means (among other things) that every call to require('foo') will get exactly the same object returned, if it would resolve to the same file.

> Multiple calls to require('foo') may not cause the module code to be executed multiple times. This is an important feature. With it, "partially done" objects can be returned, thus allowing transitive dependencies to be loaded even when they would cause cycles.

How's that helping for our injection? Well, if we export an object we are actually exporting a [singleton](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#singletonpatternjavascript) and every other module that imports the file will get the same object. This allows us to `register` our dependencies and later `fetch` them in another file.

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

We'll store the dependencies in `dependencies` global variable (it's global for our module, not at an application level). We then export two functions `register` and `fetch` that write and read entries. It looks a little bit like implementing setter and getter against a simple JavaScript object. Then we have the `wire` function that accepts our React component and returns a [higher-order component](https://github.com/krasimir/react-in-patterns/tree/master/patterns/higher-order-components). In the constructor of that component we are resolving the dependencies and later while rendering the original component we pass them as props. We follow the same pattern where we describe what we need (`deps` argument) and extract the needed props with a `mapper` function.

Having the `di.jsx` helper we are again able to register our dependencies at the entry point of our application (`app.jsx`) and inject them wherever (`Title.jsx`) we need.

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

export default wire(Title, ['my-awesome-title'], title => ({ title }));
```

If we look at the `Title.jsx` file we'll see that the actual component and the wiring may live in different files. That way the component and the mapper function become easily unit testable.

## Injecting with the help of a build process

We are all processing our JavaScript before shipping it to the browser. This biggest benefit of having an intermediate process is the ability to add features which are normally not there. Like for example the support of [ES6 destructuring](http://krasimirtsonev.com/blog/article/constructive-destructuring-es6-assignment) with [Babel](http://babeljs.io/) or static type checking with [Flow](https://flowtype.org/). There are tools for dependency injection too. [InversifyJS](https://github.com/inversify/InversifyJS) is one of them and in the next section we will see how it works with React components.

### Dependency injection powered by an IoC container

Not long ago an user in Twitter asked [Michel Weststrate](https://twitter.com/mweststrate)(the author of [MobX](https://github.com/mobxjs/mobx)) the following:

> How safe is it to use mobx-react <Provider>? Or are there any other options for connecting stores to components without passing them explicitly through each component?

The [answer](https://twitter.com/mweststrate/status/750267384926208000) was the following:

> Dependency injection like InversifyJS also works nicely

[InversifyJS](https://github.com/inversify/InversifyJS) is an IoC container. We can use an IoC container to inject a value into React components without passing it explicitly through each component and without using the context.

In this demonstration we are going to use InversifyJS and [TypeScript](https://github.com/Microsoft/TypeScript). We are using InversifyJS because it works in both Node.js and web browsers. This is an important feature because some React applications use server-side rendering. We are also using TypeScript because it is the recommended by InversifyJS.

InversifyJS supports two kinds of injections:

- Constructor injection
- Property injection

In order to use "constructor injection" the IoC container needs to be able to create the instances of the classes. In React the components sometimes are just functions (not classes) and we can't delegate the creation of the instances of the components to the IoC container. This means that **constructor injection powered by IoC containers don't play nicely with React**

However, **property injection works just fine** considering the fact that we want to pass dependencies to components without passing them explicitly through each component.

Let's take a look to a basic example.

We need to start by configuring the IoC container. In InversifyJs we need to create a dictionary that maps a type identifier with a type. The dictionary entries are known as "type bindings".

In this case, we are binding the identifier `UserStore` to the class `UserStore`. This time the identifier is a Class but InversifyJS also allows us to use `Symbols` or string literals as identifiers. Symbols or string literals are required when we use interfaces.

```ts
import { Kernel, makePropertyInjectDecorator } from "inversify";
import { UserStore } from "./store/user";
import "reflect-metadata";

let kernel = new Kernel();
kernel.bind<UserStore>(UserStore).to(UserStore);

let pInject = makePropertyInjectDecorator(kernel);
export { kernel, pInject };
```

We also need to generate a decorator using the function `makePropertyInjectDecorator`.

The generated `pInject` decorator allows us to flag the properties of a class that we want to be injected:

```ts
import { pInject } from "./utils/di";
import { UserStore } from "./store/user";

class User extends React.Component<any, any> {

    @pInject(UserStore)
    private userStore: UserStore;

    public render() {
        return (
            <h1>{this.userStore.pageTitle}</h1>
        );
    }
}
```

Injected properties are *lazy evaluated*. This means that the value of the `userStore` property is only set after we try to access it for the first time.

Based on the [React docs](https://facebook.github.io/react/docs/context.html) we should try to avoid using context:

The main advantage of using an IoC container like InversifyJS is that **we are not using the context**!

InversifyJS is also great for testing because we can declare a new bindings and inject a mock or stub instead of a real value:

```ts
kernel.bind<UserStore>(UserStore).toConstantValue({ pageTitle: "Some text for testing..." });
```

Find some real use cases of InversifyJS with React [here](https://github.com/Mercateo/dwatch/blob/master/app/src/components/site/LocaleSwitcher.tsx#L12) and [here](https://github.com/Mercateo/dwatch/blob/master/app/src/components/site/Header.tsx#L14) or learn more about InversifyJS at the official repository [here](https://github.com/inversify/InversifyJS).

### Final thoughts

Dependency injection is a tough problem. Especially in JavaScript. It's not really an issue within React application but appears everywhere. At the time of this writing React offers only the `context` as an instrument for resolving dependencies. As we mentioned above this technique should be used sparingly. And of course there are some alternatives. For example using the module system or libraries like InversifyJS.
