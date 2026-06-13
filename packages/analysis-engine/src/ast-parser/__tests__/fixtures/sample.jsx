import React from 'react';

function Welcome({ name }) {
  return <h1>Hello, {name}</h1>;
}

const App = () => (
  <div>
    <Welcome name="World" />
  </div>
);

export { Welcome, App };
