import React from 'react';
import logo from './logo.svg';
import './App.css';
import TaskManager from "./components/TaskManager";
import TaskList from './components/TaskList';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>태스크 관리 애플리케이션</h1>
      </header>
      
      <main className="App-main">
        <TaskList />
        {/* <TaskManager /> */}
      </main>
    </div>
  );
}

export default App;
