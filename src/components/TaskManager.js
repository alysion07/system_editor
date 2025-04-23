import React, { useState, useEffect } from 'react';
import { TaskManagerClient } from '../../proto/task_manager_grpc_web_pb';
import { TaskArgs, TaskId, TaskLog } from '../../proto/task_manager_pb';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';

// Define your service endpoint
const SERVICE_URL = 'http://localhost:8080'; // Replace with your actual gRPC server URL
const client = new TaskManagerClient(SERVICE_URL);

const TaskManager = () => {
  const [taskId, setTaskId] = useState('');
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [args, setArgs] = useState('');
  
  // Start a new task
  const handleStartTask = () => {
    setIsLoading(true);
    setError('');
    
    const taskArgs = new TaskArgs();
    // Split the input args by comma and trim whitespace
    const argsList = args.split(',').map(arg => arg.trim()).filter(arg => arg);
    taskArgs.setArgsList(argsList);
    
    client.start_task(taskArgs, {}, (err, response) => {
      setIsLoading(false);
      
      if (err) {
        setError(`Error starting task: ${err.message}`);
        return;
      }
      
      const newTaskId = response.getTaskId();
      setTaskId(newTaskId);
      setLogs([`Task started with ID: ${newTaskId}`]);
    });
  };
  
  // Stop the current task
  const handleStopTask = () => {
    if (!taskId) return;
    
    setIsLoading(true);
    setError('');
    
    const taskIdObj = new TaskId();
    taskIdObj.setTaskId(taskId);
    
    client.stop_task(taskIdObj, {}, (err, response) => {
      setIsLoading(false);
      
      if (err) {
        setError(`Error stopping task: ${err.message}`);
        return;
      }
      
      setLogs(prev => [...prev, `Task ${taskId} stopped successfully`]);
    });
  };
  
  // Get the latest screen log
  const handleGetLog = () => {
    if (!taskId) return;
    
    setIsLoading(true);
    setError('');
    
    const taskIdObj = new TaskId();
    taskIdObj.setTaskId(taskId);
    
    client.get_screen_log(taskIdObj, {}, (err, response) => {
      setIsLoading(false);
      
      if (err) {
        setError(`Error getting log: ${err.message}`);
        return;
      }
      
      const logMsg = response.getLogMsg();
      if (logMsg) {
        setLogs(prev => [...prev, logMsg]);
      }
    });
  };
  
  // Start streaming logs when a task is active
  useEffect(() => {
    if (!taskId) return;
    
    const taskIdObj = new TaskId();
    taskIdObj.setTaskId(taskId);
    
    // Stream the screen logs
    const stream = client.download_screen_log(taskIdObj);
    
    stream.on('data', (response) => {
      const logMsg = response.getLogMsg();
      setLogs(prev => [...prev, logMsg]);
    });
    
    stream.on('error', (err) => {
      setError(`Log streaming error: ${err.message}`);
    });
    
    // Clean up the stream when component unmounts or taskId changes
    return () => {
      stream.cancel();
    };
  }, [taskId]);
  
  return (
    <div className="task-manager">
      <h2>Task Manager</h2>
      
      <div className="task-controls">
        <div className="input-group">
          <label htmlFor="args">Task Arguments (comma-separated):</label>
          <input
            id="args"
            type="text"
            value={args}
            onChange={(e) => setArgs(e.target.value)}
            placeholder="arg1, arg2, arg3"
          />
        </div>
        
        <div className="button-group">
          <button 
            onClick={handleStartTask}
            disabled={isLoading || !args.trim()}
          >
            Start Task
          </button>
          
          {taskId && (
            <button 
              onClick={handleStopTask}
              disabled={isLoading}
            >
              Stop Task
            </button>
          )}
          
          {taskId && (
            <button 
              onClick={handleGetLog}
              disabled={isLoading}
            >
              Get Latest Log
            </button>
          )}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {taskId && (
        <div className="task-info">
          <h3>Current Task ID: {taskId}</h3>
        </div>
      )}
      
      <div className="logs-container">
        <h3>Task Logs:</h3>
        {logs.length === 0 ? (
          <p>No logs available</p>
        ) : (
          <div className="logs-list">
            {logs.map((log, index) => (
              <div key={index} className="log-entry">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;
