import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './styles/NodeItem.css';

import ICO from '../../../icon/keyboard_command_key_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg';
function formatNodeValue(key, value) {
    if (key === 'componentType') return null;
    if (typeof value === 'number') return value.toFixed(2);
    if (Array.isArray(value)) return `length: ${value.length}`;
    return value?.toString();
}

const NodeItem = ({ data, xPos, yPos, type, onDelete }) => {
    return (
        <div className="node">
            <div className={`node-header-${data.componentType}`}>
                <div className={'node-header'}>
                    {/*<div className="node-icon">{componentDef.icon}</div>*/}
                    <div className="position-node-label">{data.componentType}</div>
                    <div className="node-title">
                        {/*{node.name || componentDef.label}*/}
                    </div>
                    <button
                        className="node-delete-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onDelete) onDelete();
                            // TODO : 삭제기능 구현 필요
                        }}
                    >
                        ×
                    </button>
                </div>
            </div>
            {/* node body */ }
            <div className="node-body">
                <Handle type="target" position={Position.Top}/>
                <div className="node-content">
                    <div className="node-position">
                        {data.label}
                    </div>
                    <div className="node-content">
                        {data.componentProp && Object.entries(data.componentProp).map(([key, value]) => {
                        {/*{data && Object.entries(data).map(([key, value]) => {*/}
                            const formatted = formatNodeValue(key, value);
                            if (formatted === null) return null;
                            return (
                                <div key={key} className="node-property">
                                    <span className="property-name">{key}:</span>
                                    <span className="property-value">{formatted}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <Handle type="source" position={Position.Bottom}/>
            </div>
        </div>
    );
};

export default memo(NodeItem);