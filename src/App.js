import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import TaskManager from "./components/TaskManager";
import HomePage from "./components/homepage/Homepage";
import NodeEditor from "./components/node-editor/NodeEditor";
import ProjectViewer from "./components/project-viewer/ProjectViewer";
import Dashboard from "./components/dashboard/Dashboard";

function App() {
return (
    <BrowserRouter>
        <div className="App">
            <main className="App-main">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/task" element={<TaskManager />} />
                    <Route path="/nodeeditor" element={<NodeEditor />} />
                    <Route path="/projectviewer" element={<ProjectViewer bucketName={'v-smr'}/>} />
                </Routes>
            </main>
        </div>
    </BrowserRouter>
  );
}

export default App;
