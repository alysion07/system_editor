// services/taskManagerService.js
import { TaskManagerClient } from '../../proto/task_manager_grpc_web_pb';
import { TaskArgs, TaskId, TaskLog } from '../../proto/task_manager_pb';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';

// 전역 상태 관리
const state = {
  client: null,
  pollingIntervals: new Map()
};

// 초기화 함수
export const initializeTaskManagerService = (serviceUrl = 'http://129.254.222.219:8443') => {
  state.client = new TaskManagerClient(serviceUrl);
  return state.client;
};

// 클라이언트 가져오기
const getClient = () => {
  if (!state.client) {
    initializeTaskManagerService();
  }
  return state.client;
};

// 태스크 시작
export const startTask = (args) => {
  return new Promise((resolve, reject) => {
    const client = getClient();
    const taskArgs = new TaskArgs();
    const argsList = args.split(',').map(arg => arg.trim()).filter(arg => arg);
    taskArgs.setArgsList(argsList);

    client.start_task(taskArgs, {}, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(response.getTaskId());
    });
  });
};

// 화면 로그 가져오기
export const getScreenLog = (taskId) => {
  return new Promise((resolve, reject) => {
    const client = getClient();
    const taskIdObj = new TaskId();
    taskIdObj.setTaskId(taskId);

    client.get_screen_log(taskIdObj, {}, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(response.getLogMsg());
    });
  });
};

// 플롯 로그 가져오기
export const getPlotLog = (taskId) => {
  return new Promise((resolve, reject) => {
    const client = getClient();
    const taskIdObj = new TaskId();
    taskIdObj.setTaskId(taskId);

    client.get_plot_log(taskIdObj, {}, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(response.getLogMsg());
    });
  });
};

// 로그 폴링 시작
export const startLogPolling = (taskId, options = {}) => {
  const {
    screenLogInterval = 1000,
    plotLogInterval = 1000,
    onScreenLog = () => {},
    onPlotLog = () => {},
    onError = () => {}
  } = options;

  // 화면 로그 폴링
  const screenPollingId = setInterval(async () => {
    try {
      const log = await getScreenLog(taskId);
      if (log) {
        onScreenLog(log);
      }
    } catch (err) {
      onError(err, 'screen');
    }
  }, screenLogInterval);

  // 플롯 로그 폴링
  const plotPollingId = setInterval(async () => {
    try {
      const log = await getPlotLog(taskId);
      if (log) {
        onPlotLog(log);
      }
    } catch (err) {
      onError(err, 'plot');
    }
  }, plotLogInterval);

  // 폴링 ID 저장
  state.pollingIntervals.set(`${taskId}-screen`, screenPollingId);
  state.pollingIntervals.set(`${taskId}-plot`, plotPollingId);

  return { screenPollingId, plotPollingId };
};

// 로그 폴링 중지
export const stopLogPolling = (taskId) => {
  const screenPollingId = state.pollingIntervals.get(`${taskId}-screen`);
  const plotPollingId = state.pollingIntervals.get(`${taskId}-plot`);

  if (screenPollingId) {
    clearInterval(screenPollingId);
    state.pollingIntervals.delete(`${taskId}-screen`);
  }

  if (plotPollingId) {
    clearInterval(plotPollingId);
    state.pollingIntervals.delete(`${taskId}-plot`);
  }
};

// 스트리밍 방식으로 화면 로그 받기
export const streamScreenLogs = (taskId, onData, onError) => {
  const client = getClient();
  const taskIdObj = new TaskId();
  taskIdObj.setTaskId(taskId);

  const stream = client.download_screen_log(taskIdObj);

  stream.on('data', (response) => {
    const logMsg = response.getLogMsg();
    onData(logMsg);
  });

  stream.on('error', (err) => {
    onError(err);
  });

  return stream;
};

// 모든 폴링 중지
export const stopAllPolling = () => {
  state.pollingIntervals.forEach((intervalId) => {
    clearInterval(intervalId);
  });
  state.pollingIntervals.clear();
};