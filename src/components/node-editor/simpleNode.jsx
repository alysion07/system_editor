import { Handle, Position } from 'reactflow';
import React from "react";
import ICO from "../../../icon/keyboard_command_key_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg";

import './styles/SimpleNode.css';

export function SimplifiedNode({ data }) {

    // data.componentType에 따라 아이콘을 다르게 설정함
    const getIcon = () => {
        const type = data.componentType;
        switch (type) {
            case 'node':
                return '/assets/icons/node.svg';
            case 'simple':
                return '/assets/icons/simple.svg';
            case 'MERGED_PJP':
                return '/assets/icons/simple.svg';
            default:
                return ICO;
        }
    }
    const getSimpleLabel = () => {
        const type = data.componentType;
        switch (type) {
            case 'SNGLVOL':
                return 'SGV';
            case 'TMDPVOL':
                return 'TDV';
            case "SNGLJUN":
                return 'SGJ';
            case "TMDPJUN":
                return 'TDJ';
            case "PIPE":
                return 'P';
            case "PUMP":
                return '';
            case "MERGED_PJP":
                return 'PJP';
            default:
                return '';
        }
    }

    return (
        <div className="simple-node-container">
            <div className="simple-node-body">
                <Handle type="target" position={Position.Top}/>
                <img src={getIcon()} alt=""  />
                <Handle type="source" position={Position.Bottom}/>
            </div>
            <div className="simple-node-footer">
                <label>{getSimpleLabel()}</label>
            </div>

        </div>
    );
}
