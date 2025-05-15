import React, {useState, useRef, useCallback, useMemo, useEffect} from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    Controls,
    Background,
} from 'reactflow';

import useFlowStore from '../store/useFlowStore.jsx';
import { componentTypes } from './ComponentsType.jsx';

import NodePalette from './NodePalette.jsx';

import NodeItem from './NodeItem.jsx';
import {SimplifiedNode} from "./simpleNode.jsx";
import HeatStructure from "./controls/HeatStructure.jsx";

import NodeInspector from "./NodeInspector.jsx";
import Toolbar from "./Toolbar.jsx";
import GeneralSettingPane from "./GeneralSettingPane.jsx";

import ICO from '../../../icon/keyboard_command_key_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg';
import 'reactflow/dist/style.css';
import './styles/NodeEditor.css';

const proOptions = { hideAttribution: true };

const NodeEditor = () => {

    // 커스텀 노드 타입 등록
    const nodeTypes = useMemo(() => ({
        node: NodeItem,
        simple: SimplifiedNode,

    }), []);

    const store = useFlowStore();
    const [nodes, setNodes] = useState(store.present.nodes);
    const [edges, setEdges] = useState(store.present.edges);
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isSimplified, setIsSimplified] = useState(false);
    const [projectName, setProjectName] = useState('noname project');

    const fileInputRef = React.useRef(null);

    const simplifyNodesAndEdges = (nodes, edges) => {
                // 1. 노드와 엣지를 맵으로 변환
                const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
                const inEdges = {};
                const outEdges = {};
                edges.forEach(e => {
                    if (!outEdges[e.source]) outEdges[e.source] = [];
                    if (!inEdges[e.target]) inEdges[e.target] = [];
                    outEdges[e.source].push(e);
                    inEdges[e.target].push(e);
                });

                // 2. 패턴 식별 및 연속 패턴 그룹화
                const patterns = [];

                // JUNCTION 노드 검사
                nodes.forEach(junc => {
                    if (
                        (junc.data.componentType === "SNGLJUN" || junc.data.componentType === "TMDPJUN") &&
                        inEdges[junc.id] && inEdges[junc.id].length === 1 &&
                        outEdges[junc.id] && outEdges[junc.id].length === 1
                    ) {
                        const inEdge = inEdges[junc.id][0];
                        const outEdge = outEdges[junc.id][0];
                        const inNode = nodeMap[inEdge.source];
                        const outNode = nodeMap[outEdge.target];

                        if (
                            inNode && outNode &&
                            inNode.data.componentType === "PIPE" &&
                            outNode.data.componentType === "PIPE"
                        ) {
                            // 패턴 추가
                            patterns.push({
                                inNode,
                                junction: junc,
                                outNode
                            });
                        }
                    }
                });

                // 3. 연속 패턴 식별
                // outNode가 다른 패턴의 inNode인 경우 연결
                const patternGroups = [];
                const processedPatterns = new Set();

                // 각 패턴에 대해
                patterns.forEach(pattern => {
                    // 이미 처리된 패턴은 건너뜀
                    if (processedPatterns.has(pattern)) return;

                    // 새 그룹 시작
                    const group = [pattern];
                    processedPatterns.add(pattern);

                    // 이 패턴의 outNode가 다른 패턴의 inNode인 패턴 찾기
                    let currentPattern = pattern;

                    // 연결된 다음 패턴 찾기
                    let foundNext = true;
                    while (foundNext) {
                        foundNext = false;

                        // 현재 패턴의 outNode가 다른 패턴의 inNode인 패턴 찾기
                        for (const nextPattern of patterns) {
                            if (
                                !processedPatterns.has(nextPattern) &&
                                currentPattern.outNode.id === nextPattern.inNode.id
                            ) {
                                // 연결된 패턴 발견
                                group.push(nextPattern);
                                processedPatterns.add(nextPattern);
                                currentPattern = nextPattern;
                                foundNext = true;
                                break;
                            }
                        }
                    }

                    patternGroups.push(group);
                });

                // 4. 그룹별 병합
                const merged = new Set();
                const newNodes = [];
                const newEdges = [];
                let mergeCount = 0;

                patternGroups.forEach(group => {
                    // 그룹에 포함된 모든 노드 수집
                    const allGroupNodes = [];
                    group.forEach(pattern => {
                        allGroupNodes.push(pattern.inNode);
                        allGroupNodes.push(pattern.junction);
                        // 마지막 패턴의 outNode만 추가 (중복 방지)
                        if (pattern === group[group.length - 1]) {
                            allGroupNodes.push(pattern.outNode);
                        }
                    });

                    // 병합 노드 생성
                    const mergedNode = {
                        id: `merged_${mergeCount++}`,
                        type: 'simple',
                        // 그룹의 중앙 노드 위치 사용
                        position: group[Math.floor(group.length / 2)].junction.position,
                        data: {
                            label: group.length > 1 ? `Multi-P-J-P` : 'P-J-P',
                            componentType: 'MERGED_PJP',
                            mergedNodes: allGroupNodes.map(n => n.id),
                            originalNodes: allGroupNodes.map(n => ({ ...n })),
                            patternCount: group.length
                        }
                    };

                    newNodes.push(mergedNode);

                    // 모든 노드를 병합 처리
                    allGroupNodes.forEach(node => merged.add(node.id));

                    // 연결 업데이트
                    // 첫 번째 inNode의 입력
                    const firstInNode = group[0].inNode;
                    if (inEdges[firstInNode.id]) {
                        inEdges[firstInNode.id].forEach(e => {
                            if (!merged.has(e.source)) {
                                newEdges.push({
                                    ...e,
                                    target: mergedNode.id
                                });
                            }
                        });
                    }

                    // 마지막 outNode의 출력
                    const lastOutNode = group[group.length - 1].outNode;
                    if (outEdges[lastOutNode.id]) {
                        outEdges[lastOutNode.id].forEach(e => {
                            if (!merged.has(e.target)) {
                                newEdges.push({
                                    ...e,
                                    source: mergedNode.id
                                });
                            }
                        });
                    }
                });

                // 병합되지 않은 노드/엣지 추가
                nodes.forEach(n => {
                    if (!merged.has(n.id)) newNodes.push(n);
                });
                edges.forEach(e => {
                    if (!merged.has(e.source) && !merged.has(e.target)) {
                        newEdges.push(e);
                    }
                });

                return { nodes: newNodes, edges: newEdges };
            };

    useEffect(() => {
        if (isSimplified) {
            // 간소화 모드: PIPE-JUNCTION-PIPE 병합

            //TODO
            // const { nodes: simpNodes, edges: simpEdges } = simplifyNodesAndEdges(store.present.nodes, store.present.edges);
            // setNodes(simpNodes.map(node => ({
            //     ...node,
            //     type: 'simple',
            //     data: { ...node.data, icon: node.data.icon }
            // })));
            // setEdges(simpEdges);

            const { nodes: simpNodes, edges: simpEdges } = simplifyNodesAndEdges(store.present.nodes, store.present.edges);
            setNodes(store.present.nodes.map(node => ({
                ...node,
                type: 'simple',
                data: { ...node.data, icon: node.data.icon }
            })));
            setEdges(store.present.edges);
        } else {
            setNodes(store.present.nodes.map(node => ({
                ...node,
                type: 'node'
            })));
            setEdges(store.present.edges);
        }
    }, [store.present.nodes, store.present.edges, isSimplified]);

    const handleNodesChange = useCallback((changes) => {
        const updatedNodes = applyNodeChanges(changes, nodes);
        setNodes(updatedNodes); // 👉 로컬 상태만 갱신
    }, [nodes]);

    const handleEdgesChange = useCallback((changes) => {
        const updatedEdges = applyEdgeChanges(changes, edges);
        setEdges(updatedEdges);
    }, [nodes, edges, store]);

    const handleNodeDragStart = useCallback( (event, node, nodes) => {
        store.setNodeDragStart(event, node, nodes)
    }, [[nodes, nodes, edges]] )

