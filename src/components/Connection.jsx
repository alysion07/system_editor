import React, { useMemo } from 'react';
import '../styles/Connection.css';

const Connection = ({ connection, startPos, endPos, isTemporary, onDelete }) => {
    // 연결선 경로 및 제어점 계산을 메모이제이션
    const { path, controlPoint1, controlPoint2, midpoint } = useMemo(() => {
        // 연결선의 방향과 길이 계산
        const dx = endPos.x - startPos.x;
        const dy = endPos.y - startPos.y;
        
        // 최소 거리 유지 및 방향에 따른 거리 보정
        const distance = Math.max(Math.abs(dx), Math.abs(dy) * 0.8, 100);
        
        // 방향에 따라 커브 조정 (오른쪽으로 향하면 완만하게, 왼쪽으로 향하면 더 급하게)
        const directionFactor = dx > 0 ? 0.5 : 0.7;
        
        // 수직 방향 각도 계산 (수직 연결선일 경우 더 자연스러운 곡선을 위해)
        const angleY = Math.atan2(dy, dx);
        const verticalFactor = Math.abs(angleY) > Math.PI/3 ? 0.2 : 0;
        
        // 제어점 계산
        const cp1 = {
            x: startPos.x + distance * directionFactor,
            y: startPos.y + distance * verticalFactor * Math.sign(dy)
        };

        const cp2 = {
            x: endPos.x - distance * directionFactor,
            y: endPos.y - distance * verticalFactor * Math.sign(dy)
        };

        // Path for the bezier curve
        const pathData = `M ${startPos.x} ${startPos.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${endPos.x} ${endPos.y}`;

        // Calculate middle point for the connection label
        const mid = {
            x: (startPos.x + endPos.x) / 2,
            y: (startPos.y + endPos.y) / 2 - 10
        };
        
        return { 
            path: pathData, 
            controlPoint1: cp1, 
            controlPoint2: cp2, 
            midpoint: mid 
        };
    }, [startPos.x, startPos.y, endPos.x, endPos.y]);

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
                    {/* Arrow head */}
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

                    {/* Clickable area for the connection */}
                    <path
                        d={path}
                        stroke="transparent"
                        strokeWidth="10"
                        fill="none"
                        style={{ cursor: 'pointer' }}
                        onClick={() => onDelete && onDelete()}
                    />

                    {/* Connection label */}
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

export default React.memo(Connection);