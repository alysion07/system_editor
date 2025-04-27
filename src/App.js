import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import TaskManager from "./components/TaskManager";
import  MinioManager from "./components/MinIOTester";


function App() {

return (
    <div className="App">
      <main className="App-main">
          <TaskManager />
          <MinioManager/>
      </main>

    </div>
  );
}

export default App;
