// src/App.jsx
import React from 'react';
import './App.css';
import BoardEditor from './BoardEditor.jsx';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Irish AAC Board Editor</h1>
      </header>
      <BoardEditor />
    </div>
  );
}

export default App;
