import React from 'react';

var enhanceComponent = (Component) => class Enhance extends React.Component {
  render() {
    return (
      <section>
        <h1>I'm high-order component</h1>
        <Component />
      </section>
    )
  }
};
export default enhanceComponent;