// 컴포넌트에서 사용
    const handleNodeDragStop = useCallback((_, draggedNode) => {
        store.handleNodeDragStop(draggedNode);
    }, [store]);

    const handleConnect = useCallback((connection) => {
        const updatedEdges = addEdge(connection, edges);
        setEdges(updatedEdges);
        store.set(nodes, updatedEdges);
    }, [nodes, edges, store]);

    const onNodeClick = useCallback((event, node) => {
        store.setSelectedNodeId(node.id);
        setSelectedNode(node);
    }, []);

    const onGenSettings = useCallback(() => {
        setSelectedNode({id: 'genset', type: 'GENSET', data: { label: 'Genset', componentType: 'GENSET' }});
    }, []);

    const handleDrop = useCallback((event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        if (!type) return;

        const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        store.dropNode(type, position);
    }, [reactFlowInstance, store]);

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
        switch(componentType) {
            case "HTSTR":
                return (
                    <HeatStructure
                        selectedNode={selectedNode}
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
                        onPropertyChange={() => {console.log( 'todo onPropertyChange ')}}
                    />
                );
                case "GENSET":
                    return ( <GeneralSettingPane/>);
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

    // Import 핸들러
    const handleImport = useCallback(() => {
        // 숨겨진 파일 입력 요소 클릭 트리거
        fileInputRef.current?.click();
    }, []);

    const handleExport = useCallback(() => {
        if (reactFlowInstance) {
            const flowData = reactFlowInstance.toObject();
            const jsonString = JSON.stringify(flowData, null, 2);

            const blob = new Blob([jsonString], { type: 'application/json' });
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
    const handleFileChange = useCallback((event) => {
        const fileReader = new FileReader();
        const file = event.target.files[0];

        if (!file) return;

        // 파일명에서 확장자 제거 후 프로젝트명으로 설정
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        setProjectName(fileName);

        fileReader.onload = (e) => {
            try {
                const flowData = JSON.parse(e.target.result);

                // 유효성 검사
                if (flowData && flowData.nodes && flowData.edges) {
                    // 스토어의 importFlow 함수 호출
                    store.importFlow(flowData);

                    // ReactFlow 화면 중앙 맞추기
                    setTimeout(() => {
                        reactFlowInstance?.fitView({ padding: 0.1 });
                    }, 50);
                } else {
                    alert('유효하지 않은 다이어그램 파일입니다.');
                }
            } catch (error) {
                console.error('파일 파싱 중 오류 발생:', error);
                alert('파일을 불러오는 중 오류가 발생했습니다.');
            }
        };

        fileReader.readAsText(file);
        event.target.value = null;
    }, [store, reactFlowInstance, setProjectName]);

    const handleSimplify = useCallback(() => {
        console.log('handleSimplify');
        setIsSimplified(prev => !prev);
    }, []);


    return (
        <div className="node-editor">

            <NodePalette componentsType={componentTypes} />
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
                        nodeTypes={nodeTypes} // 커스텀 노드 타입
                        onNodesChange={handleNodesChange}
                        onNodeClick={onNodeClick}
                        onNodeDragStart={handleNodeDragStart}
                        onNodeDragStop={handleNodeDragStop} // 노드 드래그 완료 이벤트 핸들러 추가
                        onEdgesChange={handleEdgesChange}
                        defaultEdgeOptions={{ type: 'smoothstep' }}
                        connectionLineType='smoothstep'
                        onConnect={handleConnect}
                        onPaneClick={onPaneClick}
                    >
                        <Toolbar
                            onUndo={store.undo}
                            onRedo={store.redo}
                            canUndo={store.canUndo}
                            canRedo={store.canRedo}
                            onImport={handleImport}
                            onExport={handleExport}
                            onGeneralSetting={onGenSettings}
                            projectName={projectName}
                            onProjectNameChange={setProjectName}
                            onSimplify={handleSimplify}
                            isSimplified={isSimplified}
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <Controls />
                        <Background />
                    </ReactFlow>
                </div>
                <div className="right-panel">
                    {selectedNode ? renderInspector() :  null }
                </div>
            </ReactFlowProvider>
        </div>
    );
};

export default NodeEditor;
