import React, {useState, useRef, useCallback, useMemo, useEffect} from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    Controls,
    Background,
} from 'reactflow';
import {useLocation} from "react-router-dom";

import 'reactflow/dist/style.css';
import './styles/NodeEditor.css';

import useFlowStore from '../store/useFlowStore.jsx';
import { componentTypes } from './ComponentsType.jsx';
import NodeItem from './NodeItem.jsx';

import NodePalette from './NodePalette.jsx';
import NodeInspector from "./NodeInspector.jsx";

import Toolbar from "./Toolbar.jsx";
import {SimplifiedNode} from "./simpleNode.jsx";
import HeatStructure from "./controls/HeatStructure.jsx";
import GeneralSettingPane from "./GeneralSettingPane.jsx";

import useProjectStore from '../store/projectStore';
import { ProjectService } from '../../services/projectService';
import { FileLoader } from '../../services/fileLoader';

const proOptions = { hideAttribution: true };

const NodeEditor = () => {

    // 커스텀 노드 타입 등록
    const nodeTypes = useMemo(() => ({
        node: NodeItem,
        simple: SimplifiedNode,

    }), []);

    const location = useLocation();
    const { userId: incomingUserId, projectName: incomingProjectName } = location.state || {};
    const { userId, projectName, setUserId, setProjectName, setLoading } = useProjectStore();

    const flowStore = useFlowStore();

    const [nodes, setNodes] = useState(flowStore.present.nodes);
    const [edges, setEdges] = useState(flowStore.present.edges);
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isSimplified, setIsSimplified] = useState(true);

    useEffect(() => {
        if (incomingUserId) setUserId(incomingUserId);
        if (incomingProjectName) setProjectName(incomingProjectName);
    }, [incomingUserId, incomingProjectName, setUserId, setProjectName]);

    useEffect(() => {
        if (!userId || !projectName) return;

        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                const existing = await ProjectService.listProjects(userId);

                // ✅ 실제로 존재하는 경우만 로딩
                if (!existing.includes(projectName)) return;

                const json = await ProjectService.loadProjectJson(userId, projectName);
                FileLoader.validateFlowData(json);
                if (!cancelled) {
                    flowStore.importFlow(json);
                    setTimeout(() => {
                        reactFlowInstance?.fitView({ padding: 0.1 });
                    }, 50);
                }
            } catch (err) {
                if (!cancelled) {
                    alert('불러오기 실패: ' + err.message);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [userId, projectName, setLoading, flowStore, reactFlowInstance]);


    useEffect(() => {
        if (isSimplified) {
            setNodes(flowStore.present.nodes.map(node => ({
                ...node,
                type: 'simple',
                data: {...node.data, icon: node.data.icon}
            })));
            setEdges(flowStore.present.edges);
        } else {
            setNodes(Array.isArray(flowStore.present.nodes) ? flowStore.present.nodes.map(node => ({
                ...node,
                type: 'node'
            })) : []);
            setEdges(flowStore.present.edges);
        }
    }, [flowStore.present.nodes, flowStore.present.edges, isSimplified]);

    const handleSave = useCallback(async () => {
        if (!userId || !projectName || !reactFlowInstance) {
            alert("프로젝트 이름 또는 사용자 정보가 없습니다.");
            return;
        }

        const flowData = reactFlowInstance.toObject();
        const jsonBlob = new Blob([JSON.stringify(flowData)], { type: 'application/json' });

        try {
            // 중복 검사: 같은 이름의 프로젝트가 있는지 확인
            const existingProjects = await ProjectService.listProjects(userId);
            if (existingProjects.includes(projectName)) {
                const confirmOverwrite = window.confirm(
                    `"${projectName}" 프로젝트가 이미 존재합니다. 덮어쓰시겠습니까?`
                );
                if (!confirmOverwrite) return;
            }

            // 업로드 (MinIO가 자동으로 폴더 생성)
            await ProjectService.uploadProjectJson(userId, projectName, jsonBlob);

            alert(`"${projectName}" 저장 완료`);
        } catch (err) {
            console.error("저장 실패:", err);
            alert("저장 중 오류 발생: " + err.message);
        }
    }, [userId, projectName, reactFlowInstance]);

    const handleNodesChange = useCallback((changes) => {
        const updatedNodes = applyNodeChanges(changes, nodes);
        setNodes(updatedNodes); // 👉 로컬 상태만 갱신
    }, [nodes]);

    const handleEdgesChange = useCallback((changes) => {
        const updatedEdges = applyEdgeChanges(changes, edges);
        setEdges(updatedEdges);
    }, [nodes, edges, flowStore]);

    const handleNodeDragStart = useCallback((event, node, nodes) => {
        flowStore.setNodeDragStart(event, node, nodes)
    }, [[nodes, nodes, edges]])

// 컴포넌트에서 사용
    const handleNodeDragStop = useCallback((_, draggedNode) => {
        flowStore.handleNodeDragStop(draggedNode);
    }, [flowStore]);

    const handleConnect = useCallback((connection) => {
        const updatedEdges = addEdge(connection, edges);
        setEdges(updatedEdges);
        flowStore.set(nodes, updatedEdges);
    }, [nodes, edges, flowStore]);

    const onNodeClick = useCallback((event, node) => {
        flowStore.setSelectedNodeId(node.id);
        setSelectedNode(node);
    }, []);

    const onGenSettings = useCallback(() => {
        setSelectedNode({id: 'genset', type: 'GENSET', data: {label: 'Genset', componentType: 'GENSET'}});
    }, []);

    const handleDeleteNode = useCallback((nodeId) => {
        flowStore.deleteNode(nodeId);
    }, [flowStore]);

    const handleDrop = useCallback((event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        if (!type) return;

        const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        flowStore.dropNode(type, position, handleDeleteNode);
    }, [reactFlowInstance, flowStore, handleDeleteNode]);


    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, [setSelectedNode]);

    const renderInspector = useCallback(() => {
        if (!selectedNode || !selectedNode.data) return null;

        // 선택한 노드의 componentType 가져오기
        const componentType = selectedNode.data.componentType;

        // componentType에 따라 다른 컴포넌트 렌더링
        switch (componentType) {
            case "HTSTR":
                return (
                    <HeatStructure
                        selectedNode={selectedNode}
                        onPropertyChange={handlePropChange}
                    />
                );
            case "SNGLVOL":
            case "TMDPVOL":
            case "SNGLJUN":
            case "TMDPJUN":
            case "PIPE":
            case "PUMP":
                return (
                    <NodeInspector
                        selectedNode={selectedNode}
                        componentTypes={componentTypes}
                        onPropertyChange={handlePropChange}

                    />
                );
            case "GENSET":
                return (<GeneralSettingPane/>);
            default:
                console.log("Unknown component type:", componentType);
                return (
                    <div className="inspector-placeholder">
                        <h3>선택한 노드: {selectedNode.data.label}</h3>
                        <p>컴포넌트 타입: {componentType || "없음"}</p>
                    </div>
                );
        }
    }, [selectedNode]);

    const handleExport = useCallback(() => {
        if (reactFlowInstance) {
            const flowData = reactFlowInstance.toObject();
            const jsonString = JSON.stringify(flowData, null, 2);

            const blob = new Blob([jsonString], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'flow-diagram.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }, [reactFlowInstance]);

    // 파일 변경 이벤트 처리
    // const handleFileChange = useCallback((event) => {
    //     const fileReader = new FileReader();
    //     const file = event.target.files[0];
    //
    //     if (!file) return;
    //
    //     // 파일명에서 확장자 제거 후 프로젝트명으로 설정
    //     const fileName = file.name.replace(/\.[^/.]+$/, "");
    //     setProjectName(fileName);
    //
    //     fileReader.onload = (e) => {
    //         try {
    //             const flowData = JSON.parse(e.target.result);
    //
    //             // 유효성 검사
    //             if (flowData && flowData.nodes && flowData.edges) {
    //                 // 스토어의 importFlow 함수 호출
    //                 store.importFlow(flowData);
    //
    //                 // ReactFlow 화면 중앙 맞추기
    //                 setTimeout(() => {
    //                     reactFlowInstance?.fitView({padding: 0.1});
    //                 }, 50);
    //             } else {
    //                 alert('유효하지 않은 다이어그램 파일입니다.');
    //             }
    //         } catch (error) {
    //             console.error('파일 파싱 중 오류 발생:', error);
    //             alert('파일을 불러오는 중 오류가 발생했습니다.');
    //         }
    //     };
    //
    //     fileReader.readAsText(file);
    //     event.target.value = null;
    // }, [store, reactFlowInstance, setProjectName]);

    const handleSimplify = useCallback(() => {
        setIsSimplified(prev => !prev);
    }, []);

    const handlePropChange = (nodeId, key, value) => {
        flowStore.updateNodeProp(nodeId, key, value);
    };

    return (
        <div className="node-editor">

            <NodePalette componentsType={componentTypes}/>
            <ReactFlowProvider>

                <div className="reactflow-wrapper" ref={reactFlowWrapper}
                     onDrop={handleDrop}
                >
                    <ReactFlow
                        onDragOver={handleDragOver}
                        onInit={setReactFlowInstance}
                        proOptions={proOptions}
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={handleNodesChange}
                        onNodeClick={onNodeClick}
                        onNodeDragStart={handleNodeDragStart}
                        onNodeDragStop={handleNodeDragStop}
                        onEdgesChange={handleEdgesChange}
                        defaultEdgeOptions={{type: 'smoothstep'}}
                        connectionLineType='smoothstep'
                        onConnect={handleConnect}
                        onPaneClick={onPaneClick}
                    >
                        <Toolbar
                            onUndo={flowStore.undo}
                            onRedo={flowStore.redo}
                            canUndo={flowStore.canUndo}
                            canRedo={flowStore.canRedo}
                            onExport={handleExport}
                            onGeneralSetting={onGenSettings}
                            projectName={projectName}
                            onProjectNameChange={setProjectName}
                            onSave={handleSave}
                            onSimplify={handleSimplify}
                            isSimplified={isSimplified}
                        />
                        <Controls/>
                        <Background/>
                    </ReactFlow>
                </div>
                <div className="right-panel">
                    {selectedNode ? renderInspector() : null}
                </div>
            </ReactFlowProvider>
        </div>
    );
};

export default NodeEditor;
