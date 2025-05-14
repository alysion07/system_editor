import { useCallback, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import React from "react";
import ICO_VALVE from "../../../icon/valve.svg";
import ICO_PUMP from "../../../icon/pump.svg";
import './styles/SimpleNode.css';

export function SimplifiedNode({ id, data, type }) {
    const updateNodeInternals = useUpdateNodeInternals();
    const shapeType = data.shape? data.shape : 'rect';
    const { width: w, height: h, background: bg, label } = data;

    let shapeElement;
    switch (shapeType) {
        case 'circle':
            shapeElement = <ellipse cx={w/2} cy={h/2} rx={w/2} ry={h/2} />;
            break;
        case 'diamond':
            shapeElement = <polygon points={`${w/2},0 ${w},${h/2} ${w/2},${h} 0,${h/2}`} />;
            break;
        case 'halfcircle':
            shapeElement =
                <path
                    // 1) M0,h: 왼쪽 바닥점으로 이동
                    // 2) A w/2,h 0 0,1 w,h: 반원 아크를 그려 위쪽을 통과하며 오른쪽 바닥점으로 이동
                    // 3) L0,h: 바닥점으로 직선 이동 (아크의 끝점에서 시작점으로)
                    // 4) Z: 경로 닫기 (첫 지점으로 자동 연결)
                    d={`
            M0,${h}
            A${w / 2},${h} 0 0,1 ${w},${h}
            L0,${h}
            Z
          `}
                    fill={'none'}           // 내부 채움색
                    stroke="#333"       // 외곽선 색
                    strokeWidth={1}     // 외곽선 두께
                />

            break;
        case 'halfcircle-inverted':
            shapeElement = <path
                // 위쪽이 평평하고, 아래쪽이 반원 아크인 역반원
                d={`
            M0,0
            A${w / 2},${h} 0 0,0 ${w},0
            L0,0
            Z
          `}
                fill={bg}
                stroke="#333"
                strokeWidth={1}
            />
            break;
        case 'threebars':
            // 가로 바 3개를 drawing
            shapeElement =
                <g>
                    {[0, 1, 2].map((i) => {
                        const barHeight = w * 0.1;             // 바 두께
                        const gap = (h - 3 * barHeight) / 2;     // 바 사이 간격 균등 배치
                        const y = i * (barHeight + gap);   // i번째 바의 y 위치
                        return (
                            <rect
                                key={i}
                                x={w * 0.1}                        // 좌·우 마진 10%
                                y={y}
                                width={w * 0.8}
                                height={barHeight}
                                fill={bg}
                                stroke="#333"
                                strokeWidth={1}
                            />
                        );
                    })}
                </g>
            break;
        default:
            shapeElement = <rect width={w} height={h} />;
    }

    useEffect(() => {
        updateNodeInternals(id);
    }, [id, data, updateNodeInternals,type]);

    // data.componentType에 따라 아이콘을 다르게 설정함
    const getIcon = () => {
        const type = data.componentType;
        switch (type) {
            case 'VALVE':
                return ICO_VALVE;
            case "PUMP":
                return ICO_PUMP;
            default:
                return null;
        }
    }
    const getSimpleLabel = () => {
        const type = data.componentType;
        switch (type) {
            case 'SNGLVOL':
                return `SV${data.label.split("-")[1]}`;
            case 'TMDPVOL':
                return  `TV${data.label.split("-")[1]}`;
            case "SNGLJUN":
                return `SJ${data.label.split("-")[1]}`;
            case "TMDPJUN":
                return `TJ${data.label.split("-")[1]}`;
            case "MTPLJUN":
                return `MJ${data.label.split("-")[1]}`;
            case "PIPE":
                return `P${data.label.split("-")[1]}`;
            case "PUMP":
                return `${data.label.split("-")[1]}`;
            case "VALVE":
                return `${data.label.split("-")[1]}`;
            case "MERGED_PJP":
                return 'PIPE';
            case "HTSTR":
                return `HS${data.label.split("-")[1]}`;
            case "BRANCH":
                return `B${data.label.split("-")[1]}`;
            default:
                return '';
        }
    }
    const getStyle = useCallback(() => {
        const type = data.componentType;
        switch (type) {
            case 'SNGLVOL':
                return {
                    backgroundColor: '#E3F2FD',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    padding: '4px',
                    width: '50px',
                    height: '50px',
                };
            case 'TMDPVOL':
                return {
                    backgroundColor: bg,
                    width: w,
                    height: h,
                };
            case 'PIPE':
                return {
                    backgroundColor: bg,
                    width: w,
                    height: h,
                };
            default:
                return {
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    padding: '4px',
                    width: '50px',
                    height: '50px',
                };
        }
    }, [data.componentType]);

    const renderNode = () => {
        if(data.shape === 'halfcircle' || data.shape === 'rect' || data.shape === 'halfcircle-inverted' || data.shape === 'threebars'){
            return (
                <div style={{ width: w, height: h, position: 'relative'}}>
                {/*// <div >*/}
                    <svg
                        width={w}
                        height={h}
                        viewBox={`0 0 ${w} ${h}`} // 내부 좌표계 설정
                        style={{ overflow: 'visible' }} // 핸들이 벗어나도 보이도록
                    >
                        {
                            // 선택된 도형 엘리먼트에 공통 스타일 프로퍼티를 주입
                            React.cloneElement(shapeElement, {
                                fill: bg,        // 배경색 적용
                                stroke: '#333',  // 테두리 색
                                strokeWidth: 1,  // 테두리 두께
                            })
                        }
                        <text
                            x={w / 2}
                            y={h / 2}
                            textAnchor="middle"           // 텍스트 중앙 정렬
                            dominantBaseline="middle"     // 수직 중앙 정렬
                            fontSize="12"
                            fill="#333"                   // 텍스트 색
                        >
                            {getSimpleLabel()}
                        </text>
                    </svg>
                </div>
            )
        }else{
            return (
                <>
                    <div className="simple-node-body">
                        {getIcon() && (
                            <img src={getIcon()} style={{width: '90%', height: '90%'}} alt="icon"/>
                        )}
                    </div>
                    <div className="simple-node-footer">
                        <label>{getSimpleLabel()}</label>
                    </div>
                </>
            )
        }
    }
    return (
            <div className="simple-node-container">
                {renderNode()}

                <Handle type="target" position={Position.Top}/>
                <Handle type="source" position={Position.Bottom}/>
            </div>

    );
}
