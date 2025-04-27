import React from 'react';
import '../styles/Connection.css';

const Connection = ({ connection, startPos, endPos, isTemporary, onDelete }) => {
    // 직접 경로 계산
    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;

    const distance = Math.max(Math.abs(dx), Math.abs(dy) * 0.8, 100);
    const directionFactor = dx > 0 ? 0.5 : 0.7;
    const angleY = Math.atan2(dy, dx);
    const verticalFactor = Math.abs(angleY) > Math.PI / 3 ? 0.2 : 0;

    const cp1 = {
        x: startPos.x + distance * directionFactor,
        y: startPos.y + distance * verticalFactor * Math.sign(dy)
    };

    const cp2 = {
        x: endPos.x - distance * directionFactor,
        y: endPos.y - distance * verticalFactor * Math.sign(dy)
    };

    const path = `M ${startPos.x} ${startPos.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${endPos.x} ${endPos.y}`;
    console.log('path: ', path);
    const midpoint = {
        x: (startPos.x + endPos.x) / 2,
        y: (startPos.y + endPos.y) / 2 - 10
    };

    return (
        <g className={`connection ${isTemporary ? 'temporary' : ''}`}>
            <path
                d={path}
                stroke={isTemporary ? '#aaa' : '#4a8'}
                strokeWidth="2"
                fill="none"
                strokeDasharray={isTemporary ? "5,5" : "none"}
                markerEnd={!isTemporary ? `url(#arrowhead-${connection.id})` : ''}
            />

            {!isTemporary && (
                <>
                    <defs>
                        <marker
                            id={`arrowhead-${connection.id}`}
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                        >
                            <polygon points="0 0, 10 3.5, 0 7" fill="#4a8" />
                        </marker>
                    </defs>

                    {/* 클릭 영역 */}
                    <path
                        d={path}
                        stroke="transparent"
                        strokeWidth="10"
                        fill="none"
                        style={{ cursor: 'pointer' }}
                        onClick={() => onDelete && onDelete()}
                    />

                    {/* 삭제 버튼 */}
                    <foreignObject
                        x={midpoint.x - 15}
                        y={midpoint.y - 15}
                        width="30"
                        height="30"
                    >
                        <div
                            className="connection-delete-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete && onDelete();
                            }}
                        >
                            ×
                        </div>
                    </foreignObject>
                </>
            )}
        </g>
    );
};

export default Connection;
