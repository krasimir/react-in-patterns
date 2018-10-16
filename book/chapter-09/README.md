# Redux

[Redux](https://redux.js.org/) is a library that acts as a state container and helps managing your application data flow. It was introduced back in 2015 at ReactEurope conference ([video](https://www.youtube.com/watch?v=xsSnOQynTHs)) by [Dan Abramov](https://twitter.com/dan_abramov). It is similar to [Flux architecture](https://github.com/krasimir/react-in-patterns/blob/master/book/chapter-08/README.md#flux-architecture-and-its-main-characteristics) and has a lot in common with it. In this section we will create a small counter app using Redux alongside React.

<span class="new-page"></span>

## Redux architecture and its main characteristics

![Redux architecture](./redux-architecture.jpg)

Similarly to [Flux](https://github.com/krasimir/react-in-patterns/blob/master/book/chapter-08/README.md) architecture we have the view components (React) dispatching an action. Same action may be dispatched by another part of our system. Like a bootstrap logic for example. This action is dispatched not to a central hub but directly to the store. We are saying "store" not "stores" because there is only one in Redux. That is one of the big differences between Flux and Redux. The logic that decided how our data changes lives in pure functions called reducers. Once the store receives an action it asks the reducers about the new version of the state by sending the current state and the given action. Then in immutable fashion the reducer needs to return the new state. The store continues from there and updates its internal state. As a final step, the wired to the store React component gets re-rendered.

The concept is pretty linear and again follows the [one-direction data flow](https://github.com/krasimir/react-in-patterns/blob/master/book/chapter-07/README.md). Let's talk about all these pieces and introduce a couple of new terms that support the work of the Redux pattern.

### Actions

The typical action in Redux (same as Flux) is just an object with a `type` property. Everything else in that object is considered a context specific data and it is not related to the pattern but to your application logic. For example:

```js
const CHANGE_VISIBILITY = 'CHANGE_VISIBILITY';
const action = {
  type: CHANGE_VISIBILITY,
  visible: false
}
```

It is a good practice that we create constants like `CHANGE_VISIBILITY` for our action types. It happens that there are lots of tools/libraries that support Redux and solve different problems which do require the type of the action only. So it is just a convenient way to transfer this information.

The `visible` property is the meta data that we mentioned above. It has nothing to do with Redux. It means something in the context of the application.

Every time when we want to dispatch a method we have to use such objects. However, it becomes too noisy to write them over and over again. That is why there is the concept of *action creators*. An action creator is a function that returns an object and may or may not accept an argument which directly relates to the action properties. For example the action creator for the above action looks like this:

```js
const changeVisibility = visible => ({
  type: CHANGE_VISIBILITY,
  visible
});

changeVisibility(false);
// { type: CHANGE_VISIBILITY, visible: false }
```

Notice that we pass the value of the `visible` as an argument and we don't have to remember (or import) the exact type of the action. Using such helpers makes the code compact and easy to read.

### Store

Redux provides a helper `createStore` for creating a store. Its signature is as follows:

```js
import { createStore } from 'redux';

createStore([reducer], [initial state], [enhancer]);
```

We already mentioned that the reducer is a function that accepts the current state and action and returns the new state. More about that in a bit. The second argument is the initial state of the store. This comes as a handy instrument to initialize our application with data that we already have. This feature is the essence of processes like server-side rendering or persistent experience. The third parameter, enhancer, provides an API for extending Redux with third party middlewares and basically plug some functionally which is not baked-in. Like for example an instrument for handling async processes.

Once created the store has four methods - `getState`, `dispatch`, `subscribe` and `replaceReducer`. Probably the most important one is `dispatch`:

```js
store.dispatch(changeVisibility(false));
```

That is the place where we use our action creators. We pass the result of them or in other words action objects to this `dispatch` method. It then gets spread to the reducers in our application.

In the typical React application we usually don't use `getState` and `subscribe` directly because there is a helper (we will see it in the next sections) that wires our components with the store and effectively `subscribe`s for changes. As part of this subscription we also receive the current state so we don't have to call `getState` ourself. `replaceReducer` is kind of an advanced API and it swaps the reducer currently used by the store. I personally never used this method.

### Reducer

The reducer function is probably the most *beautiful* part of Redux. Even before that I was interested in writing pure functions with an immutability in mind but Redux forced me to do it. There are two characteristics of the reducer that are quite important and without them we basically have a broken pattern.

(1) It must be a pure function - it means that the function should return the exact same output every time when the same input is given.

(2) It should have no side effects - stuff like accessing a global variable, making an async call or waiting for a promise to resolve have no place in here.

Here is a simple counter reducer:

```js
const counterReducer = function (state, action) {
  if (action.type === ADD) {
    return { value: state.value + 1 };
  } else if (action.type === SUBTRACT) {
    return { value: state.value - 1 };
  }
  return { value: 0 };
};
```

There are no side effects and we return a brand new object every time. We accumulate the new value based on the previous state and the incoming action type. 

### Wiring to React components

If we talk about Redux in the context of React we almost always mean [react-redux](https://github.com/reactjs/react-redux) module. It provides two things that help connecting Redux to our components.

(1) `<Provider>` component - it's a component that accepts our store and makes it available for the children down the React tree via the React's context API. For example:

```js
<Provider store={ myStore }>
  <MyApp />
</Provider>
```

We usually have a single place in our app where we use it.

(2) `connect` function - it is a function that does the subscribing for updates in the store and re-renders our component. It implements a [higher-order component](https://github.com/krasimir/react-in-patterns/blob/master/book/chapter-04/README.md#higher-order-component). Here is its signature:

```
connect(
  [mapStateToProps],
  [mapDispatchToProps],
  [mergeProps],
  [options]
)
```

`mapStateToProps` parameter is a function that accepts the current state and must return a set of key-value pairs (an object) that are getting send as props to our React component. For example:

```js
const mapStateToProps = state => ({
  visible: state.visible
});
```

`mapDispatchToProps` is a similar one but instead of the `state` receives a `dispatch` function. Here is the place where we can define a prop for dispatching actions.

```js
const mapDispatchToProps = dispatch => ({
  changeVisibility: value => dispatch(changeVisibility(value))
});
```

`mergeProps` combines both `mapStateToProps` and `mapDispatchToProps` and the props send to the component and gives us the opportunity to accumulate better props. Like for example if we need to fire two actions we may combine them to a single prop and send that to React. `options` accepts couple of settings that control how the connection works.

<br />

## Simple counter app using Redux

Let's create a simple counter app that uses all the APIs above.

![Redux counter app example](./redux-counter-app.png)

The "Add" and "Subtract" buttons will simply change a value in our store. "Visible" and "Hidden" will control its visibility.

### Modeling the actions

For me, every Redux feature starts with modeling the action types and defining what state we want to keep. In our case we have three operations going on - adding, subtracting and managing visibility. So we will go with the following:

```js
const ADD = 'ADD';
const SUBTRACT = 'SUBTRACT';
const CHANGE_VISIBILITY = 'CHANGE_VISIBILITY';

const add = () => ({ type: ADD });
const subtract = () => ({ type: SUBTRACT });
const changeVisibility = visible => ({
  type: CHANGE_VISIBILITY,
  visible
});
```

### Store and its reducers

There is something that we didn't talk about while explaining the store and reducers. We usually have more then one reducer because we want to manage multiple things. The store is one though and we in theory have only one state object. What happens in most of the apps running in production is that the application state is a composition of slices. Every slice represents a part of our system. In this very small example we have counting and visibility slices. So our initial state looks like that:

```js
const initialState = {
  counter: {
    value: 0
  },
  visible: true
};
```

We must define separate reducers for both parts. This is to introduce some flexibility and to improve the readability of our code. Imagine if we have a giant app with ten or more state slices and we keep working within a single function. It will be too difficult to manage.

Redux comes with a helper that allows us to target a specific part of the state and assign a reducer to it. It is called `combineReducers`:

```js
import { createStore, combineReducers } from 'redux';

const rootReducer = combineReducers({
  counter: function A() { ... },
  visible: function B() { ... }
});
const store = createStore(rootReducer);
```

Function `A` receives only the `counter` slice as a state and needs to return only that part. Same for `B`. Accepts a boolean (the value of `visible`) and must return a boolean.

The reducer for our counter slice should take into account both actions `ADD` and `SUBTRACT` and based on them calculates the new `counter` state.

```js
const counterReducer = function (state, action) {
  if (action.type === ADD) {
    return { value: state.value + 1 };
  } else if (action.type === SUBTRACT) {
    return { value: state.value - 1 };
  }
  return state || { value: 0 };
};
```

Every reducer is fired at least once when the store is initialized. In that very first run the `state` is `undefined` and the `action` is `{ type: "@@redux/INIT"}`. In this case our reducer should return the initial value of our data - `{ value: 0 }`.

The reducer for the visibility is pretty similar except that it waits for `CHANGE_VISIBILITY` action:

```js
const visibilityReducer = function (state, action) {
  if (action.type === CHANGE_VISIBILITY) {
    return action.visible;
  }
  return true;
};
```

And at the end we have to pass both reducers to `combineReducers` so we create our `rootReducer`.

```js
const rootReducer = combineReducers({
  counter: counterReducer,
  visible: visibilityReducer
});
```

### Selectors

Before moving to the React components we have to mention the concept of a *selector*. From the previous section we know that our state is usually divided into different parts. We have dedicated reducers to update the data but when it comes to fetching it we still have a single object. Here is the place where the selectors come in handy. The selector is a function that accepts the whole state object and extracts only the information that we need. For example in our small app we need two of those:

```js
const getCounterValue = state => state.counter.value;
const getVisibility = state => state.visible;
```

A counter app is too small to see the real power of writing such helpers. However, in a big project is quite different. And it is not just about saving a few lines of code. Neither is about readability. Selectors come with these stuff but they are also contextual and may contain logic. Since they have access to the whole state they are able to answer business logic related questions. Like for example "Is the user authorize to do X while being on page Y". This may be done in a single selector.

### React components

Let's first deal with the UI that manages the visibility of the counter.

```js
function Visibility({ changeVisibility }) {
  return (
    <div>
      <button onClick={ () => changeVisibility(true) }>
        Visible
      </button>
      <button onClick={ () => changeVisibility(false) }>
        Hidden
      </button>
    </div>
  );
}

const VisibilityConnected = connect(
  null,
  dispatch => ({
    changeVisibility: value => dispatch(changeVisibility(value))
  })
)(Visibility);
```

We have two buttons `Visible` and `Hidden`. They both fire `CHANGE_VISIBILITY` action but the first one passes `true` as a value while the second one `false`. The `VisibilityConnected` component class gets created as a result of the wiring done via Redux's `connect`. Notice that we pass `null` as `mapStateToProps` because we don't need any of the data in the store. We just need to `dispatch` an action.

The second component is slightly more complicated. It is named `Counter` and renders two buttons and the counter value.

```js
function Counter({ value, add, subtract }) {
  return (
    <div>
      <p>Value: { value }</p>
      <button onClick={ add }>Add</button>
      <button onClick={ subtract }>Subtract</button>
    </div>
  );
}

const CounterConnected = connect(
  state => ({
    value: getCounterValue(state)
  }),
  dispatch => ({
    add: () => dispatch(add()),
    subtract: () => dispatch(subtract())
  })
)(Counter);
```

We now need both `mapStateToProps` and `mapDispatchToProps` because we want to read data from the store and dispatch actions. Our component receives three props - `value`, `add` and `subtract`. 

The very last bit is an `App` component where we compose the application.

```js
function App({ visible }) {
  return (
    <div>
      <VisibilityConnected />
      { visible && <CounterConnected /> }
    </div>
  );
}
const AppConnected = connect(
  state => ({
    visible: getVisibility(state)
  })
)(App);
```

We again need to `connect` our component because we want to control the visibility of the counter. The `getVisibility` selector returns a boolean that indicates whether `CounterConnected` will be rendered or not.

## Final thoughts

Redux is a wonderful pattern. Over the years the JavaScript community developed the idea and enhanced it with couple of new terms. I think a typical redux application looks more like this:

![Redux architecture](redux-reallife.jpg)

*By the way we didn't mention the side effects management. It is a whole new story with its own ideas and solutions.*

We can conclude that Redux itself is a pretty simple pattern. It teaches very useful techniques but unfortunately it is very often not enough. Sooner or later we have to introduce more concepts/patterns. Which of course is not that bad. We just have to plan for it.
