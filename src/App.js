import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import TaskManager from "./components/TaskManager";
import HomePage from "./Homepage";
import NodeEditor from "./NodeEditor";
function App() {



return (
    <BrowserRouter>
        <div className="App">
            <main className="App-main">
                <Routes>
                    <Route path="/" element={<NodeEditor />} />
                    <Route path="/task" element={<TaskManager />} />
                    <Route path="/nodeeditor" element={<NodeEditor />} />
                </Routes>
            </main>
        </div>
    </BrowserRouter>
  );
}

export default App;
