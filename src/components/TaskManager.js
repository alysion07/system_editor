// components/TaskManager.js
import React, { useState, useEffect,useRef, forwardRef, useImperativeHandle } from 'react';
import {useLocation} from "react-router-dom";
import * as taskManagerService from '../services/taskManagerService';
import LiveFileChart from './LiveFileChart';
import {LiveLogViewer} from "./LogViewer";
import MinioManager from "./MinIOTester";
import './TaskManager.css'
import { listBuckets, listFilesInBucket, generatePresignedDownloadUrl, uploadToMinio } from '../services/minioService';

//v-smr,user1/project1,plotfl



const TaskManager = forwardRef((props, ref) => {
    const [taskId, setTaskId] = useState('');
    const [screenLogs, setScreenLogs] = useState([]);
    const [plotLogs, setPlotLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [args, setArgs] = useState('');
    const [useStreaming, setUseStreaming] = useState(false);
    const [isTaskCompleted, setIsTaskCompleted] = useState(false);
    const [loggingControllers, setLoggingControllers] = useState(null);
    const [currentLine, setCurrentLine] = useState('');
    const [LogLine, setLogLine] = useState('');

    const location = useLocation();
    const uploadArgs  = location.state || '';
    const isTaskStarted = useRef(false);
    const [files, setFiles] = useState([]);

    useEffect(() => {
        if (uploadArgs !== '' ) {
            console.log("User uploadArgs 받았습니다:", uploadArgs);
            setArgs(uploadArgs);

            if (!isTaskStarted.current) {
                isTaskStarted.current = true;
                console.log(" useEffect start",isTaskCompleted);
                startTask(uploadArgs)
            }
        }
    }, [uploadArgs]);
    // 컴포넌트 마운트 시 서비스 초기화
    useEffect(() => {
        taskManagerService.initializeTaskManagerService();

        // 컴포넌트 언마운트 시 모든 폴링 중지
        return () => {
            taskManagerService.stopAllPolling();
        };
    }, []);

    // 컴포넌트 언마운트 시 로깅 중단
    useEffect(() => {
        return () => {
            if (loggingControllers) {
                loggingControllers();
            }
        };
    }, []);


    // 태스크 시작
    const startTask = async (arg) => {
        setIsLoading(true);
        setError('');
        setIsTaskCompleted(false);

        try {
            const param = arg ? arg : args
            const newTaskId = await taskManagerService.startTask(param);
            setTaskId(newTaskId);
            setLogLine(`Task started with ID: ${newTaskId}`);
            setPlotLogs([]);

            // 연속 로깅 시작
            const stopLogging = taskManagerService.startContinuousLogging(newTaskId, {
                onScreenLog: (log) => {
                    // setScreenLogs(prev => [...prev, log]);
                    setLogLine(log);
                },
                onPlotLog: (log) => {
                    setCurrentLine(log);
                    // setPlotLogs(prev => [...prev, log]);
                },
                onScreenComplete: () => {
                    console.log("Screen logging completed");
                    isTaskStarted.current = false;
                },
                onPlotComplete: () => {
                    setPlotLogs(prev => [...prev, "Plot logging completed"]);
                    setIsTaskCompleted(true);
                    isTaskStarted.current = false;
                },
                onError: (err, type) => {
                    console.error(`Error in ${type} logging:`, err);
                    setError(`${type} logging error: ${err.message}`);
                }
            });

            setLoggingControllers(stopLogging);

        } catch (err) {
            setError(`Error starting task: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        handleStartTask: startTask  // 외부로 이 함수를 노출!
    }))

    // 수동으로 로그 가져오기
    const handleGetScreenLog = async () => {
        if (!taskId) return;

        setIsLoading(true);
        try {
            const log = await taskManagerService.getScreenLog(taskId);
            if (log) {
                setScreenLogs(prev => [...prev, log]);
            }
        } catch (err) {
            setError(`Error getting screen log: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetPlotLog = async () => {
        if (!taskId) return;

        setIsLoading(true);
        try {
            const log = await taskManagerService.getPlotLog(taskId);
            if (log) {
                setPlotLogs(prev => [...prev, log]);
            }
        } catch (err) {
            setError(`Error getting plot log: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    const HandleStartTask = async () => {
       if(args)
           startTask(args)

    }

    const fetchFiles = async (bucketName) => {
        try {
            const fileList = await listFilesInBucket('v-smr');
            setFiles(fileList);
        } catch (error) {
            console.error('파일 가져오기 실패:', error);
        }
    };
    const handleDownload = async (fileName) => {
        try {
            const url = await generatePresignedDownloadUrl('v-smr', fileName);
            window.open(url, '_blank');
        } catch (error) {
            console.error('다운로드 URL 생성 실패:', error);
        }
    };

    return (
        <div className="task-manager">
            <div className='task-manager-title'>
                <h2>Task Manager</h2>
            </div>
            {error && <div className="error-message">{error}</div>}
            {isTaskCompleted && (
                <div className="task-completed">
                    <h4>Task has been completed successfully!</h4>
                    <MinioManager isTaskComplete={useStreaming}
                                   projectFolderPath={uploadArgs}
                    />
                </div>

            )}
            <div className={`task-manager-container ${taskId}`}>
                <h4>Plot Chart</h4>
                <LiveFileChart incomingLine={currentLine}/>
            </div>
            <div className ="screen-logs">
                <h4> Screen Log</h4>
                <LiveLogViewer incomingLine={LogLine}/>
            </div>


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
                
                {/*<div className="mode-selector">*/}
                {/*    <label>*/}
                {/*        <input*/}
                {/*            type="checkbox"*/}
                {/*            checked={useStreaming}*/}
                {/*            onChange={(e) => setUseStreaming(e.target.checked)}*/}
                {/*        />*/}
                {/*        Use Streaming Mode*/}
                {/*    </label>*/}
                {/*</div>*/}

                {/*<div className="button-group">*/}
                {/*    <button*/}
                {/*        onClick={HandleStartTask}*/}
                {/*        disabled={isLoading || !args.trim()}*/}
                {/*    >*/}
                {/*        Start Simulation*/}
                {/*    </button>*/}
                {/*    <>*/}
                {/*        <button*/}
                {/*            onClick={handleGetScreenLog}*/}
                {/*            disabled={isLoading}*/}
                {/*        >*/}
                {/*            Get Screen Log Manually*/}
                {/*        </button>*/}

                {/*        <button*/}
                {/*            onClick={handleGetPlotLog}*/}
                {/*            disabled={isLoading}*/}
                {/*        >*/}
                {/*            Get Plot Log Manually*/}
                {/*        </button>*/}
                {/*    </>*/}
                {/*</div>*/}
            </div>
        </div>
    );
});

export default TaskManager;