import React, { useMemo } from 'react';
import Connection from './Connection';

// 단일 연결선을 렌더링하는 컴포넌트
const ConnectionRenderer = ({ 
    connection, 
    sourceNode, 
    targetNode, 
    getPortPosition, 
    onDeleteConnection, 
    currentScale 
}) => {
    // 포트 위치 계산에 useMemo 사용 (이제 컴포넌트 최상위 레벨에서 사용)
    const { startPos, endPos } = useMemo(() => {
        const start = getPortPosition(sourceNode, connection.sourcePortId, false);
        const end = getPortPosition(targetNode, connection.targetPortId, true);
        return { startPos: start, endPos: end };
    }, [
        sourceNode, 
        targetNode, 
        connection.sourcePortId, 
        connection.targetPortId,
        getPortPosition,
        // 스케일이 변경될 때도 재계산
        currentScale,
        // 노드 위치가 변경되면 재계산
        sourceNode.position.x,
        sourceNode.position.y,
        targetNode.position.x,
        targetNode.position.y
    ]);

    return (
        <Connection
            key={connection.id}
            connection={connection}
            startPos={startPos}
            endPos={endPos}
            onDelete={() => onDeleteConnection(connection.id)}
        />
    );
};

// 불필요한 리렌더링 방지를 위해 React.memo 적용
export default React.memo(ConnectionRenderer);
