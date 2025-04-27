import React, { useEffect, useState, useRef } from 'react';
/**
 * 로그 출력 컴포넌트: 한 줄씩 전달된 텍스트를 화면에 표시
 */
export function LiveLogViewer({ incomingLine }) {
    const [logs, setLogs] = useState([]);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!incomingLine) return;
        setLogs(prev => [...prev, incomingLine]);
    }, [incomingLine]);

    useEffect(() => {
        // 새 로그가 추가될 때마다 스크롤을 맨 밑으로 이동
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div
            ref={containerRef}
            style={{
                height: '200px',
                overflowY: 'auto',
                background: '#f9f9f9',
                padding: '8px',
                border: '1px solid #ccc',
                fontFamily: 'monospace',
                fontSize: '12px'
            }}
        >
            {logs.map((line, idx) => (
                <div key={idx}>{line}</div>
            ))}
        </div>
    );
}
