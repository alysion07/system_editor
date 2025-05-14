import { useCallback, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import React from "react";
import ICO_VALVE from "../../../icon/valve.svg";
import ICO_PUMP from "../../../icon/pump.svg";
import './styles/SimpleNode.css';

export function SimplifiedNode({ id, data }) {
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
            shapeElement = <path d={`M0,${h/2} A${w/2},${h/2} 0 0,1 ${w},${h/2} L ${w},${h} L0,${h} Z`} />;
            break;
        default:
            shapeElement = <rect width={w} height={h} />;
    }

    useEffect(() => {
        updateNodeInternals(id);
    }, [id, data, updateNodeInternals]);

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
        return {
            backgroundColor: type === 'SNGLVOL' ? '#E3F2FD' : '#fff',
            borderRadius: '8px',
            border: '1px solid #ccc',
            padding: '4px',
            width: '50px',
            height: '50px',
        };

    }, [data.componentType]);

    return (
        <div className="simple-node-container" style={getStyle()}>

            <div className="simple-node-body">
                <Handle type="target" position={Position.Top}/>
                {getIcon() && (
                    <img src={getIcon()} style={{width: '90%', height: '90%'}} alt="icon"/>
                )}
                <Handle type="source" position={Position.Bottom}/>
            </div>
            <div className="simple-node-footer">
                <label>{getSimpleLabel()}</label>
            </div>
        </div>
    );
}
