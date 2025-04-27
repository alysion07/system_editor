import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import TaskManager from "./components/TaskManager";
import HomePage from "./Homepage";
import NodeEditor from "./NodeEditor";
import MinioManager from "./components/MinIOTester";

function App() {



return (
    <BrowserRouter>
        <div className="App">
            <main className="App-main">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/nodeeditor" element={<NodeEditor />} />
                    <Route path="/task" element={<TaskManager />} />
                </Routes>
            </main>
        </div>
    </BrowserRouter>
  );
}

export default App;
