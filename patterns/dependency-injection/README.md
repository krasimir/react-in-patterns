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

### Dependency injection powered by an IoC container
Not long ago an user in Twitter asked [Michel Weststrate](https://twitter.com/mweststrate)(the author of [MobX](https://github.com/mobxjs/mobx)) the following:

> How safe is it to use mobx-react <Provider>? Or are there any other options for connecting stores to components without passing them explicitly through each component?

The [answer](https://twitter.com/mweststrate/status/750267384926208000) was the following:

> Dependency injection like InversifyJS also works nicely

[InversifyJS](https://github.com/inversify/InversifyJS) is an IoC container.We can also use an IoC container. We can use an IoC container to inject a value into React components without passing it explicitly through each component. 

In this demostration we are going to use InversifyJS and [TypeScript](https://github.com/Microsoft/TypeScript). We are using InversifyJS because it works in both Node.js and web browsers. This is an important feature because some React applications use server-side rendering. We are also using TypeScript because it is the recommended by InversifyJS.

InversifyJS supports two kinds of injections:

- Constructor injection
- Property injection

In order to use "constructor injection" the IoC container needs to be able to create the instances of the classes. In React the components sometimes are just functions (not classes) and we can't delegate the creation of the instances of the components to the IoC container. This means that **constructor injection powered by IoC containers don't play nicely with React**

However, **property injection works nicely** if what we want is to pass dependencies to components without passing them explicitly through each component.

Let's take a look to a basic example.

We need to start by configuring the IoC container. In InversifyJs we need to create a dictionary that maps a type identifier with a type. The dictionary entries are known as "type bindings". 

In this case, we a binding to map the identifier `UserStore` to the class `UserStore`. This time the identifier is the Class but InversifyJS also allow you to use `Symbols` or string literals as identifiers. Symbols or string literalsare required when we use interfaces.

```ts
import { Kernel } from "inversify";
import { UserStore } from "./store/user";

let kernel = new Kernel();
kernel.bind<UserStore>(UserStore).to(UserStore);

let pInject = makePropertyInjectDecorator(kernel);
export { kernel, pInject };
```

We also need to generate a decorator using the function `makePropertyInjectDecorator`. 

The generated `pInject` decorator allow us to flag the properties of a class that we want to be injected:

```ts
import { pInject } from "./utils/di";
import { UserStore } from "./store/user";"

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

Injected properties are lazy evaluated. This means that the value of the `userStore` property is only set after we try to access it for the first time.

Based on the [React docs](https://facebook.github.io/react/docs/context.html) we should try to avoid using context:

> **Note:**
> 
> Context is an advanced and experimental feature. The API is likely to change in future releases.
Most applications will never need to use context. Especially if you are just getting started with React, you likely do not want to use context. Using context will make your code harder to understand because it makes the data flow less clear. It is similar to using global variables to pass state through your application.
> 
> **If you have to use context, use it sparingly.**
> 
> Regardless of whether you're building an application or a library, try to isolate your use of context to a small area and avoid using the context API directly when possible so that it's easier to upgrade when the API changes.

The main advantage of using an IoC container like InversifyJS is that **we are not using the context**!

You can find some real use cases of InversifyJS with React [here](https://github.com/Mercateo/dwatch/blob/master/app/src/components/site/LocaleSwitcher.tsx#L12) and [here](https://github.com/Mercateo/dwatch/blob/master/app/src/components/site/Header.tsx#L14).

You can learn more about InversifyJS [here](https://github.com/inversify/InversifyJS).

### Final thoughts

Most of the solutions for dependency injection in React components are based on context. I think that it's good to know what happens under the hood. As the time of this writing one of the most popular ways for building React apps involves [Redux](https://github.com/reactjs/react-redux). The *famous* `connect` function and the `Provider` there use the `context`.

I personally found this technique really useful. It successfully fullfills my dependencies needs and makes my components pure and highly testable.
