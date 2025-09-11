import { useCallback, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import React from "react";
import ICO_VALVE from "../../../icon/valve.svg";
import ICO_PUMP from "../../../icon/pump.svg";
import './styles/SimpleNode.css';
import { getPortPosition } from '../../utils/portHelper.js';

export function SimplifiedNode({ id, data, type }) {
    const updateNodeInternals = useUpdateNodeInternals();
    const shapeType = data.shape? data.shape : 'rect';
    const { width: w, height: h, background: bg, label } = data;

    // 데이터로부터 각도 값을 가져옴 (없으면 기본값 0)
    const azimuthal = data.componentProp?.azimuthal || 0;

    // 입력 포트와 출력 포트의 위치 계산
    // 입력은 방위각의 반대편, 출력은 방위각 방향으로 설정
    const inputPosition = getPortPosition(azimuthal + 180);
    const outputPosition = getPortPosition(azimuthal);

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
            shapeElement =
                <g>
                    {[0, 1, 2].map((i) => {
                        const barHeight = w * 0.1;
                        const gap = (h - 3 * barHeight) / 2;
                        const y = i * (barHeight + gap);
                        return (
                            <rect
                                key={i}
                                x={w * 0.1}
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
    }, [id, updateNodeInternals, type, inputPosition, outputPosition]);

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
                    <svg
                        width={w}
                        height={h}
                        viewBox={`0 0 ${w} ${h}`} // 내부 좌표계 설정
                        style={{ overflow: 'visible' }} // 핸들이 벗어나도 보이도록
                    >
                        {
                            React.cloneElement(shapeElement, {
                                fill: bg,
                                stroke: '#333',
                                strokeWidth: 1,
                            })
                        }
                        <text
                            x={w / 2}
                            y={h / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="24px"
                            fill="#333"
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
                
                {/* Delete button for simplified node */}
                {data.onDelete && (
                    <button
                        className="simple-node-delete-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            data.onDelete();
                        }}
                    >
                        ×
                    </button>
                )}

                <Handle type="target" position={inputPosition}/>
                <Handle type="source" position={outputPosition}/>
            </div>

    );
}
