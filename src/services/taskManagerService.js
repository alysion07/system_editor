import { TaskManagerClient } from '../../proto/task_manager_grpc_web_pb';
import { TaskArgs, TaskId, TaskLog } from '../../proto/task_manager_pb';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';

// Define your service endpoint
const SERVICE_URL = 'http://localhost:8080'; // Replace with your actual gRPC server URL

// Create a client instance
const client = new TaskManagerClient(SERVICE_URL);

// Wrap the client methods in a more JavaScript-friendly API
export const taskManagerService = {
  /**
   * Start a new task with the provided arguments
   * @param {string[]} args - Array of task arguments
   * @returns {Promise<string>} - Task ID
   */
  startTask: (args = []) => {
    return new Promise((resolve, reject) => {
      const request = new TaskArgs();
      request.setArgsList(args);
      
      client.start_task(request, {}, (err, response) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(response.getTaskId());
      });
    });
  },
  
  /**
   * Stop a task with the provided ID
   * @param {string} taskId - ID of the task to stop
   * @returns {Promise<void>}
   */
  stopTask: (taskId) => {
    return new Promise((resolve, reject) => {
      const request = new TaskId();
      request.setTaskId(taskId);
      
      client.stop_task(request, {}, (err, response) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  },
  
  /**
   * Get EOL message
   * @returns {Promise<string>} - EOL message
   */
  getEol: () => {
    return new Promise((resolve, reject) => {
      const request = new Empty();
      
      client.get_eol(request, {}, (err, response) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(response.getLogMsg());
      });
    });
  },
  
  /**
   * Get plot log for a task
   * @param {string} taskId - ID of the task
   * @returns {Promise<string>} - Log message
   */
  getPlotLog: (taskId) => {
    return new Promise((resolve, reject) => {
      const request = new TaskId();
      request.setTaskId(taskId);
      
      client.get_plot_log(request, {}, (err, response) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(response.getLogMsg());
      });
    });
  },
  
  /**
   * Get screen log for a task
   * @param {string} taskId - ID of the task
   * @returns {Promise<string>} - Log message
   */
  getScreenLog: (taskId) => {
    return new Promise((resolve, reject) => {
      const request = new TaskId();
      request.setTaskId(taskId);
      
      client.get_screen_log(request, {}, (err, response) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(response.getLogMsg());
      });
    });
  },
  
  /**
   * Upload screen log for a task
   * @param {string} taskId - ID of the task
   * @param {string} logMsg - Log message to upload
   * @returns {Promise<void>}
   */
  uploadScreenLog: (taskId, logMsg) => {
    return new Promise((resolve, reject) => {
      const request = new TaskLog();
      request.setTaskId(taskId);
      request.setLogMsg(logMsg);
      
      client.upload_screen_log(request, {}, (err, response) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  },
  
  /**
   * Stream plot logs for a task
   * @param {string} taskId - ID of the task
   * @param {function(string)} onMessage - Callback for each received message
   * @param {function(Error)} onError - Callback for errors
   * @returns {Object} - Stream object with cancel method
   */
  streamPlotLogs: (taskId, onMessage, onError) => {
    const request = new TaskId();
    request.setTaskId(taskId);
    
    const stream = client.download_plot_log(request);
    
    stream.on('data', (response) => {
      onMessage(response.getLogMsg());
    });
    
    stream.on('error', (err) => {
      if (onError) onError(err);
    });
    
    return stream;
  },
  
  /**
   * Stream screen logs for a task
   * @param {string} taskId - ID of the task
   * @param {function(string)} onMessage - Callback for each received message
   * @param {function(Error)} onError - Callback for errors
   * @returns {Object} - Stream object with cancel method
   */
  streamScreenLogs: (taskId, onMessage, onError) => {
    const request = new TaskId();
    request.setTaskId(taskId);
    
    const stream = client.download_screen_log(request);
    
    stream.on('data', (response) => {
      onMessage(response.getLogMsg());
    });
    
    stream.on('error', (err) => {
      if (onError) onError(err);
    });
    
    return stream;
  }
};

export default taskManagerService;
