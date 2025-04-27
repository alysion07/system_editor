import React, { useState, useReducer, useRef, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    MouseSensor,
    KeyboardSensor
} from '@dnd-kit/core';

import { restrictToWindowEdges } from '@dnd-kit/modifiers';

// Components
import ComponentPalette from './components/ComponentPalette';
import DesignCanvas from './components/DesignCanvas';
import NodeInspector2 from "./components/NodeInspector2.jsx";

import Toolbar from './components/Toolbar';
import Node from './components/Node';
import HeatStructure from "./components/control/HeatStructure.jsx";

// Styles
import './styles/App.css';

// Utility functions
import { generateId } from './utils/helpers';
import { getInitialState, reducer } from './reducers/editorReducer';
import { generateMarsInputFile, saveInputFile } from './utils/fileGenerator';
import {uploadToMinio} from "./services/minioService";


function NodeEditor() {
    // Editor state using reducer for complex state management (enables undo/redo)
    const [state, dispatch] = useReducer(reducer, null, getInitialState);

    // Local state for drag operations
    const [activeId, setActiveId] = useState(null);
    const [activeNodeData, setActiveNodeData] = useState(null);
    const [connectionInProgress, setConnectionInProgress] = useState(null);
    const [paletteWidth, setPaletteWidth] = useState(160); // 초기값 설정
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // References
    const canvasRef = useRef(null);

    // Configure sensors for drag interactions
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );
    // 컴포넌트가 마운트될 때 이벤트 리스너 추가
    useEffect(() => {
        // 마우스 이벤트 핸들러 함수
        function handleGlobalMouseMove(event) {
            setMousePosition({
                x: event.clientX,
                y: event.clientY
            });
        }

        // 문서에 이벤트 리스너 추가
        document.addEventListener('mousemove', handleGlobalMouseMove);

        // 컴포넌트가 언마운트될 때 정리(cleanup) 함수
        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
        };
    }, []); // 빈 배열은 이 효과가 마운트/언마운트 시에만 실행됨을 의미

    /**
     * 드래그 작업이 시작될 때 호출되는 핸들러 함수
     *
     * @param {Object} event - DndKit에서 제공하는 드래그 이벤트 객체
     * @description 드래그되는 항목의 유형에 따라 적절한 상태를 설정함
     * - 팔레트 항목: 새 노드 생성을 위해 컴포넌트 데이터 준비
     * - 기존 노드: 이동할 노드의 참조 저장
     */
    const handleDragStart = (event) => {
        const { active} = event;

        // data-element-type 속성으로 구분
        const elementType = event.activatorEvent.target.closest('[data-element-type]')?.dataset.elementType;

        if (active.data.current?.type === 'palette-item') {
            setActiveNodeData(active.data.current.component);
        }
        else if( elementType === 'port') {
            // 연결 시작
            console.log("handleDragStart 'node-input'");
        }
        else if (active.data.current?.type === 'node') {
            setActiveId(active.id);
            // find the dragged node
            const draggedNode = state.present.nodes.find(node => node.id === active.id);
            setActiveNodeData(draggedNode);
        }

    };

    const handleDragEnd = (event) => {
        const { active, over, delta } = event;

        const elementType = event.activatorEvent.target.closest('[data-element-type]')?.dataset.elementType;

        if (elementType === 'port') {
            // data-element-type 속성으로 구분
            console.log("handleDragEnd elementType 'port'" , over.id);

        }

        // 팔레트에서 캔버스로 드래그한 경우 (새 노드 생성)
        else if (active.data.current?.type === 'palette-item' && over?.id === 'canvas') {

            // 컴포넌트 정의에서 노드 기본 크기 가져오기
            const componentType = active.data.current.component.type;
            const componentLabel = active.data.current.component.label;

            // 전체 노드 수를 기준으로 카운트 (타입 구분 없이)
            const count = state.present.nodes.length;

            // 노드 번호를 3자리 숫자로 포맷팅 (예: 1 -> 001)
            let formattedNumber = String(count).padStart(3, '0');

            if(componentType === "HEATSTR") {formattedNumber = '1' + formattedNumber;}

            // 라벨을 사용하여 이름 생성 (예: SJ -> SJ001)
            const nodeName = `${componentLabel}${formattedNumber}`;

            // 마우스 포인터 위치를 캔버스 내 좌표로 변환
            let canvasX = mousePosition.x - paletteWidth;
            let canvasY = mousePosition.y - 60/* header height*/;

            // 새 노드 추가
            dispatch({
                type: 'ADD_NODE',
                payload: {
                    id: generateId(),
                    type: componentType,
                    compName: nodeName, // 생성된 이름 추가
                    compNumber: formattedNumber,
                    category: active.data.current.component.category,
                    position: {
                        x: canvasX,
                        y: canvasY
                    },
                    data: {
                        ...active.data.current.component.defaultData,
                        name: nodeName // 데이터에도 이름 추가
                    }
                }
            });
        }
        // 기존 노드 드래그가 종료된 경우 (추가)
        else if (active.data.current?.type === 'node') {
            const nodeId = active.id;
            const draggedNode = state.present.nodes.find(node => node.id === nodeId);
            const newPosition = {
                x: draggedNode.position.x + delta.x,
                y: draggedNode.position.y + delta.y
            }

            if (draggedNode) {
                // 히스토리에 현재 상태 저장 (드래그 완료 처리)
                dispatch({
                    type: 'MOVE_NODE',
                    payload: {
                        id: nodeId,
                        position: newPosition,
                    }
                });
            }
        }

        // 드래그 상태 초기화
        setActiveId(null);
        setActiveNodeData(null);
    };

    const handleNodeSelect = (nodeId) => {
        dispatch({
            type: 'SELECT_NODE',
            payload: nodeId,
        });
    };

    const handleNodePropertyChange = (id, property, value) => {
        dispatch({
            type: 'UPDATE_NODE_PROPERTY',
            payload: {
                id,
                property,
                value
            }
        });
    };

    const handleConnectionStart = (nodeId, portId, isInput) => {
        // console.log('handleConnectionStart', nodeId, portId, isInput, connectionInProgress);

        // 사용자가 포트를 드래그 하여 Connection 시작 정보가 설정된 경우
        if (connectionInProgress) {
            // Determine source and target based on connection direction
            let source, sourcePort, sourceType, target, targetPort, targetType;

            // input -> output
            if (connectionInProgress.sourceType === 'inputs') {
                target = connectionInProgress.sourceId;
                targetPort = connectionInProgress.sourcePortId;
                targetType = connectionInProgress.sourceType;
                source = nodeId;
                sourcePort = portId;
                sourceType = isInput ? 'inputs' : 'outputs';
            }
            // output -> input
            else {
                source = connectionInProgress.sourceId;
                sourcePort = connectionInProgress.sourcePortId;
                sourceType = connectionInProgress.sourceType;
                target = nodeId;
                targetPort = portId;
                targetType = isInput ? 'inputs' : 'outputs';
            }

            // Only allow output -> input connections
            if( targetType!== sourceType && source !== target){
                dispatch({
                    type: 'ADD_CONNECTION',
                    payload: {
                        id: generateId(),
                        sourceId: source,
                        sourcePortId: sourcePort,
                        targetId: target,
                        targetPortId: targetPort
                    }
                });
            }

            setConnectionInProgress(null);
        }
        else{

            // Connection 시작 정보 설정
            setConnectionInProgress({
                sourceId: nodeId,
                sourcePortId: portId,
                sourceType: isInput ? 'inputs' : 'outputs',
            });
        }
    };

    const handleDeleteNode = (nodeId) => {
        dispatch({
            type: 'DELETE_NODE',
            payload: nodeId
        });
    };

    const handleDeleteConnection = (connectionId) => {
        dispatch({
            type: 'DELETE_CONNECTION',
            payload: connectionId
        });
    };

    const handleUndo = () => {
        dispatch({ type: 'UNDO' });
    };

    const handleRedo = () => {
        dispatch({ type: 'REDO' });
    };

    const handleSaveProject = () => {
        const projectData = JSON.stringify({
            nodes: state.present.nodes,
            connections: state.present.connections,
            projectName: state.present.projectName
        });

        // Create a blob and trigger download
        const blob = new Blob([projectData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${state.projectName || 'reactor-design'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleLoadProject = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const loadedProject = JSON.parse(e.target.result);
                    dispatch({
                        type: 'LOAD_PROJECT',
                        payload: loadedProject
                    });
                } catch (error) {
                    console.error('Error loading project:', error);
                    alert('Failed to load project file. The file may be corrupted.');
                }
            };
            reader.readAsText(file);
        }
    };

    const handleGenerateInput = () => {
        // // Generate the input file content based on current nodes and connections
        // const inputFileContent = generateMarsInputFile(
        //     state.present.nodes,
        //     state.present.connections,
        //     state.present.projectName
        // );
        //
        // // Save the generated content to a file
        // saveInputFile(inputFileContent, `${state.present.projectName.replace(/\s+/g, '_')}_input.txt`);


    };

    // Determine which node to render in the overlay during drag
    const renderDragOverlay = () => {
        if (!activeNodeData) return null;
        return (
            <Node
                node={activeNodeData}
                isOverlay
            />
        );
    };

    const renderInspector = () => {
        const category = state.present.nodes.find(node => node.id === state.present.selectedNodeId)?.category;
        switch(category) {
            case "hydro":
                return (
                    <NodeInspector2
                        selectedNode={state.present.nodes.find(node => node.id === state.present.selectedNodeId)}
                        componentTypes={state.present.componentTypes}
                        onPropertyChange={handleNodePropertyChange}
                    />
                );
            case "thermal":
                return(
                    <HeatStructure
                        selectedNode={state.present.nodes.find(node => node.id === state.present.selectedNodeId)}
                    />
                );
        }
    };

    return (
        <div className="app">
            <Toolbar
                onMousePosition={mousePosition}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={state.past.length > 0}
                canRedo={state.future.length > 0}
                onSave={handleSaveProject}
                onLoad={handleLoadProject}
                onGenerateInput={handleGenerateInput}
                projectName={state.present.projectName}
                onProjectNameChange={(name) => dispatch({
                    type: 'SET_PROJECT_NAME',
                    payload: name
                })}
            />

            <div className="main-container">
                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToWindowEdges]}
                >
                    <div className="left-panel">
                        <ComponentPalette
                            components={state.present.componentTypes}
                            setPaletteWidth = {setPaletteWidth}
                        />
                    </div>

                    <div className="center-panel">
                        <DesignCanvas
                            ref={canvasRef}
                            nodes={state.present.nodes}
                            connections={state.present.connections}
                            selectedNodeId={state.present.selectedNodeId}
                            onNodeSelect={handleNodeSelect}
                            onConnectionStart={handleConnectionStart}
                            connectionInProgress={connectionInProgress}
                            onDeleteNode={handleDeleteNode}
                            onDeleteConnection={handleDeleteConnection}
                        />
                    </div>

                    <div className="right-panel">
                        { state.present.selectedNodeId ? renderInspector() : null }
                    </div>

                    <DragOverlay>
                        {activeId ? renderDragOverlay() : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}

export default NodeEditor;