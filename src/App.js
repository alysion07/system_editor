import React from 'react';
import logo from './logo.svg';
import './App.css';
import TaskManager from "./components/TaskManager";
import MinioHealthCheck from "./components/MinIOTester";
import {MinioTextFileUploader} from "./components/MinIOTester2";

function App() {
  return (
    <div className="App">
      <main className="App-main">
          <TaskManager />
          <MinioHealthCheck/>
          <MinioTextFileUploader/>
      </main>
    </div>
  );
}

export default App;
