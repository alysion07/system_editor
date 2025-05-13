import React, { useState, useEffect } from 'react';
import '../styles/TableEditor.css';

/**
 * 온도-값 쌍의 테이블을 편집하기 위한 컴포넌트
 * @param {Object} props
 * @param {Array} props.data - 테이블 데이터
 * @param {Function} props.onChange - 데이터 변경 콜백
 * @param {Object} props.config - 테이블 구성
 */
const TableEditor = ({
                         data = [],
                         onChange,
                         config = {}
                     }) => {
    // 기본 설정값과 사용자 정의 설정 병합
    const {
        xAxisLabel = '온도 (K)',
        yAxisLabel = '값',
        xAxisUnit = 'K',
        yAxisUnit = '',
        minRows = 2,
        maxRows = 100,
        sortByX = true,
        xMin = 0,
        chartType = 'line',
        decimalPlaces = 6,
        showChart = true
    } = config;

    // 차트에 필요한 참조
    const chartRef = React.useRef(null);

    // 로컬 상태
    const [localData, setLocalData] = useState([]);
    const [editingCell, setEditingCell] = useState(null);
    const [editingValue, setEditingValue] = useState('');
    const [dataModified, setDataModified] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importText, setImportText] = useState('');

    // 초기 데이터 로드 및 데이터 변경 시 처리
    useEffect(() => {
        // 데이터가 없는 경우 최소 행 추가
        if (data.length === 0) {
            const initialData = [];
            for (let i = 0; i < minRows; i++) {
                initialData.push({
                    id: Date.now() + i,
                    x: i * 100 + 300,
                    y: 0
                });
            }
            setLocalData(initialData);
            onChange(initialData);
        } else if (!dataModified) {
            // 외부에서 데이터가 변경된 경우에만 설정
            setLocalData(data);
        }
    }, [data, minRows, dataModified, onChange]);

    // 데이터 변경 시 차트 업데이트
    useEffect(() => {
        if (showChart) {
            drawChart();
        }
    }, [localData, showChart]);

    // 차트 그리기
    const drawChart = () => {
        if (!chartRef.current || localData.length === 0) return;

        const canvas = chartRef.current;
        const ctx = canvas.getContext('2d');

        // 캔버스 초기화
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;

        // 데이터 범위 계산
        const sortedData = [...localData].sort((a, b) => parseFloat(a.x) - parseFloat(b.x));
        const xValues = sortedData.map(item => parseFloat(item.x));
        const yValues = sortedData.map(item => parseFloat(item.y));

        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);

        // 축 그리기
        ctx.beginPath();
        ctx.strokeStyle = '#333';
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding); // x축
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(padding, padding); // y축
        ctx.stroke();

        // x축 레이블
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(xAxisLabel, width / 2, height - 10);

        // y축 레이블
        ctx.save();
        ctx.translate(10, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText(yAxisLabel, 0, 0);
        ctx.restore();

        // 눈금 그리기
        const xRange = xMax - xMin;
        const yRange = yMax - yMin || 1; // 0으로 나누기 방지

        // x축 눈금
        const xStep = xRange > 5 ? Math.ceil(xRange / 5) : xRange / 5;
        for (let i = 0; i <= 5; i++) {
            const x = xMin + i * xStep;
            const xPos = padding + (x - xMin) * (width - 2 * padding) / xRange;

            ctx.beginPath();
            ctx.moveTo(xPos, height - padding);
            ctx.lineTo(xPos, height - padding + 5);
            ctx.stroke();

            ctx.fillText(x.toFixed(1), xPos, height - padding + 8);
        }

        // y축 눈금
        const yStep = yRange > 5 ? Math.ceil(yRange / 5) : yRange / 5;
        for (let i = 0; i <= 5; i++) {
            const y = yMin + i * yStep;
            const yPos = height - padding - (y - yMin) * (height - 2 * padding) / yRange;

            ctx.beginPath();
            ctx.moveTo(padding, yPos);
            ctx.lineTo(padding - 5, yPos);
            ctx.stroke();

            ctx.textAlign = 'right';
            ctx.fillText(y.toFixed(1), padding - 8, yPos - 6);
        }

        // 데이터 포인트 그리기
        if (chartType === 'line') {
            ctx.beginPath();
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2;

            sortedData.forEach((point, index) => {
                const x = padding + (point.x - xMin) * (width - 2 * padding) / xRange;
                const y = height - padding - (point.y - yMin) * (height - 2 * padding) / yRange;

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();

            // 포인트 마커
            sortedData.forEach(point => {
                const x = padding + (point.x - xMin) * (width - 2 * padding) / xRange;
                const y = height - padding - (point.y - yMin) * (height - 2 * padding) / yRange;

                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#3498db';
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.stroke();
            });
        } else if (chartType === 'bar') {
            const barWidth = (width - 2 * padding) / sortedData.length * 0.8;

            sortedData.forEach((point, index) => {
                const x = padding + (point.x - xMin) * (width - 2 * padding) / xRange;
                const y = height - padding - (point.y - yMin) * (height - 2 * padding) / yRange;

                ctx.fillStyle = '#3498db';
                ctx.fillRect(x - barWidth / 2, y, barWidth, height - padding - y);
            });
        }
    };

    // 행 추가 핸들러
    const handleAddRow = () => {
        if (localData.length >= maxRows) return;

        // 마지막 행에서 값 추정
        let newX = 300;
        let newY = 0;

        if (localData.length > 0) {
            const sortedData = [...localData].sort((a, b) => parseFloat(a.x) - parseFloat(b.x));
            const lastRow = sortedData[sortedData.length - 1];
            const increment = sortedData.length > 1
                ? parseFloat(lastRow.x) - parseFloat(sortedData[sortedData.length - 2].x)
                : 100;

            newX = parseFloat(lastRow.x) + increment;
            newY = parseFloat(lastRow.y);
        }

        const newRow = { id: Date.now(), x: newX, y: newY };
        const newData = [...localData, newRow];

        if (sortByX) {
            newData.sort((a, b) => parseFloat(a.x) - parseFloat(b.x));
        }

        setLocalData(newData);
        setDataModified(true);
        onChange(newData);
    };

    // 행 삭제 핸들러
    const handleDeleteRow = (id) => {
        if (localData.length <= minRows) return;

        const newData = localData.filter(row => row.id !== id);
        setLocalData(newData);
        setDataModified(true);
        onChange(newData);
    };

    // 셀 클릭 핸들러 (편집 모드 시작)
    const handleCellClick = (id, field, value) => {
        setEditingCell({ id, field });
        setEditingValue(value);
    };

    // 셀 값 변경 핸들러
    const handleCellChange = (e) => {
        setEditingValue(e.target.value);
    };

    // 셀 편집 완료 핸들러
    const handleCellBlur = () => {
        if (!editingCell) return;

        const { id, field } = editingCell;
        let value = editingValue;

        // 숫자 필드일 경우 형 변환
        if (field === 'x' || field === 'y') {
            value = parseFloat(value) || 0;

            // x값 최소값 제한
            if (field === 'x' && value < xMin) {
                value = xMin;
            }
        }

        const newData = localData.map(row => {
            if (row.id === id) {
                return { ...row, [field]: value };
            }
            return row;
        });

        if (sortByX && field === 'x') {
            newData.sort((a, b) => parseFloat(a.x) - parseFloat(b.x));
        }

        setLocalData(newData);
        setEditingCell(null);
        setDataModified(true);
        onChange(newData);
    };

    // 키보드 이벤트 핸들러
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCellBlur();
        } else if (e.key === 'Escape') {
            setEditingCell(null);
        }
    };

    // 데이터 가져오기 핸들러
    const handleImport = () => {
        try {
            // 텍스트를 행으로 분할
            const lines = importText.trim().split('\n');
            const importedData = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                // 탭, 쉼표, 공백으로 분할
                const parts = line.split(/[\t,\s]+/);
                if (parts.length >= 2) {
                    const x = parseFloat(parts[0]);
                    const y = parseFloat(parts[1]);

                    if (!isNaN(x) && !isNaN(y)) {
                        importedData.push({
                            id: Date.now() + i,
                            x,
                            y
                        });
                    }
                }
            }

            if (importedData.length > 0) {
                // 정렬하고 중복 제거
                let newData = importedData;
                if (sortByX) {
                    newData.sort((a, b) => parseFloat(a.x) - parseFloat(b.x));

                    // x값이 중복된 경우 마지막 항목만 유지
                    const uniqueData = [];
                    const xValues = new Set();

                    for (const item of newData) {
                        if (!xValues.has(item.x)) {
                            xValues.add(item.x);
                            uniqueData.push(item);
                        } else {
                            // 기존 항목 제거하고 새 항목 추가
                            const index = uniqueData.findIndex(row => row.x === item.x);
                            if (index !== -1) {
                                uniqueData[index] = item;
                            }
                        }
                    }

                    newData = uniqueData;
                }

                setLocalData(newData);
                setDataModified(true);
                onChange(newData);
                setShowImportModal(false);
            } else {
                alert('유효한 데이터를 찾을 수 없습니다. 각 행에는 숫자 쌍이 있어야 합니다.');
            }
        } catch (error) {
            alert('데이터 가져오기 중 오류가 발생했습니다: ' + error.message);
        }
    };

    // 데이터 내보내기 핸들러
    const handleExport = () => {
        const sortedData = [...localData].sort((a, b) => parseFloat(a.x) - parseFloat(b.x));
        let output = '';

        sortedData.forEach(row => {
            output += `${row.x}\t${row.y}\n`;
        });

        // 클립보드에 복사
        navigator.clipboard.writeText(output)
            .then(() => {
                alert('데이터가 클립보드에 복사되었습니다.');
            })
            .catch(() => {
                // 클립보드 API를 사용할 수 없는 경우 다운로드 제공
                const blob = new Blob([output], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'table_data.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
    };

    // 자동 보간 핸들러
    const handleInterpolate = () => {
        if (localData.length < 2) {
            alert('보간하려면 최소 2개의 데이터 포인트가 필요합니다.');
            return;
        }

        const sortedData = [...localData].sort((a, b) => parseFloat(a.x) - parseFloat(b.x));
        const numPoints = 10; // 추가할 포인트 수
        const newData = [...sortedData];

        // 각 인접 포인트 사이에 보간 포인트 추가
        for (let i = 0; i < sortedData.length - 1; i++) {
            const start = sortedData[i];
            const end = sortedData[i + 1];

            const xDiff = parseFloat(end.x) - parseFloat(start.x);
            const yDiff = parseFloat(end.y) - parseFloat(start.y);

            // 너무 가까운 포인트는 건너뛰기
            if (xDiff < 0.001) continue;

            for (let j = 1; j < numPoints; j++) {
                const fraction = j / numPoints;
                const interpX = parseFloat(start.x) + xDiff * fraction;
                const interpY = parseFloat(start.y) + yDiff * fraction;

                newData.push({
                    id: Date.now() + i * numPoints + j,
                    x: interpX,
                    y: interpY
                });
            }
        }

        newData.sort((a, b) => parseFloat(a.x) - parseFloat(b.x));
        setLocalData(newData);
        setDataModified(true);
        onChange(newData);
    };

    // 변환된 데이터 가져오기 (정렬됨)
    const getSortedData = () => {
        return [...localData].sort((a, b) => parseFloat(a.x) - parseFloat(b.x));
    };

    return (
        <div className="table-editor">
            <div className="table-toolbar">
                <button
                    className="btn add-button"
                    onClick={handleAddRow}
                    disabled={localData.length >= maxRows}
                >
                    행 추가
                </button>
                <button
                    className="btn import-button"
                    onClick={() => setShowImportModal(true)}
                >
                    데이터 가져오기
                </button>
                <button
                    className="btn export-button"
                    onClick={handleExport}
                    disabled={localData.length === 0}
                >
                    데이터 내보내기
                </button>
                <button
                    className="btn interpolate-button"
                    onClick={handleInterpolate}
                    disabled={localData.length < 2}
                >
                    데이터 보간
                </button>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>#{xAxisLabel}</th>
                        <th>{yAxisLabel}</th>
                        <th>작업</th>
                    </tr>
                    </thead>
                    <tbody>
                    {getSortedData().map((row, index) => (
                        <tr key={row.id}>
                            <td>
                                {editingCell?.id === row.id && editingCell?.field === 'x' ? (
                                    <input
                                        type="number"
                                        className="cell-input"
                                        value={editingValue}
                                        onChange={handleCellChange}
                                        onBlur={handleCellBlur}
                                        onKeyDown={handleKeyDown}
                                        autoFocus
                                        step="any"
                                        min={xMin}
                                    />
                                ) : (
                                    <div
                                        className="cell-value"
                                        onClick={() => handleCellClick(row.id, 'x', row.x)}
                                    >
                                        {parseFloat(row.x).toFixed(decimalPlaces)}
                                        <span className="unit">{xAxisUnit}</span>
                                    </div>
                                )}
                            </td>
                            <td>
                                {editingCell?.id === row.id && editingCell?.field === 'y' ? (
                                    <input
                                        type="number"
                                        className="cell-input"
                                        value={editingValue}
                                        onChange={handleCellChange}
                                        onBlur={handleCellBlur}
                                        onKeyDown={handleKeyDown}
                                        autoFocus
                                        step="any"
                                    />
                                ) : (
                                    <div
                                        className="cell-value"
                                        onClick={() => handleCellClick(row.id, 'y', row.y)}
                                    >
                                        {parseFloat(row.y).toFixed(decimalPlaces)}
                                        <span className="unit">{yAxisUnit}</span>
                                    </div>
                                )}
                            </td>
                            <td>
                                <button
                                    className="btn delete-button"
                                    onClick={() => handleDeleteRow(row.id)}
                                    disabled={localData.length <= minRows}
                                >
                                    삭제
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {showChart && (
                <div className="chart-container">
                    <canvas
                        ref={chartRef}
                        width={500}
                        height={300}
                        className="data-chart"
                    />
                </div>
            )}

            {showImportModal && (
                <div className="modal-overlay">
                    <div className="import-modal">
                        <h3>데이터 가져오기</h3>
                        <p className="modal-description">
                            각 행에 x, y 쌍을 입력하세요. 쉼표, 탭 또는 공백으로 구분할 수 있습니다.
                            예: 300 16.2
                        </p>
                        <textarea
                            className="import-textarea"
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            placeholder="300 16.2&#10;350 18.5&#10;400 20.1"
                            rows={10}
                        />
                        <div className="modal-buttons">
                            <button
                                className="btn import-confirm"
                                onClick={handleImport}
                            >
                                가져오기
                            </button>
                            <button
                                className="btn cancel-button"
                                onClick={() => setShowImportModal(false)}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableEditor;