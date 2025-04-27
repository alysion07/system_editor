// src/utils/connectionHelper.jsx
/**
 * Helper functions for managing connections between nodes
 */

/**
 * Updates a SNGLJUN node's connection properties based on established connections
 * @param {Array} nodes - The current nodes in the design
 * @param {Array} connections - The current connections in the design
 * @returns {Array} - Updated nodes with connection properties set
 */
export const updateNodesWithConnectionData = (nodes, connections) => {
    // Create a copy of the nodes array to avoid direct state mutation
    const updatedNodes = [...nodes];
    
    // Loop through all nodes looking for SNGLJUN components
    updatedNodes.forEach(node => {
        if (node.type === 'SNGLJUN') {
            // Find all connections where this node is the source or target
            const nodeConnections = connections.filter(conn => 
                conn.sourceId === node.id || conn.targetId === node.id
            );
            
            // Initialize connection data object if it doesn't exist
            if (!node.data) {
                node.data = {};
            }
            
            // Process each connection to determine fromConnection and toConnection
            nodeConnections.forEach(conn => {
                // If this node is the source of the connection and the port is 'from'
                if (conn.sourceId === node.id && conn.sourcePortId === 'from') {
                    // The target node becomes the fromConnection
                    const targetNode = nodes.find(n => n.id === conn.targetId);
                    if (targetNode) {
                        // Format: Component Number + Connection Type (e.g., "110000000" for inlet)
                        node.data.fromConnection = formatConnectionCode(targetNode, conn.targetPortId);
                    }
                }
                // If this node is the source of the connection and the port is 'to'
                else if (conn.sourceId === node.id && conn.sourcePortId === 'to') {
                    // The target node becomes the toConnection
                    const targetNode = nodes.find(n => n.id === conn.targetId);
                    if (targetNode) {
                        node.data.toConnection = formatConnectionCode(targetNode, conn.targetPortId);
                    }
                }
                // If this node is the target of the connection and the port is 'from'
                else if (conn.targetId === node.id && conn.targetPortId === 'from') {
                    // The source node becomes the fromConnection
                    const sourceNode = nodes.find(n => n.id === conn.sourceId);
                    if (sourceNode) {
                        node.data.fromConnection = formatConnectionCode(sourceNode, conn.sourcePortId);
                    }
                }
                // If this node is the target of the connection and the port is 'to'
                else if (conn.targetId === node.id && conn.targetPortId === 'to') {
                    // The source node becomes the toConnection
                    const sourceNode = nodes.find(n => n.id === conn.sourceId);
                    if (sourceNode) {
                        node.data.toConnection = formatConnectionCode(sourceNode, conn.sourcePortId);
                    }
                }
            });
        }
    });
    
    return updatedNodes;
};

/**
 * Formats a connection code based on the connected node and port
 * @param {Object} node - The connected node
 * @param {String} portId - The connected port ID
 * @returns {String} - Formatted connection code
 */
const formatConnectionCode = (node, portId) => {
    // Extract component number from the node.id
    // Assuming node.id is in the format "component-XXX" where XXX is the component number
    const componentNumber = node.id.replace(/\D/g, '').padStart(3, '0');
    
    // Set connection format based on the node type and port
    // Format: ccc000000 for inlet, ccc010000 for outlet
    // This is based on the expected format mentioned in the SNGLJUN properties
    let connectionSuffix = '000000'; // Default inlet format
    
    // Determine if this is an inlet or outlet connection based on port ID
    if (portId === 'out') {
        connectionSuffix = '010000'; // Outlet format
    }
    
    return `${componentNumber}${connectionSuffix}`;
};
