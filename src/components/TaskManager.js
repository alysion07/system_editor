// components/TaskManager.js
import React, { useState, useEffect } from 'react';
import * as taskManagerService from '../services/taskManagerService';

const TaskManager = () => {
    const [taskId, setTaskId] = useState('');
    const [screenLogs, setScreenLogs] = useState([]);
    const [plotLogs, setPlotLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [args, setArgs] = useState('');
    const [useStreaming, setUseStreaming] = useState(false);
    const [isTaskCompleted, setIsTaskCompleted] = useState(false);
    const [loggingControllers, setLoggingControllers] = useState(null);


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
    }, [loggingControllers]);

    // 태스크 시작
    const handleStartTask = async () => {
        setIsLoading(true);
        setError('');
        setIsTaskCompleted(false);

        try {
            const newTaskId = await taskManagerService.startTask(args);
            setTaskId(newTaskId);
            setScreenLogs([`Task started with ID: ${newTaskId}`]);
            setPlotLogs([]);

            // 연속 로깅 시작
            const stopLogging = taskManagerService.startContinuousLogging(newTaskId, {
                onScreenLog: (log) => {
                    setScreenLogs(prev => [...prev, log]);
                },
                onPlotLog: (log) => {
                    setPlotLogs(prev => [...prev, log]);
                },
                onScreenComplete: () => {
                    setScreenLogs(prev => [...prev, "Screen logging completed"]);
                },
                onPlotComplete: () => {
                    setPlotLogs(prev => [...prev, "Plot logging completed"]);
                    setIsTaskCompleted(true);
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

                <div className="mode-selector">
                    <label>
                        <input
                            type="checkbox"
                            checked={useStreaming}
                            onChange={(e) => setUseStreaming(e.target.checked)}
                        />
                        Use Streaming Mode
                    </label>
                </div>

                <div className="button-group">
                    <button
                        onClick={handleStartTask}
                        disabled={isLoading || !args.trim()}
                    >
                        Start Task
                    </button>


                        <>
                            <button
                                onClick={handleGetScreenLog}
                                disabled={isLoading}
                            >
                                Get Screen Log Manually
                            </button>

                            <button
                                onClick={handleGetPlotLog}
                                disabled={isLoading}
                            >
                                Get Plot Log Manually
                            </button>
                        </>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {taskId && (
                <div className="task-info">
                    <h3>Current Task ID: {taskId}</h3>
                </div>
            )}

            <div className="logs-container">
                <div className="screen-logs">
                    <h3>Screen Logs:</h3>
                    {screenLogs.length === 0 ? (
                        <p>No screen logs available</p>
                    ) : (
                        <div className="logs-list">
                            {screenLogs.map((log, index) => (
                                <div key={index} className="log-entry">
                                    {log}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="plot-logs">
                    <h3>Plot Logs:</h3>
                    {plotLogs.length === 0 ? (
                        <p>No plot logs available</p>
                    ) : (
                        <div className="logs-list">
                            {plotLogs.map((log, index) => (
                                <div key={index} className="log-entry">
                                    {log}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isTaskCompleted && (
                <div className="task-completed">
                    Task has been completed successfully!
                </div>
            )}
        </div>
    );
};

export default TaskManager;