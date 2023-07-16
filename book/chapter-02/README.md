# Communication

Every React component is like a small system that operates on its own. It has its own state, input and output. In the following section, we will explore these characteristics.

![Input-Output](./communication.png)

## Input

The input of a React component is its props. That's how we pass data to it:

```js
// Title.jsx
function Title(props) {
  return <h1>{ props.text }</h1>;
}

// App.jsx
function App() {
  return <Title text='Hello React' />;
}
```

The `Title` component has only one input (prop) - `text`. The parent component (`App`) should provide it as an attribute when using the `<Title>` tag. React does not strictly define what should be passed as a prop. It can be different things, even another component.

```js
function SomethingElse({ answer }) {
  return <div>The answer is { answer }</div>;
}
function Answer() {
  return <span>42</span>;
}

// later somewhere in our application
<SomethingElse answer={ <Answer /> } />
```

There is also a `props.children` property that gives us access to the child components passed by the owner of the component. For example:

```js
function Title({ text, children }) {
  return (
    <h1>
      { text }
      { children }
    </h1>
  );
}
function App() {
  return (
    <Title text='Hello React'>
      <span>community</span>
    </Title>
  );
}
```

In this example `<span>community</span>` in `App` component is `children` in `Title` component. Notice that if we don't return `{ children }` as part of the `Title`'s body the `<span>` tag will not be rendered.

(prior to v16.3) An indirect input to a component may also be referred to as the "context." The entire React tree may have a "context" object that is accessible to every component. More information about this can be found in the [dependency injection](../chapter-10/README.md) section.

## Output

The first obvious output of a React component is the rendered HTML. Visually that is what we get. However, because the prop may be everything including a function we could also send out data or trigger a process.

In the following example we have a component that accepts the user's input and sends it out (`<NameField />`).

<span class="new-page"></span>

```js
function NameField({ valueUpdated }) {
  return (
    <input onChange={ event => valueUpdated(event.target.value) } />
  );
};
function App() {
  const [ name, setName ] = useState('');
  return (
    <div>
      <NameField valueUpdated={ name => setName(name) } />
      Name: { name }
    </div>
  );
};
```

Frequently, we need to perform initialization processes when a component is mounted. React provides the `useEffect` hook that can be utilized for this purpose. For instance, if we have an external resource that needs to be retrieved on a particular page.

```js
function App() {
  const [ data, setData ] = useState(null);

  useEffect(() => {
    (async function getData() {
      // requesting the server
      setData(result);
    })();
  }, []);

  if (this.props.results) {
    return <List results={ data } />;
  } else {
    return <LoadingScreen />
  }
}
```

Imagine that we are constructing a search-results encounter. We possess a search page where we input our requirements. After submitting, the user is directed to `/results`, where we must exhibit the search outcome. Upon arriving at the results page, we present a loading screen and initiate a request to retrieve the results in the `useEffect` hook. As soon as the data is received, we send it to a `<List>` component.

---

It is a positive aspect that we can view each React component as an independent entity with its own input, lifecycle, and output. It is our responsibility to combine and arrange these components. This is one of the benefits that React provides - it is straightforward to encapsulate and assemble them.
