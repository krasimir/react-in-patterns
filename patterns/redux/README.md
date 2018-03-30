## [React in patterns](../../README.md) / Redux

[Redux](https://redux.js.org/) is a library that acts as a state container and helps managing your application data flow. It was introduced back in 2015 at ReactEurope conference ([video](https://www.youtube.com/watch?v=xsSnOQynTHs)) by [Dan Abramov](https://twitter.com/dan_abramov). It is inspired by the [Flux architecture](https://github.com/krasimir/react-in-patterns/tree/master/patterns/flux) and has a lot in common with it. In this section we will create a small counter app using Redux alongside React.

## Redux architecture and its main characteristics

![Redux architecture](./redux-architecture.jpg)

Similarly to [Flux](https://github.com/krasimir/react-in-patterns/tree/master/patterns/flux) architecture we have the view components (React) dispatching an action. Same action may be dispatched by another part of our system. Like a bootstrap logic for example. This action is dispatched not to a central hub but directly to the store. We are saying "store" not "stores" because there is only one in Redux. That is one of the big differences between Flux and Redux. The logic that decided how our data changes lives in pure functions called reducers. Once the store receives an action it asks the reducers about the new version of the state by sending the current state and the given action. Then in immutable fashion the reducer needs to return the new state. The store handles from there and updates its internal state. As a final step, the wired to store React components get re-rendered.

The concept is pretty linear and again follows the [one-direction data flow](https://github.com/krasimir/react-in-patterns/tree/master/patterns/one-direction-data-flow). Let's talk about all these pieces and introduce a couple of new terms that support the work of the Redux pattern.

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

Every time when we want to dispatch a method we have to use such objects. However, it becomes too noisy to write them over and over again. That is why there is the concept for *action creators*. An action create is a function that returns an object and may or may not accept an argument which directly related to the action properties. For example the action creator for the above action looks like this:

```js
const changeVisibility = visible => ({ type: CHANGE_VISIBILITY, visible });

changeVisibility(false); // { type: CHANGE_VISIBILITY, visible: false }
```

Notice that we pass the value of the `visible` as an argument and we don't have to remember (or import) the exact type of the action. Using such helpers makes the code compact and easy to read.

### Store

Redux provides a helper `createStore` for creating a store. Its signature is as follows:

```js
createStore(<reducer>, <initial state>, <enhancer>);
```

We already mentioned that the reducer is a function that accepts the current state and action and returns the new state. More about that in a bit. The second argument is the initial state of the store. This comes as a handy instrument to initialize our application with data that we already have. This feature is the essence of processes like server-side rendering or persistent experience. The third parameter, enhancer, provides an API for extending Redux with third party middlewares and basically plug some functionally which is not baked-in. Like for example an instrument for handling async processes.

Once created the store has four methods - `getState`, `dispatch`, `subscribe` and `replaceReducer`. Probably the most important one is `dispatch`:

```js
store.dispatch(changeVisibility(false));
```

That is the place where we use our action creators. We pass the result of them or in other words action objects to this `dispatch` method. It then gets spread to the reducers in our application.

In the typical React application we usually don't use `getState` and `subscribe` directly because there is a helper (we will see it in the next sections) that wires our components with the store and effectively `subscribe`s for changes. As part of this subscription we also receive the current state so we don't have to call `getState` ourself. `replaceReducer` is kind of an advanced API and it swaps the reducer currently used by the store. I personally never used this method.

### Reducer

