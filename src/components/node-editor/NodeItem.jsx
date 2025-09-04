import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import './styles/NodeItem.css';
import { componentTypes } from './ComponentsType.jsx';

import ICO from '../../../icon/keyboard_command_key_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg';

function formatNodeValue(key, value) {
    if (key === 'componentType') return null;
    if (typeof value === 'number') return value.toFixed(2);
    if (Array.isArray(value)) return `length: ${value.length}`;
    return value?.toString();
}

// Port position mapping utilities
const getPortPosition = (position) => {
    const positionMap = {
        'left': Position.Left,
        'right': Position.Right,
        'top': Position.Top,
        'bottom': Position.Bottom
    };
    return positionMap[position] || Position.Top;
};

// Generate port style based on MARS configuration
const getPortStyle = (port, componentType) => {
    const baseStyle = {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        border: '2px solid #333'
    };

    // MARS Face-based coloring
    if (port.marsCode) {
        const faceColors = {
            1: '#4CAF50', // Face 1 (X-) - Green
            2: '#2196F3', // Face 2 (X+) - Blue  
            3: '#FF9800', // Face 3 (Y-) - Orange
            4: '#9C27B0', // Face 4 (Y+) - Purple
            5: '#F44336', // Face 5 (Z-) - Red
            6: '#00BCD4'  // Face 6 (Z+) - Cyan
        };
        baseStyle.backgroundColor = faceColors[port.marsCode] || '#666';
    } else {
        // Fallback colors for non-MARS ports
        baseStyle.backgroundColor = port.type === 'target' ? '#e74c3c' : '#27ae60';
    }

    // Special styling for thermal connections
    if (port.connectionType === 'thermal') {
        baseStyle.border = '3px dashed #ff6b35';
        baseStyle.backgroundColor = '#ff6b35';
    }

    return baseStyle;
};

// Render multiple ports based on component definition
const renderPorts = (data, componentType) => {
    const componentDef = componentTypes[componentType];
    if (!componentDef || !componentDef.ports) {
        // Fallback to legacy port system
        return (
            <>
                <Handle type="target" position={Position.Top}/>
                <Handle type="source" position={Position.Bottom}/>
            </>
        );
    }

    const ports = [];
    
    // Render input ports
    if (componentDef.ports.inputs) {
        componentDef.ports.inputs.forEach(port => {
            ports.push(
                <Handle
                    key={`input-${port.id}`}
                    type="target"
                    position={getPortPosition(port.position || 'left')}
                    id={port.id}
                    style={getPortStyle({ ...port, type: 'target' }, componentType)}
                    data-mars-face={port.marsCode}
                    data-connection-type={port.connectionType || 'fluid'}
                />
            );
        });
    }

    // Render output ports  
    if (componentDef.ports.outputs) {
        componentDef.ports.outputs.forEach(port => {
            ports.push(
                <Handle
                    key={`output-${port.id}`}
                    type="source"
                    position={getPortPosition(port.position || 'right')}
                    id={port.id}
                    style={getPortStyle({ ...port, type: 'source' }, componentType)}
                    data-mars-face={port.marsCode}
                    data-connection-type={port.connectionType || 'fluid'}
                />
            );
        });
    }

    // Render bidirectional ports (for crossflow)
    if (componentDef.ports.bidirectional) {
        componentDef.ports.bidirectional.forEach(port => {
            // Create both target and source handles for bidirectional ports
            ports.push(
                <Handle
                    key={`bi-target-${port.id}`}
                    type="target"
                    position={getPortPosition(port.position)}
                    id={`${port.id}-in`}
                    style={getPortStyle({ ...port, type: 'target' }, componentType)}
                    data-mars-face={port.marsCode}
                    data-connection-type={port.connectionType || 'fluid'}
                />
            );
            ports.push(
                <Handle
                    key={`bi-source-${port.id}`}
                    type="source"
                    position={getPortPosition(port.position)}
                    id={`${port.id}-out`}
                    style={getPortStyle({ ...port, type: 'source' }, componentType)}
                    data-mars-face={port.marsCode}
                    data-connection-type={port.connectionType || 'fluid'}
                />
            );
        });
    }

    // Render thermal ports (HTSTR specific)
    if (componentDef.ports.thermal) {
        componentDef.ports.thermal.forEach(port => {
            // Thermal ports are bidirectional by nature
            ports.push(
                <Handle
                    key={`thermal-target-${port.id}`}
                    type="target"
                    position={getPortPosition(port.position)}
                    id={`${port.id}-in`}
                    style={getPortStyle({ ...port, type: 'target' }, componentType)}
                    data-connection-type="thermal"
                />
            );
            ports.push(
                <Handle
                    key={`thermal-source-${port.id}`}
                    type="source"
                    position={getPortPosition(port.position)}
                    id={`${port.id}-out`}
                    style={getPortStyle({ ...port, type: 'source' }, componentType)}
                    data-connection-type="thermal"
                />
            );
        });
    }

    return ports;
};

