// TreeView.jsx
import React, { useState } from 'react';

import './TreeView.css';

const TreeNode = ({ name, node, onFileClick, path = '' }) => {
    const [expanded, setExpanded] = useState(false);
    const fullPath = path ? `${path}/${name}` : name;
    const isFile = node === '__file__';

    if (isFile) {
        return (
            <div className="tree-node" onClick={() => onFileClick(fullPath)}>
                <span className="tree-spacer" /> {/* 빈 자리 맞추기 */}
                <span className="tree-icon">📄</span>
                {name}
            </div>
        );
    }

    return (
        <div className="tree-node-wrapper">
            <div className="tree-node" onClick={() => setExpanded(!expanded)}>
                <span className="tree-toggle">
                    {expanded ? <img src="/keyboard_arrow_down.svg" alt="arrow" /> : <img src="/keyboard_arrow_right.svg" alt="arrow" />}
                </span>
                <span className="tree-icon">📁</span>
                {name}
            </div>
            {expanded && (
                <div className="tree-children">
                    {Object.entries(node).map(([childName, childNode]) => (
                        <TreeNode
                            key={childName}
                            name={childName}
                            node={childNode}
                            onFileClick={onFileClick}
                            path={fullPath}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


const MinioTreeView = ({ treeData, onFileClick }) => {
    return (
        <div className="tree-view">
            {treeData
                ? Object.entries(treeData).map(([name, node]) => (
                    <TreeNode key={name} name={name} node={node} onFileClick={onFileClick} />
                ))
                : <p>선택된 프로젝트 없음</p>
            }
        </div>
    );
};

export default MinioTreeView;
