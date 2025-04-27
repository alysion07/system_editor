// File: src/components/DesignCanvas.js
import React, { useRef, useEffect, forwardRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import Connection from './Connection';
import Node from './Node';
import '../styles/DesignCanvas.css';
import { componentTypes } from './ComponentsType.jsx';



const DesignCanvas = forwardRef(({
                                     nodes,
                                     connections,
                                     selectedNodeId,
                                     onNodeSelect,
                                     onConnectionStart,
                                     onConnectionEnd,
                                     connectionInProgress,
                                     onDeleteNode,
                                     onDeleteConnection,
                                 }, ref) => {
    const { setNodeRef } = useDroppable({
        id: 'canvas'
    });

    const canvasRef = useRef(null);
    const [transform, setTransform] = React.useState({transformX: 0, transformY: 0, scale: 1});

    // Combine refs
    React.useImperativeHandle(ref, () => canvasRef.current);

    // 캔버스 배경 클릭 시 노드 선택 해제
    const handleCanvasClick = (e) => {
        if (e.target === canvasRef.current ||
            e.target.classList.contains('canvas-content') ||
            e.target.classList.contains('canvas-grid')) {
            onNodeSelect(null);
            if(connectionInProgress)
                onConnectionStart(null);
        }
    };

    // Set up canvas pan and zoom functionality
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let isPanning = false;
        let startPoint = { x: 0, y: 0 };
        let currentTranslate = { x: 0, y: 0 };

        const handleMouseDown = (e) => {
            // Only start panning with middle mouse button or when holding space
            if (e.button === 1 || (e.button === 0 && e.getModifierState('Space'))) {
                isPanning = true;
                startPoint = { x: e.clientX, y: e.clientY };
                canvas.style.cursor = 'grabbing';
                e.preventDefault();
            }
        };

        const handleMouseMove = (e) => {
            if (!isPanning) return;

            const dx = e.clientX - startPoint.x;
            const dy = e.clientY - startPoint.y;

            currentTranslate = {
                x: currentTranslate.x + dx,
                y: currentTranslate.y + dy
            };

            // 드래그 시작점으로부터의 이동량
            startPoint = { x: e.clientX, y: e.clientY };

            // Update the transform of content-container
            const contentContainer = canvas.querySelector('.canvas-content');
            if (contentContainer) {
                const { scale } = getCanvasTransform();
                contentContainer.style.transform = `translate(${currentTranslate.x}px, ${currentTranslate.y}px) scale(${scale})`;
                setTransform({...transform, scale: scale}); // 스케일 상태 업데이트
            }
        };

        const handleMouseUp = () => {
            if (isPanning) {
                isPanning = false;
                canvas.style.cursor = 'default';
            }
        };

        const handleWheel = (e) => {
            e.preventDefault();

            const contentContainer = canvasRef.current?.querySelector('.canvas-content');
            if (!contentContainer) return;

            // 여기서 transform을 직접 쓰지 않고
            setTransform(prev => {
                const currentScale = prev.scale;
                const delta = e.deltaY > 0 ? -0.05 : 0.05;
                const newScale = Math.max(0.05, Math.min(4, currentScale + delta));

                const translateMatch = contentContainer.style.transform.match(/translate\(([^,]+)px, ([^)]+)px\)/);
                const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
                const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;

                contentContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${newScale})`;

                updateConnection(); // 연결 업데이트

                return { ...prev, scale: newScale };
            });
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, []);

    // Handle mouse position for temporary connection
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const canvas = canvasRef.current;
            if (canvas && connectionInProgress) {
                const rect = canvas.getBoundingClientRect();
                
                // 캔버스의 변환 정보 가져오기
                const { scale, translateX, translateY } = transform;
                
                // 마우스 위치를 캔버스 내 논리적 좌표로 변환
                const x = ((e.clientX - rect.left) - translateX) / scale;
                const y = ((e.clientY - rect.top) - translateY) / scale;
                setMousePosition({ x, y });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [connectionInProgress]);

    // Find source or target node and port for in-progress connection
    const getConnectionNodePort = () => {
        if (!connectionInProgress)
            return null;

        const sourceNode = nodes.find(node => node.id === connectionInProgress.sourceId);
        if (!sourceNode)
            return null;

        let portType, portList;
        portType = connectionInProgress.sourceType;

        // Get component definition for this node
        const componentType = sourceNode.type;
        const componentDef = Object.values(componentTypes).find(
            comp => comp.type === componentType
        );

        if (!componentDef) return null;

        // Find the specific port
        const port = componentDef.ports[portType].find(
            p => p.id === connectionInProgress.sourcePortId
        );

        if (!port) return null;

        return {
            node: sourceNode,
            port,
            isInput: connectionInProgress.isInput
        };
    };

    // 캔버스의 현재 변환 상태 가져오기
    const getCanvasTransform = () => {
        const contentContainer = canvasRef.current?.querySelector('.canvas-content');
        if (!contentContainer) return { scale: 1, translateX: 0, translateY: 0 };

        const transform = contentContainer.style.transform || '';
        const scaleMatch = transform.match(/scale\(([^)]+)\)/);
        const translateMatch = transform.match(/translate\(([^,]+)px, ([^)]+)px\)/);
        
        return {
            scale: scaleMatch ? parseFloat(scaleMatch[1]) : 1,
            translateX: translateMatch ? parseFloat(translateMatch[1]) : 0,
            translateY: translateMatch ? parseFloat(translateMatch[2]) : 0
        };
    };

    // Calculate the position of a port on a node
    const getPortPosition = (node, portId, isInput) => {
        const nodeElement = document.getElementById(`node-${node.id}`);
        if (!nodeElement) return { x: node.position.x, y: node.position.y };

        // TODO : querySelector 방식 -> ref 방식으로 변경 필요
        const portElement = nodeElement.querySelector(
            `.node-port${isInput ? '.input' : '.output'}[data-port-id="${portId}"]`
        );

        if (!portElement)
            return { x: node.position.x, y: node.position.y };

        // 캔버스의 변환 정보 가져오기
        const { scale, translateX, translateY } = getCanvasTransform();
        
        // 캔버스와 포트의 뷰포트 기준 좌표 구하기
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const portRect = portElement.getBoundingClientRect();
        
        // 포트의 중심 위치 계산
        const portCenterX = portRect.left + portRect.width / 2;
        const portCenterY = portRect.top + portRect.height / 2;
        
        // 캔버스 좌상단 기준 상대 위치 계산
        let x = portCenterX - canvasRect.left;
        let y = portCenterY - canvasRect.top;
        
        // 스케일 및 이동 보정 적용하여 논리적 위치로 변환
        x = (x - translateX) / scale;
        y = (y - translateY) / scale;
        return { x, y };
    };

    const updateConnection = () => {

        if(connections.length === 0) return;

        connections.forEach(connection => {

            const sourcePos = getPortPosition(
                connection.sourceId,
                connection.sourcePortId,
                true
            );

            const targetPos = getPortPosition(
            connection.targetId,
            connection.targetPortId,
            false
            );
            console.log(`source-pos: ${sourcePos.x},${sourcePos.y} , source-pos:${targetPos.x},${targetPos.y}`);
        })
    }

    // 최초 포트 클릭시 연결선을 임시로 그리기 위한 함수(점선으로 표시)
    const renderTemporaryConnection = () => {
        if (!connectionInProgress) return null;

        const sourceData = getConnectionNodePort();
        if (!sourceData) return null;

        const sourcePos = getPortPosition(
            sourceData.node,
            connectionInProgress.sourcePortId,
            connectionInProgress.isInput
        );

        // If input port is the source, swap start and end points
        let startPos, endPos;
        if (connectionInProgress.isInput) {
            startPos = mousePosition;
            endPos = sourcePos;
        } else {
            startPos = sourcePos;
            endPos = mousePosition;
        }

        return (
            <Connection
                key="temp-connection"
                connection={{
                    id: 'temp',
                    sourceId: sourceData.node.id,
                    targetId: 'mouse',
                    sourcePortId: connectionInProgress.sourcePortId,
                    targetPortId: 'mouse'
                }}
                startPos={startPos}
                endPos={endPos}
                isTemporary
            />
        );
    };


    return (
        <div
            ref={(el) => {
                setNodeRef(el);
                canvasRef.current = el;
            }}
            className="design-canvas"
            onClick={handleCanvasClick}
        >
            <div className="canvas-grid"></div>
            <div className="canvas-content">
                <svg className="connections-container">
                    {/* Render connections */}
                    {connections.map(connection => {
                        const sourceNode = nodes.find(n => n.id === connection.sourceId);
                        const targetNode = nodes.find(n => n.id === connection.targetId);

                        if (!sourceNode || !targetNode) return null;

                        const startPos = getPortPosition(sourceNode, connection.sourcePortId, false);
                        const endPos = getPortPosition(targetNode, connection.targetPortId, true);

                        return (
                            <Connection
                                key={connection.id}
                                connection={connection}
                                startPos={startPos}
                                endPos={endPos}
                                onDelete={() => onDeleteConnection(connection.id)}
                            />
                        );
                    })}

                    {/* Render temporary connection if in progress */}
                    {renderTemporaryConnection()}
                </svg>

                {/* Render nodes */}
                {nodes.map(node => (
                    <Node
                        key={node.id}
                        node={node}
                        isSelected={node.id === selectedNodeId}
                        onSelect={() => onNodeSelect(node.id)}
                        onConnectionClick={onConnectionStart}
                        onConnectionEnd={onConnectionEnd}
                        onDelete={() => onDeleteNode(node.id)}
                    />
                ))}
            </div>
        </div>
   //     </DndContext>

    );
});

export default DesignCanvas;