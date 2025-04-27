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

// Validate connection between nodes
export const isValidConnection = (source, target, nodes, componentTypes) => {
    // Can't connect to self
    if (source.nodeId === target.nodeId) return false;

    // Must connect output to input
    if (source.isInput === target.isInput) return false;

    // Get node objects
    const sourceNode = nodes.find(n => n.id === source.nodeId);
    const targetNode = nodes.find(n => n.id === target.nodeId);

    if (!sourceNode || !targetNode) return false;

    // Get components definitions
    const sourceCompDef = componentTypes[sourceNode.type];
    const targetCompDef = componentTypes[targetNode.type];

    if (!sourceCompDef || !targetCompDef) return false;

    // Ensure ports exist
    const sourcePorts = source.isInput ? sourceCompDef.ports.inputs : sourceCompDef.ports.outputs;
    const targetPorts = target.isInput ? targetCompDef.ports.inputs : targetCompDef.ports.outputs;

    const sourcePort = sourcePorts.find(p => p.id === source.portId);
    const targetPort = targetPorts.find(p => p.id === target.portId);

    return !!sourcePort && !!targetPort;
};
