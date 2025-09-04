// File: src/utils/helpers.js
// Utility functions for the node editor

// Generate a unique ID for nodes, connections, etc.
export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};

// Convert a position to a string for React keys
export const positionToString = (position) => {
    return `${Math.round(position.x)},${Math.round(position.y)}`;
};

// Calculate distance between two points
export const distance = (p1, p2) => {
    return Math.sqrt(
        Math.pow(p2.x - p1.x, 2) +
        Math.pow(p2.y - p1.y, 2)
    );
};

// Deep clone an object
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(deepClone);
    }

    const cloned = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }

    return cloned;
};

// Check if two objects are equal
export const areEqual = (a, b) => {
    if (a === b) return true;

    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
        return a === b;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every(key => {
        if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
        return areEqual(a[key], b[key]);
    });
};

// MARS-specific port connection rules
export const getMarsConnectionRules = () => {
    return {
        // Face-to-Face connection rules
        faceConnections: {
            // Primary flow: Face 2 (outlet) -> Face 1 (inlet)
            primary: { from: 2, to: 1 },
            // Crossflow: any face can connect to any other face
            crossflow: [3, 4, 5, 6]
        },
        
        // Component-specific connection restrictions
        componentRules: {
            TMDPVOL: {
                type: 'source-only',
                description: 'Time-dependent volumes can only be sources',
                allowedConnections: ['outputs']
            },
            TMDPJUN: {
                type: 'source-only', 
                description: 'Time-dependent junctions can only be sources',
                allowedConnections: ['outputs']
            },
            HTSTR: {
                type: 'thermal-only',
                description: 'Heat structures only allow thermal connections',
                connectionTypes: ['thermal']
            }
        },
        
        // Directional components (prevent reverse flow)
        directionalComponents: ['PUMP', 'VALVE']
    };
};

// Enhanced connection validation with MARS rules
export const isValidConnection = (source, target, nodes, componentTypes) => {
    // Basic validation
    if (source.nodeId === target.nodeId) return false;
    if (source.isInput === target.isInput) return false;

    const sourceNode = nodes.find(n => n.id === source.nodeId);
    const targetNode = nodes.find(n => n.id === target.nodeId);
    if (!sourceNode || !targetNode) return false;

    const sourceCompDef = componentTypes[sourceNode.data.componentType];
    const targetCompDef = componentTypes[targetNode.data.componentType];
    if (!sourceCompDef || !targetCompDef) return false;

    // Get port definitions
    const sourcePort = getPortFromComponent(sourceCompDef, source, true);
    const targetPort = getPortFromComponent(targetCompDef, target, false);
    if (!sourcePort || !targetPort) return false;

    // MARS-specific validation
    const marsRules = getMarsConnectionRules();
    
    // 1. Check component-specific restrictions
    if (!validateComponentRestrictions(sourceNode, targetNode, marsRules)) {
        return false;
    }
    
    // 2. Check connection type compatibility
    if (!validateConnectionTypes(sourcePort, targetPort)) {
        return false;
    }
    
    // 3. Check MARS Face connection rules
    if (!validateMarsFaceConnections(sourcePort, targetPort, marsRules)) {
        return false;
    }

    return true;
};

// Helper function to get port from component definition
const getPortFromComponent = (componentDef, connection, isSource) => {
    if (!componentDef.ports) return null;
    
    // Check in appropriate port array
    const portArrays = isSource ? 
        [componentDef.ports.outputs, componentDef.ports.bidirectional] :
        [componentDef.ports.inputs, componentDef.ports.bidirectional];
    
    for (const portArray of portArrays) {
        if (!portArray) continue;
        const port = portArray.find(p => p.id === connection.portId || 
            p.id === connection.portId.replace('-in', '').replace('-out', ''));
        if (port) return port;
    }
    
    return null;
};

// Validate component-specific connection restrictions
const validateComponentRestrictions = (sourceNode, targetNode, marsRules) => {
    const sourceType = sourceNode.data.componentType;
    const targetType = targetNode.data.componentType;
    
    // Check source restrictions
    const sourceRule = marsRules.componentRules[sourceType];
    if (sourceRule && sourceRule.type === 'thermal-only') {
        // HTSTR can only connect to other HTSTR components
        return targetType === 'HTSTR';
    }
    
    // Check target restrictions  
    const targetRule = marsRules.componentRules[targetType];
    if (targetRule && targetRule.type === 'source-only') {
        // TMDPVOL/TMDPJUN cannot be connection targets
        return false;
    }
    
    return true;
};

// Validate connection types (fluid vs thermal)
const validateConnectionTypes = (sourcePort, targetPort) => {
    const sourceType = sourcePort.connectionType || 'fluid';
    const targetType = targetPort.connectionType || 'fluid';
    
    // Connection types must match
    return sourceType === targetType;
};

// Validate MARS Face connection rules
const validateMarsFaceConnections = (sourcePort, targetPort, marsRules) => {
    // If ports don't have MARS codes, skip face validation
    if (!sourcePort.marsCode || !targetPort.marsCode) return true;
    
    const sourceFace = sourcePort.marsCode;
    const targetFace = targetPort.marsCode;
    
    // Primary flow rule: Face 2 (outlet) -> Face 1 (inlet)
    if (sourceFace === 2 && targetFace === 1) return true;
    
    // Crossflow rules: crossflow faces can connect to any face
    const crossflowFaces = marsRules.faceConnections.crossflow;
    if (crossflowFaces.includes(sourceFace) || crossflowFaces.includes(targetFace)) {
        return true;
    }
    
    // Bidirectional connections for crossflow ports
    if (crossflowFaces.includes(sourceFace) && crossflowFaces.includes(targetFace)) {
        return true;
    }
    
    return false;
};

// Port migration utilities for backward compatibility
export const migratePortIds = (nodeData) => {
    const portMapping = {
        'from': 'face1',
        'to': 'face2',
        // Add more mappings as needed
    };
    
    if (!nodeData.ports) return nodeData;
    
    // Update port IDs in node data
    const migratedData = { ...nodeData };
    // Implementation would depend on exact data structure
    
    return migratedData;
};

// Utility to get all available ports for a component
export const getAvailablePorts = (componentType, componentTypes) => {
    const componentDef = componentTypes[componentType];
    if (!componentDef || !componentDef.ports) return [];
    
    const ports = [];
    
    // Collect all input ports
    if (componentDef.ports.inputs) {
        ports.push(...componentDef.ports.inputs.map(p => ({ ...p, direction: 'input' })));
    }
    
    // Collect all output ports
    if (componentDef.ports.outputs) {
        ports.push(...componentDef.ports.outputs.map(p => ({ ...p, direction: 'output' })));
    }
    
    // Collect all bidirectional ports
    if (componentDef.ports.bidirectional) {
        ports.push(...componentDef.ports.bidirectional.map(p => ({ ...p, direction: 'bidirectional' })));
    }
    
    return ports;
};

// Utility to validate MARS Face numbering
export const validateMarsFaceAssignment = (componentType, ports) => {
    const marsStandard = {
        SNGLVOL: [1, 2, 3, 4, 5, 6],
        PIPE: [1, 2, 3, 4], // 일반적으로 4면
        TMDPVOL: [2], // 출구만
        SNGLJUN: [1, 2], // 입구, 출구
        HTSTR: [1, 2, 3, 4] // 열적 연결 4방향
    };
    
    const standardFaces = marsStandard[componentType];
    if (!standardFaces) return true; // Unknown component types pass
    
    const assignedFaces = ports.map(p => p.marsCode).filter(Boolean);
    return assignedFaces.every(face => standardFaces.includes(face));
};