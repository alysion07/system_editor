// components/TaskManager.js
import React, { useState, useEffect,useRef, forwardRef, useImperativeHandle } from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import * as taskManagerService from '../services/taskManagerService';
import LiveFileChart from './LiveFileChart';
import {LiveLogViewer} from "./LogViewer";
import MinioManager from "./MinIOTester";
import { ProjectService } from '../services/projectService';
import ProjectViewer from "./project-viewer/ProjectViewer";

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

    const navigate = useNavigate();

    const location = useLocation();
    // TODO: use
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
                // startTask(uploadArgs)
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

    const getProjectName = (args) => {
        if (!args) return '';
        const parts = args.split(',');
        return parts[1]?.split('/')[1] || '';
    };

    return (
        <div className="min-h-screen bg-background-color text-text-color font-sans p-4 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between bg-gray-800/60 backdrop-blur-md rounded-lg p-3 border border-gray-700 shadow-lg">
                <button
                    onClick={() => navigate('/nodeeditor')}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-700 transition-colors"
                    title="Back to Editor"
                >
                    <i className="fas fa-arrow-left text-gray-300"></i>
                </button>
                <h1 className="text-xl font-bold text-primary-color">Simulation Manager</h1>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            )}

            {/* Main Content Layout */}
            <div className="flex flex-col gap-4">
                {/* 1. File Viewer */}
                {isTaskCompleted && (
                    <div className="bg-gray-800/60 backdrop-blur-md rounded-lg shadow-lg border border-gray-700 p-4 flex flex-col h-[75vh]">
                        <h2 className="text-lg font-semibold text-gray-100 mb-3">
                            '{getProjectName(uploadArgs) || "Project"}' Results
                        </h2>
                        <div className="flex-1 min-h-0">
                            <ProjectViewer bucketName={"v-smr"}/>
                        </div>
                    </div>
                )}

                {/* 2. Plot Chart */}
                <div className="bg-gray-800/60 backdrop-blur-md rounded-lg shadow-lg border border-gray-700 p-4 flex flex-col h-1/2">
                    <h4 className="text-lg font-semibold text-primary-color mb-3">Plot Chart</h4>
                    <div className="flex-1 relative min-h-0">
                        <LiveFileChart incomingLine={currentLine}/>
                    </div>
                </div>

                {/* 3. Screen Log */}
                <div className="bg-gray-800/60 backdrop-blur-md rounded-lg shadow-lg border border-gray-700 p-4 flex flex-col h-96">
                    <h4 className="text-lg font-semibold text-primary-color mb-3">Screen Log</h4>
                    <div className="flex-1 overflow-y-auto min-h-0">
                        <LiveLogViewer incomingLine={LogLine}/>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default TaskManager;