const NodeItem = ({ data, type, onDelete }) => {
    // State for showing/hiding properties
    const [showProperties, setShowProperties] = useState(false);
    
    // Special handling for unified VALVE component
    const isValve = data.componentType === 'VALVE';
    const valveType = isValve ? data.componentProp?.valveType : null;
    const needsTypeSelection = isValve && !valveType;
    
    // Get display label for valve component
    const getDisplayLabel = () => {
        if (isValve) {
            if (valveType) {
                // Try to get the valve configuration for display name
                const valveTypes = {
                    CHKVLV: 'Check Valve',
                    TRPVLV: 'Trip Valve',
                    INRVLV: 'Inertial Valve',
                    MTRVLV: 'Motor Valve',
                    SRVVLV: 'Servo Valve',
                    RLFVLV: 'Relief Valve'
                };
                return valveTypes[valveType] || valveType;
            }
            return 'VALVE - Select Type';
        }
        return data.componentType;
    };
    
    // Get valve type icon
    const getValveIcon = () => {
        if (!isValve || !valveType) return null;
        
        const valveIcons = {
            CHKVLV: '',
            TRPVLV: '',
            INRVLV: '️',
            MTRVLV: '',
            SRVVLV: '️',
            RLFVLV: ''
        };
        
        return valveIcons[valveType] || '⚙️';
    };
    
    return (
        <div className={`node ${needsTypeSelection ? 'node-needs-config' : ''}`}>
            <div className={`node-header-${data.componentType}`}>
                <div className={'node-header'}>
                    {isValve && valveType && (
                        <div className="node-icon" style={{ fontSize: '16px', marginRight: '4px' }}>
                            {getValveIcon()}
                        </div>
                    )}
                    <div className="position-node-label">
                        {getDisplayLabel()}
                        {needsTypeSelection && (
                            <span style={{ 
                                marginLeft: '8px', 
                                color: '#ff9800',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}>
                                ⚠️
                            </span>
                        )}
                    </div>
                    <div className="node-title">
                        {/*{node.name || componentDef.label}*/}
                    </div>
                    <div className="node-header-buttons">
                        <button
                            className="node-menu-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowProperties(!showProperties);
                            }}
                            title={showProperties ? "숨기기" : "속성 보기"}
                        >
                            <span className={`hamburger-icon ${showProperties ? 'rotated' : ''}`}>
                                ☰
                            </span>
                        </button>
                        <button
                            className="node-delete-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log('delete button clicked', data.onDelete);
                                if (data.onDelete)
                                    data.onDelete();
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>
            </div>
            {/* node body */ }
            <div className="node-body">
                {renderPorts(data, data.componentType)}
                <div className="node-content">
                    <div className="node-position">
                        {data.label}
                    </div>
                    {needsTypeSelection && (
                        <div style={{
                            padding: '8px',
                            backgroundColor: '#fff3e0',
                            border: '1px solid #ff9800',
                            borderRadius: '4px',
                            marginBottom: '8px',
                            fontSize: '12px',
                            textAlign: 'center',
                            color: '#e65100'
                        }}>
                            Click to select valve type
                        </div>
                    )}
                    {showProperties && (
                        <div className={`node-properties ${showProperties ? 'expanded' : 'collapsed'}`}>
                            {data.componentProp && Object.entries(data.componentProp).map(([key, value]) => {
                            {/*{data && Object.entries(data).map(([key, value]) => {*/}
                                const formatted = formatNodeValue(key, value);
                                if (formatted === null) return null;
                                // Skip showing valveType as a raw property
                                if (key === 'valveType' && isValve) {
                                    return null; // Already shown in header
                                }
                                return (
                                    <div key={key} className="node-property">
                                        <span className="property-name">{key}:</span>
                                        <span className="property-value">{formatted}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default memo(NodeItem);