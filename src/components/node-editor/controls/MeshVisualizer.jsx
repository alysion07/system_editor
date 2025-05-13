import React, { useRef, useEffect, useState } from 'react';
import '../styles/MeshVisualizer.css';

/**
 * 열구조체의 메시 구조를 시각화하는 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.meshData - 메시 데이터 배열
 * @param {string} props.leftCoordinate - 좌측 경계 좌표
 * @param {Array} props.compositions - 구성 번호와 재질 정보 매핑
 * @param {Function} props.onChange - 메시 데이터 변경 콜백
 */
const MeshVisualizer = ({
                            meshData = [],
                            leftCoordinate = 0,
                            compositions = [],
                            onChange
                        }) => {
    const canvasRef = useRef(null);
    const [activeRegion, setActiveRegion] = useState(null);
    const [dragStartX, setDragStartX] = useState(null);
    const [showCompositionSelector, setShowCompositionSelector] = useState(false);
    const [selectorPosition, setSelectorPosition] = useState({ x: 0, y: 0 });
    const [selectedRegion, setSelectedRegion] = useState(null);

    // 메시 데이터 변경이 있을 때마다 캔버스 다시 그리기
    useEffect(() => {
        if (canvasRef.current) {
            drawMeshVisualization();
        }
    }, [meshData, leftCoordinate, activeRegion]);

    // 캔버스에 메시 시각화 그리기
    const drawMeshVisualization = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // 캔버스 초기화
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 변환계수 계산 (데이터 좌표에서 캔버스 픽셀로)
        const height = canvas.height;
        const width = canvas.width;
        const padding = 40;
        const effectiveWidth = width - 2 * padding;

        // 메시 범위 계산
        const rightmostCoord = calculateRightmostCoordinate();
        const totalRange = rightmostCoord - leftCoordinate;

        // X축 그리기
        ctx.beginPath();
        ctx.moveTo(padding, height / 2);
        ctx.lineTo(width - padding, height / 2);
        ctx.stroke();

        // 메시 영역 그리기
        let currentX = leftCoordinate;
        let pixelX = padding;

        meshData.forEach((region, index) => {
            const rightCoord = region.rightCoord;
            const nextX = padding + ((rightCoord - leftCoordinate) / totalRange) * effectiveWidth;
            const width = nextX - pixelX;

            // 영역 색상 결정
            const color = getCompositionColor(region.composition);

            // 영역 그리기
            ctx.fillStyle = index === activeRegion ? lightenColor(color, 20) : color;
            ctx.fillRect(pixelX, height / 2 - 30, width, 60);

            // 테두리 그리기
            ctx.strokeStyle = '#000';
            ctx.strokeRect(pixelX, height / 2 - 30, width, 60);

            // 구성 번호 표시
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.fillText(`${region.composition}`, pixelX + width/2, height / 2 - 10);

            // 간격 정보 표시
            const regionWidth = rightCoord - currentX;
            ctx.fillText(`${regionWidth.toFixed(4)}m`, pixelX + width/2, height / 2 + 40);

            // 다음 영역을 위한 위치 업데이트
            currentX = rightCoord;
            pixelX = nextX;
        });

        // 좌표값 표시
        ctx.textAlign = 'center';
        ctx.fillText(leftCoordinate.toFixed(4), padding, height - 10);
        ctx.fillText(rightmostCoord.toFixed(4), width - padding, height - 10);
    };

    // 가장 오른쪽 좌표 계산
    const calculateRightmostCoordinate = () => {
        if (meshData.length === 0) return leftCoordinate + 0.01;
        return meshData[meshData.length - 1].rightCoord;
    };

    // 구성 번호에 따른 색상 반환
    const getCompositionColor = (compositionId) => {
        const colors = {
            '1': '#FFD700', // 지르코늄: 금색
            '2': '#B0E0E6', // 갭: 연한 청색
            '3': '#A0522D', // UO2: 갈색
            '4': '#C0C0C0', // 스테인리스 스틸: 은색
            '5': '#708090'  // 탄소강: 회색
        };

        return colors[compositionId] || '#E0E0E0';
    };

    // 색상 밝게 하기 (활성 영역용)
    const lightenColor = (color, percent) => {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;

        return `#${(1 << 24 | (R < 255 ? R : 255) << 16 | (G < 255 ? G : 255) << 8 | (B < 255 ? B : 255)).toString(16).slice(1)}`;
    };

    // 마우스 클릭 이벤트 핸들러 (드래그 시작 또는 구성 번호 변경)
    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 클릭한 위치의 영역 찾기
        const region = findRegionAtPosition(x, y);

        if (region !== -1) {
            if (y >= canvas.height / 2 - 30 && y <= canvas.height / 2 + 10) {
                // 구성 번호 영역 클릭 - 구성 선택기 표시
                setSelectedRegion(region);
                setSelectorPosition({
                    x: e.clientX,
                    y: e.clientY
                });
                setShowCompositionSelector(true);
            } else {
                // 다른 영역 클릭 - 드래그 시작
                setActiveRegion(region);
                setDragStartX(x);
                setShowCompositionSelector(false);
            }
        } else {
            setShowCompositionSelector(false);
        }
    };

    // 마우스 이동 이벤트 핸들러 (드래그 중)
    const handleMouseMove = (e) => {
        if (activeRegion === null || dragStartX === null) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const deltaX = x - dragStartX;

        // 픽셀 변화량을 실제 좌표 변화량으로 변환
        const effectiveWidth = canvas.width - 80;
        const totalRange = calculateRightmostCoordinate() - leftCoordinate;
        const coordDelta = (deltaX / effectiveWidth) * totalRange;

        if (Math.abs(coordDelta) > 0.0001) {
            // 메시 데이터 업데이트
            const newMeshData = [...meshData];

            // 마지막 영역인 경우 항상 오른쪽으로 이동 가능
            if (activeRegion === meshData.length - 1) {
                const newRightCoord = Math.max(
                    newMeshData[activeRegion - 1]?.rightCoord + 0.001 || leftCoordinate + 0.001,
                    newMeshData[activeRegion].rightCoord + coordDelta
                );

                newMeshData[activeRegion] = {
                    ...newMeshData[activeRegion],
                    rightCoord: newRightCoord
                };
            }
            // 첫 번째 영역이 아닌 경우 이전 영역 이후로만 이동 가능
            else if (activeRegion > 0) {
                const minCoord = newMeshData[activeRegion - 1].rightCoord + 0.001;
                const maxCoord = activeRegion < newMeshData.length - 1
                    ? newMeshData[activeRegion + 1].rightCoord - 0.001
                    : totalRange + leftCoordinate;

                const newRightCoord = Math.max(
                    minCoord,
                    Math.min(
                        maxCoord,
                        newMeshData[activeRegion].rightCoord + coordDelta
                    )
                );

                newMeshData[activeRegion] = {
                    ...newMeshData[activeRegion],
                    rightCoord: newRightCoord
                };
            }
            // 첫 번째 영역은 leftCoordinate보다 커야 함
            else {
                const minCoord = leftCoordinate + 0.001;
                const maxCoord = newMeshData[activeRegion + 1]?.rightCoord - 0.001 || totalRange + leftCoordinate;

                const newRightCoord = Math.max(
                    minCoord,
                    Math.min(
                        maxCoord,
                        newMeshData[activeRegion].rightCoord + coordDelta
                    )
                );

                newMeshData[activeRegion] = {
                    ...newMeshData[activeRegion],
                    rightCoord: newRightCoord
                };
            }

            // 부모에게 변경 알림
            onChange(newMeshData);
            setDragStartX(x);
        }
    };

    // 마우스 업 이벤트 핸들러 (드래그 종료)
    const handleMouseUp = () => {
        setActiveRegion(null);
        setDragStartX(null);
    };

    // 클릭 위치의 영역 인덱스 찾기
    const findRegionAtPosition = (x, y) => {
        const canvas = canvasRef.current;
        if (!canvas) return -1;

        // 클릭이 메시 영역 내에 있는지 확인
        if (y < canvas.height / 2 - 30 || y > canvas.height / 2 + 30) {
            return -1;
        }

        const padding = 40;
        const effectiveWidth = canvas.width - 2 * padding;
        const totalRange = calculateRightmostCoordinate() - leftCoordinate;

        let currentX = padding;
        for (let i = 0; i < meshData.length; i++) {
            const rightCoord = meshData[i].rightCoord;
            const nextX = padding + ((rightCoord - leftCoordinate) / totalRange) * effectiveWidth;

            if (x >= currentX && x <= nextX) {
                return i;
            }

            currentX = nextX;
        }

        return -1;
    };

    // 영역 추가 버튼 핸들러
    const handleAddRegion = () => {
        const lastRegion = meshData[meshData.length - 1];
        const lastCoord = lastRegion ? lastRegion.rightCoord : leftCoordinate;
        const newRegion = {
            intervals: 1,
            rightCoord: lastCoord + 0.001,
            composition: '3'  // 기본값
        };

        onChange([...meshData, newRegion]);
    };

    // 활성 영역 삭제 버튼 핸들러
    const handleDeleteRegion = (index) => {
        if (index !== undefined && meshData.length > 1) {
            const newMeshData = meshData.filter((_, i) => i !== index);
            onChange(newMeshData);
            setActiveRegion(null);
        }
    };

    // 구성 번호 변경 핸들러
    const handleChangeComposition = (newComposition) => {
        if (selectedRegion !== null) {
            const newMeshData = [...meshData];
            newMeshData[selectedRegion] = {
                ...newMeshData[selectedRegion],
                composition: newComposition
            };
            onChange(newMeshData);
            setShowCompositionSelector(false);
        }
    };

    // 메시 데이터 직접 수정 핸들러
    const handleMeshDataChange = (index, field, value) => {
        const newMeshData = [...meshData];

        if (field === 'rightCoord') {
            // 유효한 범위 내에서만 변경
            let min = index === 0 ? leftCoordinate + 0.001 : newMeshData[index - 1].rightCoord + 0.001;
            let max = index === newMeshData.length - 1
                ? Number.MAX_SAFE_INTEGER
                : newMeshData[index + 1].rightCoord - 0.001;

            value = Math.max(min, Math.min(max, value));
        }

        newMeshData[index] = {
            ...newMeshData[index],
            [field]: value
        };

        onChange(newMeshData);
    };

    return (
        <div className="mesh-visualizer">
            <div className="canvas-container">
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={150}
                    className="mesh-canvas"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />

                {showCompositionSelector && (
                    <div
                        className="composition-selector"
                        style={{
                            position: 'absolute',
                            left: `${selectorPosition.x}px`,
                            top: `${selectorPosition.y}px`,
                            transform: 'translate(-50%, 10px)'
                        }}
                    >
                        <div className="selector-title">구성 선택</div>
                        <div className="selector-options">
                            {compositions.map(comp => (
                                <div
                                    key={comp.id}
                                    className="selector-option"
                                    onClick={() => handleChangeComposition(comp.id)}
                                >
                                    <div
                                        className="color-box"
                                        style={{ backgroundColor: getCompositionColor(comp.id) }}
                                    />
                                    <span>{comp.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mesh-controls">
                <button
                    className="btn add-button"
                    onClick={handleAddRegion}
                >
                    영역 추가
                </button>

                <button
                    className="btn delete-button"
                    onClick={() => handleDeleteRegion(activeRegion)}
                    disabled={activeRegion === null || meshData.length <= 1}
                >
                    선택 영역 삭제
                </button>
            </div>

            <div className="mesh-data-editor">
                <h4>메시 데이터 편집</h4>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>영역</th>
                            <th>우측 좌표 (m)</th>
                            <th>구성</th>
                            <th>간격 수</th>
                            <th>작업</th>
                        </tr>
                        </thead>
                        <tbody>
                        {meshData.map((region, index) => (
                            <tr
                                key={index}
                                className={activeRegion === index ? 'active-row' : ''}
                            >
                                <td>{index + 1}</td>
                                <td>
                                    <input
                                        type="number"
                                        className="field-input"
                                        step="0.001"
                                        value={region.rightCoord}
                                        onChange={(e) => handleMeshDataChange(
                                            index,
                                            'rightCoord',
                                            parseFloat(e.target.value)
                                        )}
                                    />
                                </td>
                                <td>
                                    <select
                                        className="field-input"
                                        value={region.composition}
                                        onChange={(e) => handleMeshDataChange(
                                            index,
                                            'composition',
                                            e.target.value
                                        )}
                                    >
                                        {compositions.map(comp => (
                                            <option key={comp.id} value={comp.id}>
                                                {comp.id} ({comp.name})
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="field-input"
                                        min="1"
                                        value={region.intervals || 1}
                                        onChange={(e) => handleMeshDataChange(
                                            index,
                                            'intervals',
                                            parseInt(e.target.value)
                                        )}
                                    />
                                </td>
                                <td>
                                    <button
                                        className="btn delete-button"
                                        onClick={() => handleDeleteRegion(index)}
                                        disabled={meshData.length <= 1}
                                    >
                                        삭제
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="legend">
                <h4>범례</h4>
                <div className="legend-container">
                    {compositions.map(comp => (
                        <div key={comp.id} className="legend-item">
                            <div
                                className="color-box"
                                style={{ backgroundColor: getCompositionColor(comp.id) }}
                            />
                            <span>{comp.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MeshVisualizer;