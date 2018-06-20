# Flux

I'm obsessed by making my code simpler. I didn't say *smaller* because having less code doesn't mean that is simple and easy to work with. I believe that big part of the problems in the software industry come from the unnecessary complexity. Complexity which is a result of our own abstractions. You know, we (the programmers) like to abstract. We like placing things in black boxes and hope that these boxes work together.

[Flux](http://facebook.github.io/flux/) is an architectural design pattern for building user interfaces. It was introduced by Facebook at their [F8](https://youtu.be/nYkdrAPrdcw?t=568) conference. Since then, lots of companies adopted the idea and it seems like a good pattern for building front-end apps. Flux is very often used with [React](http://facebook.github.io/react/). Another library released by Facebook. I myself use React+Flux/Redux in my [daily job](http://antidote.me/) and I could say that it is simple and really flexible. The pattern helps creating apps faster and at the same time keeps the code well organized.

## Flux architecture and its main characteristics

![Basic flux architecture](./fluxiny_basic_flux_architecture.jpg)

The main actor in this pattern is the *dispatcher*. It acts as a hub for all the events in the system. Its job is to receive notifications that we call *actions* and pass them to all the *stores*. The store decides if it is interested or not and reacts by changing its internal state/data. That change is triggering re-rendering of the *views* which are (in our case) React components. If we have to compare Flux to the well known MVC we may say that the store is similar to the model. It keeps the data and its mutations.

The actions are coming to the dispatcher either from the views or from other parts of the system, like services. For example a module that performs a HTTP request. When it receives the result it may fire an action saying that the request was successful.

## Implementing a Flux architecture

As every other popular concept Flux also has some [variations](https://medium.com/social-tables-tech/we-compared-13-top-flux-implementations-you-won-t-believe-who-came-out-on-top-1063db32fe73). Very often to understand something we have to implement it. In the next few sections we will create a library that provides helpers for building the Flux pattern.

### The dispatcher

In most of the cases we need a single dispatcher. Because it acts as a glue for the rest of the parts it makes sense that we have only one. The dispatcher needs to know about two things - actions and stores. The actions are simply forwarded to the stores so we don't necessary have to keep them. The stores however should be tracked inside the dispatcher so we can loop through them:

![the dispatcher](./fluxiny_the_dispatcher.jpg)

That's what I started with:

```js
var Dispatcher = function () {
  return {
    _stores: [],
    register: function (store) {  
      this._stores.push({ store: store });
    },
    dispatch: function (action) {
      if (this._stores.length > 0) {
        this._stores.forEach(function (entry) {
          entry.store.update(action);
        });
      }
    }
  }
};
```

The first thing that we notice is that we *expect* to see an `update` method in the passed stores. It will be nice to throw an error if such method is not there:

```js
register: function (store) {
  if (!store || !store.update) {
    throw new Error('You should provide a store that has an `update` method.');
  } else {
    this._stores.push({ store: store });
  }
}
```

<br />

### Bounding the views and the stores

The next logical step is to connect our views to the stores so we re-render when the state in the stores is changed.

![Bounding the views and the stores](./fluxiny_store_change_view.jpg)


#### Using a helper

Some of the flux implementations available out there provide a helper function that does the job. For example:

```js
Framework.attachToStore(view, store);
```

However, I don't quite like this approach. To make `attachToStore` works we expect to see a specific API in the view and in the store. We kind of strictly define new public methods. Or in other words we say "Your views and store should have such APIs so we are able to wire them together". If we go down this road then we will probably define our own base classes which could be extended so we don't bother the developer with Flux details. Then we say "All your classes should extend our classes". This doesn't sound good either because the developer may decide to switch to another Flux provider and has to amend everything.

<br /><br />

#### With a mixin

What if we use React's [mixins](https://reactjs.org/docs/react-without-es6.html#mixins).

```js
var View = React.createClass({
  mixins: [Framework.attachToStore(store)]
  ...
});
```

That's a "nice" way to define behavior of existing React component. So, in theory we may create a mixin that does the bounding for us. To be honest, I don't think that this is a good idea. And [it looks](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750) like it's not only me. My reason of not liking mixins is that they modify the components in a non-predictable way. I have no idea what is going on behind the scenes. So I'm crossing this option.

#### Using a context

Another technique that may answer the question is React's [context](https://facebook.github.io/react/docs/context.html). It is a way to pass props to child components without the need to specify them in every level of the tree. Facebook suggests context in the cases where we have data that has to reach deeply nested components.

> Occasionally, you want to pass data through the component tree without having to pass the props down manually at every level. React's "context" feature lets you do this.

I see similarity with the mixins here. The context is defined somewhere at the top and magically serves props for all the children below. It's not immediately clear where the data comes from.

<br /><br /><br />

#### Higher-Order components concept

Higher-Order components pattern is [introduced](https://gist.github.com/sebmarkbage/ef0bf1f338a7182b6775) by Sebastian Markb&#229;ge and it's about creating a wrapper component that returns ours. While doing it, it has the opportunity to send properties or apply additional logic. For example:

```js
function attachToStore(Component, store, consumer) {
  const Wrapper = React.createClass({
    getInitialState() {
      return consumer(this.props, store);
    },
    componentDidMount() {
      store.onChangeEvent(this._handleStoreChange);
    },
    componentWillUnmount() {
      store.offChangeEvent(this._handleStoreChange);
    },
    _handleStoreChange() {
      if (this.isMounted()) {
        this.setState(consumer(this.props, store));
      }
    },
    render() {
      return <Component {...this.props} {...this.state} />;
    }
  });
  return Wrapper;
};
```

`Component` is the view that we want attached to the `store`. The `consumer` function says what part of the store's state should be fetched and sent to the view. A simple usage of the above function could be:

```js
class MyView extends React.Component {
  ...
}

ProfilePage = connectToStores(MyView, store, (props, store) => ({
  data: store.get('key')
}));

```

That is an interesting pattern because it shifts the responsibilities. It is the view fetching data from the store and not the store pushing something to the view. This of course has it's own pros and cons. It is nice because it makes the store dummy. A store that only mutates the data and says "Hey, my state is changed". It is not responsible for sending anything to anyone. The downside of this approach is maybe the fact that we have one more component (the wrapper) involved. We also need the three things - view, store and consumer to be in one place so we can establish the connection.

#### My choice

The last option above, higher-order components, is really close to what I'm searching for. I like the fact that the view decides what it needs. That *knowledge* anyway exists in the component so it makes sense to keep it there. That's also why the functions that generate higher-order components are usually kept in the same file as the view. What if we can use similar approach but not passing the store at all. Or in other words, a function that accepts only the consumer. And that function is called every time when there is a change in the store.

So far our implementation interacts with the store only in the `register` method.

```js
register: function (store) {
  if (!store || !store.update) {
    throw new Error('You should provide a store that has an `update` method.');
  } else {
    this._stores.push({ store: store });
  }
}
```

By using `register` we keep a reference to the store inside the dispatcher. However, `register` returns nothing. And instead of nothing it may return a **subscriber** that will accept our consumer functions.

![Fluxiny - connect store and view](./fluxiny_store_view.jpg)

I decided to send the whole store to the consumer function and not the data that the store keeps. Like in the higher-order components pattern the view should say what it needs by using store's getters. This makes the store really simple and there is no trace of presentational logic.

Here is how the register method looks like after the changes:

```js
register: function (store) {
  if (!store || !store.update) {
    throw new Error(
      'You should provide a store that has an `update` method.'
    );
  } else {
    var consumers = [];
    var subscribe = function (consumer) {
      consumers.push(consumer);
    };

    this._stores.push({ store: store });
    return subscribe;
  }
  return false;
}
```

The last bit in the story is how the store says that its internal state is changed. It's nice that we collect the consumer functions but right now there is no code that executes them.

According to the basic principles of the flux architecture the stores change their state in response of actions. In the `update` method we send the `action` but we could also send a function `change`. Calling that function should trigger the consumers:

```js
register: function (store) {
  if (!store || !store.update) {
    throw new Error(
      'You should provide a store that has an `update` method.'
    );
  } else {
    var consumers = [];
    var change = function () {
      consumers.forEach(function (consumer) {
        consumer(store);
      });
    };
    var subscribe = function (consumer) {
      consumers.push(consumer);
    };

    this._stores.push({ store: store, change: change });
    return subscribe;
  }
  return false;
},
dispatch: function (action) {
  if (this._stores.length > 0) {
    this._stores.forEach(function (entry) {
      entry.store.update(action, entry.change);
    });
  }
}
```

*Notice how we push `change` together with `store` inside the `_stores` array. Later in the `dispatch` method we call `update` by passing the `action` and the `change` function.*

A common use case is to render the view with the initial state of the store. In the context of our implementation this means firing all the consumers at least once when they land in the library. This could be easily done in the `subscribe` method:

```js
var subscribe = function (consumer, noInit) {
  consumers.push(consumer);
  !noInit ? consumer(store) : null;
};
```

Of course sometimes this is not needed so we added a flag which is by default falsy. Here is the final version of our dispatcher:

<span class="new-page"></span>

```js
var Dispatcher = function () {
  return {
    _stores: [],
    register: function (store) {
      if (!store || !store.update) {
        throw new Error(
          'You should provide a store that has an `update` method'
        );
      } else {
        var consumers = [];
        var change = function () {
          consumers.forEach(function (consumer) {
            consumer(store);
          });
        };
        var subscribe = function (consumer, noInit) {
          consumers.push(consumer);
          !noInit ? consumer(store) : null;
        };

        this._stores.push({ store: store, change: change });
        return subscribe;
      }
      return false;
    },
    dispatch: function (action) {
      if (this._stores.length > 0) {
        this._stores.forEach(function (entry) {
          entry.store.update(action, entry.change);
        });
      }
    }
  }
};
```

<span class="new-page"></span>

## The actions

You probably noticed that we didn't talk about the actions. What are they? The convention is that they should be simple objects having two properties - `type` and `payload`:

```js
{
  type: 'USER_LOGIN_REQUEST',
  payload: {
    username: '...',
    password: '...'
  }
}
```

The `type` says what exactly the action is and the `payload` contains the information associated with the event. And in some cases we may leave the `payload` empty.

It's interesting that the `type` is well known in the beginning. We know what type of actions should be floating in our app, who is dispatching them and which of the stores are interested. Thus, we can apply [partial application](http://krasimirtsonev.com/blog/article/a-story-about-currying-bind) and avoid passing the action object here and there. For example:

```js
var createAction = function (type) {
  if (!type) {
    throw new Error('Please, provide action\'s type.');
  } else {
    return function (payload) {
      return dispatcher.dispatch({
        type: type,
        payload: payload
      });
    }
  }
}
```

`createAction` leads to the following benefits:

* We no more need to remember the exact type of the action. We now have a function which we call passing only the payload.
* We no more need an access to the dispatcher which is a huge benefit. Otherwise, think about how we have to pass it to every single place where we need to dispatch an action.
* In the end we don't have to deal with objects but with functions which is much nicer. The objects are *static* while the functions describe a *process*.

![Fluxiny actions creators](./fluxiny_action_creator.jpg)

This approach for creating actions is actually really popular and functions like the one above are usually called *action creators*.

## The final code

In the section above we successfully hide the dispatcher while submitting actions. We may do it again for the store's registration:

```js
var createSubscriber = function (store) {
  return dispatcher.register(store);
}
```

And instead of exporting the dispatcher we may export only these two functions `createAction` and `createSubscriber`. Here is how the final code looks like:

```js
var Dispatcher = function () {
  return {
    _stores: [],
    register: function (store) {
      if (!store || !store.update) {
        throw new Error(
          'You should provide a store that has an `update` method'
        );
      } else {
        var consumers = [];
        var change = function () {
          consumers.forEach(function (consumer) {
            consumer(store);
          });
        };
        var subscribe = function (consumer, noInit) {
          consumers.push(consumer);
          !noInit ? consumer(store) : null;
        };

        this._stores.push({ store: store, change: change });
        return subscribe;
      }
      return false;
    },
    dispatch: function (action) {
      if (this._stores.length > 0) {
        this._stores.forEach(function (entry) {
          entry.store.update(action, entry.change);
        });
      }
    }
  }
};

module.exports = {
  create: function () {
    var dispatcher = Dispatcher();

    return {
      createAction: function (type) {
        if (!type) {
          throw new Error('Please, provide action\'s type.');
        } else {
          return function (payload) {
            return dispatcher.dispatch({
              type: type,
              payload: payload
            });
          }
        }
      },
      createSubscriber: function (store) {
        return dispatcher.register(store);
      }
    }
  }
};

```

If we add the support of AMD, CommonJS and global usage we end up with 66 lines of code, 1.7KB plain or 795 bytes after minification JavaScript.

## Wrapping up

We have a module that provides two helpers for building a Flux project. Let's write a simple counter app that doesn't involve React so we see the pattern in action.

<span class="new-page"></span>

### The markup

We'll need some UI to interact with it so:

```html
<div id="counter">
  <span></span>
  <button>increase</button>
  <button>decrease</button>
</div>
```

The `span` will be used for displaying the current value of our counter. The buttons will change that value.

### The view

```js
const View = function (subscribeToStore, increase, decrease) {
  var value = null;
  var el = document.querySelector('#counter');
  var display = el.querySelector('span');
  var [ increaseBtn, decreaseBtn ] =
    Array.from(el.querySelectorAll('button'));

  var render = () => display.innerHTML = value;
  var updateState = (store) => value = store.getValue();

  subscribeToStore([updateState, render]);

  increaseBtn.addEventListener('click', increase);
  decreaseBtn.addEventListener('click', decrease);
};
```

It accepts a store subscriber function and two action function for increasing and decreasing the value. The first few lines of the view are just fetching the DOM elements.

After that we define a `render` function which puts the value inside the `span` tag. `updateState` will be called every time when the store changes. So, we pass these two functions to `subscribeToStore` because we want to get the view updated and we want to get an initial rendering. Remember how our consumers are called at least once by default.

The last bit is calling the action functions when we press the buttons.

### The store

Every action has a type. It's a good practice to create constants for these types so we don't deal with raw strings.


```js
const INCREASE = 'INCREASE';
const DECREASE = 'DECREASE';
```

Very often we have only one instance of every store. For the sake of simplicity we'll create ours as a singleton.

```js
const CounterStore = {
  _data: { value: 0 },
  getValue: function () {
    return this._data.value;
  },
  update: function (action, change) {
    if (action.type === INCREASE) {
      this._data.value += 1;
    } else if (action.type === DECREASE) {
      this._data.value -= 1;
    }
    change();
  }
};
```

`_data` is the internal state of the store. `update` is the well known method that our dispatcher calls. We process the action inside and say `change()` when we are done. `getValue` is a public method used by the view so it reaches the needed info. In our case this is just the value of the counter.

### Wiring all the pieces

So, we have the store waiting for actions from the dispatcher. We have the view defined. Let's create the store subscriber, the actions and run everything.

```js
const { createAction, createSubscriber } = Fluxiny.create();
const counterStoreSubscriber = createSubscriber(CounterStore);
const actions = {
  increase: createAction(INCREASE),
  decrease: createAction(DECREASE)
};

View(counterStoreSubscriber, actions.increase, actions.decrease);
```

And that's it. Our view is subscribed to the store and it renders by default because one of our consumers is actually the `render` method.

### A live demo

A live demo could be seen in the following JSBin [http://jsbin.com/koxidu/embed?js,output](http://jsbin.com/koxidu/embed?js,output). If that's not enough and it seems too simple for you please checkout the example in Fluxiny repository [https://github.com/krasimir/fluxiny/tree/master/example](https://github.com/krasimir/fluxiny/tree/master/example). It uses React as a view layer.

*The Flux implementation discussed in this section is available here [github.com/krasimir/fluxiny](https://github.com/krasimir/fluxiny). Feel free to use it in a browser [directly](https://github.com/krasimir/fluxiny/tree/master/lib) or as a [npm dependency](https://www.npmjs.com/package/fluxiny).*
