// File: src/reducers/editorReducer.js

import { componentTypes, componentCategories } from '../components/ComponentsType.jsx';
import { updateNodesWithConnectionData } from '../utils/connectionHelper.jsx';

// Create initial state for editor
export const getInitialState = () => ({
    past: [],
    present: {
        projectName: 'New Reactor Design',
        nodes: [],
        connections: [],
        selectedNodeId: null,
        componentTypes,
        componentCategories
    },
    future: []
});

// Helper to create a new history entry
const createHistoryEntry = (state) => ({
    past: [...state.past, state.present],
    present: { ...state.present }, // create independent 'present' object
    future: []
});

// Reducer function for editor state
export const reducer = (state, action) => {
    // Destructure state into past, present, and future
    const { past, present, future } = state;

    switch (action.type) {
        case 'ADD_NODE': {
            const newState = createHistoryEntry(state);
            newState.present.nodes = [...present.nodes, action.payload];
            newState.present.selectedNodeId = action.payload.id;
            return newState;
        }

        case 'MOVE_NODE': {
            const { id, position } = action.payload;
            const nodeIndex = present.nodes.findIndex(node => node.id === id);

            if (nodeIndex === -1) return state;

            // 기존 노드 복사 후 위치만 업데이트
            const newState = createHistoryEntry(state);

            const updatedNode = {
                ...present.nodes[nodeIndex],
                position: {
                    x: position.x,
                    y: position.y
                }
            };

            newState.present.nodes = [
                ...present.nodes.slice(0, nodeIndex),
                updatedNode,
                ...present.nodes.slice(nodeIndex + 1)
            ];

            return  newState;
        }

        case 'SELECT_NODE': {
            return {
                ...state,
                present: {
                    ...present,
                    selectedNodeId: action.payload
                }
            };
        }

        case 'UPDATE_NODE_PROPERTY': {
            const { id, property, value } = action.payload;
            const nodeIndex = present.nodes.findIndex(node => node.id === id);

            if (nodeIndex === -1) return state;

            const newState = createHistoryEntry(state);
            const updatedNode = {
                ...present.nodes[nodeIndex],
                data: {
                    ...present.nodes[nodeIndex].data,
                    [property]: value
                }
            };

            newState.present.nodes = [
                ...present.nodes.slice(0, nodeIndex),
                updatedNode,
                ...present.nodes.slice(nodeIndex + 1)
            ];

            return newState;
        }

        case 'ADD_CONNECTION': {
            const newState = createHistoryEntry(state);
            
            // Check if connection already exists
            const existingConnection = present.connections.find(
                conn =>
                    conn.sourceId === action.payload.sourceId &&
                    conn.targetId === action.payload.targetId &&
                    conn.sourcePortId === action.payload.sourcePortId &&
                    conn.targetPortId === action.payload.targetPortId
            );

            if (existingConnection) return state;

            // Add the new connection
            newState.present.connections = [...present.connections, action.payload];

            // Update SNGLJUN nodes' connection properties if needed
            // Check if either the source or target node is a SNGLJUN
            const sourceNode = present.nodes.find(node => node.id === action.payload.sourceId);
            const targetNode = present.nodes.find(node => node.id === action.payload.targetId);

            // Source node is SNGLJUN
            if (sourceNode && sourceNode.type === 'SNGLJUN') {
                const nodeIndex = present.nodes.findIndex(node => node.id === sourceNode.id);
                const updatedData = { ...sourceNode.data } || {};

                // Update fromConnection or toConnection based on the port
                if (action.payload.sourcePortId === 'from') {
                    // The format depends on your specific requirements, this is an example
                    updatedData.fromConnection = `${targetNode.compNumber}${action.payload.targetPortId === 'out' ? '010000' : '000000'}`;
                } else if (action.payload.sourcePortId === 'to') {
                    updatedData.toConnection = `${targetNode.compNumber}${action.payload.targetPortId === 'out' ? '010000' : '000000'}`;
                }

                // Update the node with new connection data
                const updatedNode = {
                    ...sourceNode,
                    data: updatedData
                };

                newState.present.nodes = [
                    ...present.nodes.slice(0, nodeIndex),
                    updatedNode,
                    ...present.nodes.slice(nodeIndex + 1)
                ];
            }

            // Target node is SNGLJUN
            if (targetNode && targetNode.type === 'SNGLJUN') {
                const nodeIndex = present.nodes.findIndex(node => node.id === targetNode.id);
                const updatedData = { ...targetNode.data } || {};

                // Update fromConnection or toConnection based on the port
                if (action.payload.targetPortId === 'from') {
                    updatedData.fromConnection = `${sourceNode.compNumber}${action.payload.sourcePortId === 'out' ? '010000' : '000000'}`;
                } else if (action.payload.targetPortId === 'to') {
                    updatedData.toConnection = `${sourceNode.compNumber}${action.payload.sourcePortId === 'out' ? '010000' : '000000'}`;
                }

                // Update the node with new connection data
                const updatedNode = {
                    ...targetNode,
                    data: updatedData
                };

                // If we already updated the source node and it's different from the target
                if (sourceNode && sourceNode.type === 'SNGLJUN' && sourceNode.id !== targetNode.id) {
                    const targetNodeIndex = newState.present.nodes.findIndex(node => node.id === targetNode.id);
                    newState.present.nodes = [
                        ...newState.present.nodes.slice(0, targetNodeIndex),
                        updatedNode,
                        ...newState.present.nodes.slice(targetNodeIndex + 1)
                    ];
                } else {
                    newState.present.nodes = [
                        ...present.nodes.slice(0, nodeIndex),
                        updatedNode,
                        ...present.nodes.slice(nodeIndex + 1)
                    ];
                }
            }

            return newState;
        }

        case 'DELETE_NODE': {
            const nodeId = action.payload;
            const newState = createHistoryEntry(state);

            // Remove node
            newState.present.nodes = present.nodes.filter(node => node.id !== nodeId);

            // Remove all connections to/from this node
            newState.present.connections = present.connections.filter(
                conn => conn.sourceId !== nodeId && conn.targetId !== nodeId
            );

            // Unselect if this node was selected
            if (present.selectedNodeId === nodeId) {
                newState.present.selectedNodeId = null;
            }

            return newState;
        }

        case 'DELETE_CONNECTION': {
            const connectionId = action.payload;
            const newState = createHistoryEntry(state);
            
            // Find the connection to be deleted
            const connectionToDelete = present.connections.find(conn => conn.id === connectionId);
            
            // Remove the connection
            newState.present.connections = present.connections.filter(
                conn => conn.id !== connectionId
            );
            
            // If the connection involved a SNGLJUN node, update its connection properties
            if (connectionToDelete) {
                const sourceNode = present.nodes.find(node => node.id === connectionToDelete.sourceId);
                const targetNode = present.nodes.find(node => node.id === connectionToDelete.targetId);
                
                // Update source node if it's a SNGLJUN
                if (sourceNode && sourceNode.type === 'SNGLJUN') {
                    const nodeIndex = present.nodes.findIndex(node => node.id === sourceNode.id);
                    const updatedData = { ...sourceNode.data };
                    
                    // Clear the appropriate connection property
                    if (connectionToDelete.sourcePortId === 'from') {
                        delete updatedData.fromConnection;
                    } else if (connectionToDelete.sourcePortId === 'to') {
                        delete updatedData.toConnection;
                    }
                    
                    // Update the node
                    const updatedNode = {
                        ...sourceNode,
                        data: updatedData
                    };
                    
                    newState.present.nodes = [
                        ...present.nodes.slice(0, nodeIndex),
                        updatedNode,
                        ...present.nodes.slice(nodeIndex + 1)
                    ];
                }
                
                // Update target node if it's a SNGLJUN
                if (targetNode && targetNode.type === 'SNGLJUN') {
                    // Get the latest nodes array in case we already modified it above
                    const latestNodes = newState.present.nodes;
                    const nodeIndex = latestNodes.findIndex(node => node.id === targetNode.id);
                    const updatedData = { ...targetNode.data };
                    
                    // Clear the appropriate connection property
                    if (connectionToDelete.targetPortId === 'from') {
                        delete updatedData.fromConnection;
                    } else if (connectionToDelete.targetPortId === 'to') {
                        delete updatedData.toConnection;
                    }
                    
                    // Update the node
                    const updatedNode = {
                        ...targetNode,
                        data: updatedData
                    };
                    
                    newState.present.nodes = [
                        ...latestNodes.slice(0, nodeIndex),
                        updatedNode,
                        ...latestNodes.slice(nodeIndex + 1)
                    ];
                }
            }
            
            return newState;
        }

        case 'SET_PROJECT_NAME': {
            return {
                ...state,
                present: {
                    ...present,
                    projectName: action.payload
                }
            };
        }

        case 'LOAD_PROJECT': {
            return {
                past: [],
                present: {
                    ...present,
                    projectName: action.payload.projectName || 'Imported Project',
                    nodes: action.payload.nodes || [],
                    connections: action.payload.connections || [],
                    selectedNodeId: null
                },
                future: []
            };
        }

        case 'UNDO': {
            if (past.length === 0) return state;

            // 마지막 상태 가져오기
            const previous = past[past.length - 1];

            return {
                //방금 현재 상태로 가져온 항목을 제외한 나머지 과거 상태들만 유지합니다.
                //array.slice(시작인덱스, 종료인덱스)
                past: past.slice(0, past.length - 1),
                //현재 상태를 방금 과거에서 가져온 상태로 교체합니다.
                present: previous,
                //기존 현재 상태를 미래 배열의 맨 앞에 추가하고 기존 미래 상태들을 그 뒤에 배치합니다.
                future: [present, ...future]
            };
        }

        case 'REDO': {
            if (future.length === 0) return state;

            const next = future[0];

            return {
                past: [...past, present],
                present: next,
                future: future.slice(1)
            };
        }

        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
};