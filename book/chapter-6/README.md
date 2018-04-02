## [React in patterns](../../README.md) / Presentational and container components

* [Source code](https://github.com/krasimir/react-in-patterns/tree/master/patterns/presentational-and-container/src)

---

Every beginning is difficult. React is no exception and as beginners we also have lots of questions. Where I'm supposed to put my data, how to communicate changes or how to manage state? The answers of these questions are very often a matter of context and sometimes just practice and experience with the library. However, there is a pattern which is used widely and helps organizing React based applications - splitting the component into presentation and container.

Let's start with a simple example that illustrates the problem and then split the component into container and presentation. We will use a `Clock` component. It accepts a [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) object as a prop and displays the time in real time.

```js
class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = { time: this.props.time };
    this._update = this._updateTime.bind(this);
  }
  render() {
    const time = this._formatTime(this.state.time);
    return (
      <h1>{ time.hours } : { time.minutes } : { time.seconds }</h1>
    );
  }
  componentDidMount() {
    this._interval = setInterval(this._update, 1000);
  }
  componentWillUnmount() {
    clearInterval(this._interval);
  }
  _formatTime(time) {
    var [ hours, minutes, seconds ] = [
      time.getHours(),
      time.getMinutes(),
      time.getSeconds()
    ].map(num => num < 10 ? '0' + num : num);

    return { hours, minutes, seconds };
  }
  _updateTime() {
    this.setState({ time: new Date(this.state.time.getTime() + 1000) });
  }
};

ReactDOM.render(<Clock time={ new Date() }/>, ...);
```

In the constructor of the component we initialize the component's state which in our case is just the current `time` value. By using `setInterval` we update the state every second and the component is re-rendered. To make it looks like a real clock we use two helper methods - `_formatTime` and `_updateTime`. The first one is about extracting hours, minutes and seconds and making sure that they are following the two-digits format. `_updateTime` is mutating the current `time` object by one second.

## The problems

There are couple of things happening in our component. It looks like it has too many responsibilities.

* It mutates the state by itself. Changing the time inside the component may not be a good idea because then only `Clock` knows the current value. If there is another part of the system that depends on this data it will be difficult to share it.
* `_formatTime` is actually doing two things - it extracts the needed information from the date object and makes sure that the values are always presented by two digits. That's fine but it will be nice if the extracting is not part of the function because then it is bound to the type of the `time` object (coming as a prop). I.e. knows specifics about the shape of the data and at the same time deals with the visualization of it.

## Extracting the container

Containers know about data, its shape and where it comes from. They know details about how the things work or the so called *business logic*. They receive information and format it so it is easy to use by the presentational component. Very often we use [higher-order components](https://github.com/krasimir/react-in-patterns/tree/master/patterns/higher-order-components) to create containers.

Here's how our `ClockContainer` looks like:

```js
// Clock/index.js
import Clock from './Clock.jsx'; // <-- that's the presentational component

export default class ClockContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { time: props.time };
    this._update = this._updateTime.bind(this);
  }
  render() {
    return <Clock { ...this._extract(this.state.time) }/>;
  }
  componentDidMount() {
    this._interval = setInterval(this._update, 1000);
  }
  componentWillUnmount() {
    clearInterval(this._interval);
  }
  _extract(time) {
    return {
      hours: time.getHours(),
      minutes: time.getMinutes(),
      seconds: time.getSeconds()
    };
  }
  _updateTime() {
    this.setState({ time: new Date(this.state.time.getTime() + 1000) });
  }
};
```

It still accepts `time` (a date object), does the `setInterval` loop and knows details about the data (`getHours`, `getMinutes` and `getSeconds`). In the end renders the presentational component and passes three numbers for hours, minutes and seconds. There is nothing about how the things look like. Only business logic.

## Presentational component

Presentational components are concerned with how the things look. They have the additional markup needed for making the page pretty. Such components are not bound to anything and have no dependencies. Very often implemented as a [stateless functional components](https://facebook.github.io/react/blog/2015/10/07/react-v0.14.html#stateless-functional-components) they don't have internal state.

In our case the presentational component contains only the two-digits check and returns the `<h1>` tag:

```js
// Clock/Clock.jsx
export default function Clock(props) {
  var [ hours, minutes, seconds ] = [
    props.hours,
    props.minutes,
    props.seconds
  ].map(num => num < 10 ? '0' + num : num);

  return <h1>{ hours } : { minutes } : { seconds }</h1>;
};
```

## Benefits

Splitting the components in containers and presentation increases the reusability of the components. Our `Clock` function/component may exist in application that doesn't change the time or it's not working with JavaScript's [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)  objects. That's because it's pretty *dummy*. No details about the data.

The nice thing about containers is that they encapsulate logic and may inject data into different renderers. Very often a file that exports a container is not exposing a class directly but a function. For example, instead of using

```js
import Clock from './Clock.jsx';

export default class ClockContainer extends React.Component {
  render() {
    return <Clock />;
  }
}
```

we may export a function that accepts the presentational component or in other words higher-order component.

```js
export default function(ClockComponent) {
  return class Container extends React.Component {
    render() {
      return <ClockComponent />;
    }
  }
}
```

Using this technique our container is really flexible in rendering its result. It will be really helpful if we want to switch from digital to analog clock representation for example.

Even the testing becomes easier because we have to think less for our components. Containers are not concern with UI and very often the actions that trigger logic are controlled with callbacks. Presentational components are just about rendering the incoming props and their unit tests are more or less checking if the right callback is called if something is clicked/filled in.

## Final thoughts

React is unique in that sense that it is considered a view layer but at the same time it is a lot about UI logic too. The concept of container and presentation is not new at all but it fits really nicely with React. It makes our applications better structured and easy to manage.
