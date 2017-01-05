## [React in patterns](../../README.md) / Children in JSX

React is highly composable. And the API that enables that is `props.children`. It gives us the power to create a placeholder that is later filled with content from the outside.

### Hiding complex formatting/styling

Let's say that we have a title that needs some special formatting. For example:

```
<h1 className='lots-of-styles-here'>
  <strong>
    <i className='something-else'>Hello world</i>
  </strong>
</h1>
```
We may create a `Title` component that hides the `h1`, `strong` and `i` tags. And all we have to pass to it is the text `Hello world`:

```
function Title(props) {
  return (
    <h1 className='lots-of-styles-here'>
      <strong>
        <i className='something-else'>
          { props.children }
        </i>
      </strong>
    </h1>
  );
}

<Title>Hello world</Title>
```

That's a nice way to encapsulate UI elements. Notice how simple is to manage the title. We don't have to deal with all those HTML tags.

### Composition

The same technique may be used for [composing components](https://github.com/krasimir/react-in-patterns/tree/master/patterns/composition). The same way as we passed `Hello world` we may pass another React component. Let's say that we have a header component but we need different content inside:

```
function Header(props) {
  return (
    <header className='app-header'>
      { props.children }
    </header>
  );
}
function Navigation() {
  return <nav>Navigation</nav>;
}
function SearchBar() {
  return <div>Search bar</div>;
}

<Header><Navigation /></Header>
or
<Header><SearchBar /></Header>
```

`Header` component doesn't know about its content. It does only one job and that's rendering a `header` tag with specific CSS class. This approach is perfect for building UIs because we divide our application into small autonomous chunks which are easy to understand and test.

### Using JSX expression

So far `props.children` was string literal and React component. It is interesting that we may pass a JSX expression too.

```
function UserName(props) {
  return (
	  <div>
      <b>{ props.children.lastName }</b>,
      { props.children.firstName }
    </div>
  );
}

function App() {
  var user = {
    firstName: 'Krasimir',
    lastName: 'Tsonev'
  };
	return (
    <UserName>{ user }</UserName>
  );
}
```

This may look weird but may be useful in some cases. Like for example when we have some knowledge in the parent component and don't necessary want to send it down the tree. The example below prints a list of TODOs. The `App` component has all the data and knows how to determine whether a TODO is completed or not. The `TodoList` component simply encapsulate the needed HTML markup.

```
function TodoList(props) {
  const renderTodo = (todo, i) => {
    return (
      <li key={ i }>
        { props.children(todo) }
      </li>
    );
  }
  return (
	  <section className='main-section'>
      <ul className='todo-list'>{ props.todos.map(renderTodo)}</ul>
    </section>
  );
}

function App() {
  const todos = [
    { label: 'Write tests', status: 'done' },
    { label: 'Sent report', status: 'progress' },
    { label: 'Answer emails', status: 'done' }
  ];
  var isCompleted = todo => todo.status === 'done';
	return (
    <TodoList todos={ todos }>
    	{ todo => isCompleted(todo) ? <b>{ todo.label }</b> : todo.label }
    </TodoList>
  );
}
```

Notice how the `App` component doesn't expose the structure of the data. `TodoList` has no idea that there is `label` or `status` properties.

When I first saw that pattern I was thinking "How's that different then passing one more prop?". For example:

```
<TodoList
  todos={ todos }
  renderTodo={
    todo => isCompleted(todo) ? <b>{ todo.label }</b> : todo.label
  } />
```

The truth is that I kind of like the other syntax. It becomes obvious that the expression is used for rendering the children of the component. From another point of view having an explicit method like `renderTodo` makes it even clearer. So, I guess it is more or less a personal feeling.
