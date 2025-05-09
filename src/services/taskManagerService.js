// services/taskManagerService.js
import { TaskManagerClient } from '../../proto/task_manager_grpc_web_pb';
import { TaskArgs, TaskId, TaskLog } from '../../proto/task_manager_pb';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';

// 전역 상태 관리
const state = {
  client: null,
  pollingIntervals: new Map(),
  eol: ''
};
const SERVICE_URL_TEST = 'http://121.148.223.175:31838';
const SERVICE_URL = 'http://129.254.222.219:8443'
// 초기화 함수
export const initializeTaskManagerService = (serviceUrl = SERVICE_URL) => {
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

// EOL 데이터 가져오기
export const getEOL = (taskId) => {
  return new Promise((resolve, reject) => {
    const client = getClient();
    const taskIdObj = new TaskId();
    taskIdObj.setTaskId(taskId);

    client.get_eol(taskIdObj, {}, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(response.getLogMsg());
    });
  });
};

// 연속 플롯 로그 수집
export const getPlotLogsUntilEOL = async (taskId, onLog, onComplete) => {
  try {
    const eol = await getEOL(taskId);
    console.log('Plot EOL:', eol);

    while (true) {
      const plotLog = await getPlotLog(taskId);
      if (plotLog === eol) {
        onComplete();
        break;
      }
      if (plotLog) {
        onLog(plotLog);
      }
      // 서버 부하 방지를 위한 짧은 대기
      await new Promise(resolve => setTimeout(resolve, 17));
    }
  } catch (err) {
    throw err;
  }
};

// 연속 화면 로그 수집
export const getScreenLogsUntilEOL = async (taskId, onLog, onComplete) => {
  try {
    const eol = await getEOL(taskId);
    console.log('Screen EOL:', eol);

    while (true) {
      const screenLog = await getScreenLog(taskId);
      if (screenLog === eol) {
        onComplete();
        break;
      }
      if (screenLog) {
        onLog(screenLog);
      }
      // 서버 부하 방지를 위한 짧은 대기
      await new Promise(resolve => setTimeout(resolve, 17));
    }
  } catch (err) {
    throw err;
  }
};




// 동시에 두 로그 수집 시작
export const startContinuousLogging = (taskId, options = {}) => {
  const {
    onScreenLog = () => {},
    onPlotLog = () => {},
    onScreenComplete = () => {},
    onPlotComplete = () => {},
    onError = () => {}
  } = options;

  const controllers = {
    screen: { abort: false },
    plot: { abort: false }
  };

  // 화면 로그 수집 시작
  const screenLogging = async () => {
    try {
      console.log('screenLogging');

      const eol = await getEOL(taskId);
      console.log('Screen EOL:', eol);

      console.log(' controllers.screen.abort',  controllers.screen.abort);
      while (!controllers.screen.abort) {
        console.log('screenLog while start');

        const screenLog = await getScreenLog(taskId);
        console.log('screenLog result', screenLog);

        if (screenLog === eol) {
          onScreenComplete();
          console.log('getScreenLog break');
          break;
        }

        if (screenLog) {
          onScreenLog(screenLog);
        }
        await new Promise(resolve => setTimeout(resolve, 17));
      }
    } catch (err) {
      if (!controllers.screen.abort) {
        onError(err, 'screen');
      }
    }
  };

  // 플롯 로그 수집 시작
  const plotLogging = async () => {
    try {
      console.log('plotLogging');

      const eol = await getEOL(taskId);
      while (!controllers.plot.abort) {
        const plotLog = await getPlotLog(taskId);
        console.log('plotLog result', plotLog);

        if (plotLog === eol) {
          onPlotComplete();
          break;
        }
        if (plotLog) {
          onPlotLog(plotLog);
        }
        await new Promise(resolve => setTimeout(resolve, 17));
      }
    } catch (err) {
      if (!controllers.plot.abort) {
        onError(err, 'plot');
      }
    }
  };

  // 비동기로 실행
  console.log('startContinuousLogging');
  screenLogging();
  plotLogging();

  // 중단 함수 반환
  return () => {
    // controllers.screen.abort = true;
    // controllers.plot.abort = true;
  };
};

// 로그 폴링 시작
export const startLogPolling = (taskId, options = {}) => {
  const {
    screenLogInterval = 2000,
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