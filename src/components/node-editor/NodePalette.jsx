import React from 'react';
import './styles/NodePalette.css';

let id = 0;
const getId = () => `node_${id++}`;


const NodePalette = ({componentsType}) => {
    const nodeTypes = {};
    Object.values(componentsType).forEach(component => {
        if (!nodeTypes[component.category]) {
            nodeTypes[component.category] = [];
        }
        nodeTypes[component.category].push(component);
    });

    const onDragStart = (event, nodeType) => {
        // TODO - nodeType 적용
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
        console.log('onDragStart', nodeType);
    };

    return (
        <aside className="node-palette">
            <div className="palette-header">Components</div>
            <div className="palette-nodes">
                {Object.entries(nodeTypes).map(([category, items]) => (
                    <div key={category} className="palette-category">
                        <h4 className="category-title">{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                        <div className="palette-items">
                            {items.map(node => (
                                <div
                                    key={`${node.type}-${getId()}`}
                                    className="palette-node"
                                    draggable
                                    onDragStart={(event) => onDragStart(event, node.type)}
                                >
                                    {node.label}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default NodePalette;