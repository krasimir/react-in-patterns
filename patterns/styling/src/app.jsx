import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

const inlineStyles = {
  color: 'red',
  fontSize: '10px',
  marginTop: '2em',
  'border-top': 'solid 1px #000'
};

const theme = {
  fontFamily: 'Georgia',
  color: 'blue'
};
const paragraphText = {
  ...theme,
  fontSize: '20px'
};
const Link = styled.a`
  text-decoration: none;
  padding: 4px;
  border: solid 1px #999;
  color: black;
`;
const AnotherLink = styled(Link)`
  color: blue;
`;

function App() {
  return (
    <section>
      <h1 className='title'>Styling</h1>
      <h2 style={ inlineStyles }>Inline styling</h2>
      <p style={ paragraphText }>This is a paragraph here!</p>
      <Link href='http://google.com'>Google</Link>
      <AnotherLink href='http://facebook.com'>Facebook</AnotherLink>
    </section>
  );
}

ReactDOM.render(<App />, document.querySelector('#container'));
