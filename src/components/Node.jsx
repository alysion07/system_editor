// File: src/components/Node.js
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import '../styles/Node.css';
import { componentTypes, componentCategories } from './ComponentsType.jsx';

const Node = ({
                  node,
                  isSelected = false,
                  isOverlay = false,
                  onSelect,
                  onConnectionClick,
                  onDelete
              }) => {
    // Get component definition for this node type
    const componentDef = componentTypes?.[node.type] || {
        label: node.type,
        icon: '?',
        ports: {
            inputs: [ {id:"in",label:"test-in"}],
            outputs: [{id:"out",label:"test_out"}]
        }
    };

    // Set up draggable if not an overlay during drag
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: node.id,
        disabled: isOverlay,
        data: {
            type: 'node'
        }
    });

    // transform이 존재하면 현재 드래그 중인 상태
    const isDragging = Boolean(transform);

    const style = {
        position: 'absolute',
        // 오버레이가 아닐 경우에만 위치 설정
        left: isOverlay ? 0 : node.position?.x || 0,
        top: isOverlay ? 0 : node.position?.y || 0,
        // transform은 드래그 중인 동안에만 적용 (시각적 효과만)
        // transform: isDragging && !isOverlay ? `translate3d(0, 0, 0)` : undefined,
        zIndex: isDragging ? 1000 : (isSelected ? 100 : 10),
        cursor: isDragging ? 'grabbing' : 'grab'
    };

    function handlePortClick(e, portId, isInput) {
        // 명확하게 드래그 기능과 구분하기 위한 플래그 설정
        e.currentTarget.dataset.connecting = 'true';


        if (onConnectionClick) {
            onConnectionClick(node.id, portId, isInput);
        }
    }

    const renderPorts = (ports, isInput) => {
        return ports?.map(port => (
            <div
                key={port.id}
                className={`node-port ${isInput ? 'input' : 'output'}`}
                data-port-id={port.id}
                data-element-type="port"
               // onMouseDown={(e) => handlePortMouseDown(e, port.id, isInput)}
                onClick={(e) => { handlePortClick(e, port.id, isInput)} }
              //  onMouseUp={(e) => handlePortMouseUp(e, port.id, isInput)}
            >
                <div className="port-dot"></div>
                <div className="port-label">{port.label}</div>
            </div>
        ));
    };

    const nodeClasses = [
        'node',
        isSelected ? 'selected' : '',
        isOverlay ? 'overlay' : '',
        isDragging ? 'dragging' : '',
        `node-${node.type.toLowerCase()}`
    ].filter(Boolean).join(' ');

    // 노드 클릭 핸들러 - 이벤트 전파 방지
    const handleNodeClick = (e) => {
       // e.stopPropagation();
       //  e.preventDefault(); // 기본 동작 방지 추가
       //   console.log('Node clicked:', e);

        if (onSelect) {
            onSelect();
        }

    };

    return (
        <div
            id={`node-${node.id}`}
            ref={setNodeRef}
            className={nodeClasses}
            style={style}
            onClick={handleNodeClick}
            {...(isOverlay ? {} : attributes)}
            {...(isOverlay ? {} : listeners)}
        >
            <div className="node-header">
                {/*<div className="node-icon">{componentDef.icon}</div>*/}
                <div className="node-title">
                    {node.name || componentDef.label}
                </div>
                {!isOverlay && (
                    <button
                        className="node-delete-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onDelete) onDelete();
                        }}
                    >
                        ×
                    </button>
                )}
            </div>

            <div className="node-body">
                <div className="node-ports inputs">
                    {renderPorts(componentDef.ports?.inputs, true)}

                </div>

                <div className="node-content">
                    {node.data && Object.entries(node.data).map(([key, value]) => (
                        <div key={key} className="node-property">
                            <span className="property-name">{key}:</span>
                            <span className="property-value">
                                {typeof value === 'number' ? value.toFixed(2) :  (Array.isArray(value) ? `length: ${value.length}` : value.toString())}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="node-ports outputs">
                    {renderPorts(componentDef.ports?.outputs, false)}
                </div>
            </div>
        </div>
    );
};

export default Node;