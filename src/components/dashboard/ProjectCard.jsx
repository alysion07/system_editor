// src/components/Dashboard/ProjectCard.jsx
import React from 'react';
import { FaTrash, FaChartLine, FaClock, FaFolder } from 'react-icons/fa';
import { ANALYSIS_STATUS, STATUS_CONFIG, getSystemType } from '../../utils/systemTypes';

const ProjectCard = ({
    name,
    count,
    onClick,
    onDelete,
    selected,
    systemType,
    analysisStatus,
    hasResultFiles,
    createdAt
}) => {
    const system = getSystemType(systemType);
    const statusConfig = STATUS_CONFIG[analysisStatus] || STATUS_CONFIG[ANALYSIS_STATUS.PENDING];

    return (
        <div
            onClick={onClick}
            className={
                `relative p-6 rounded-xl shadow-lg bg-panel-bg/85 backdrop-blur-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group overflow-hidden
                ${selected ? 'ring-2 ring-primary-color shadow-selected scale-105 z-10' : ''}`
            }
        >
            {/* System Type Badge */}
            {system && (
                <div
                    className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-semibold flex items-center"
                    style={{
                        backgroundColor: `${system.color}20`,
                        color: system.color
                    }}
                >
                    <i className={`fas ${system.iconClass} mr-1`}></i>
                    {system.name}
                </div>
            )}

            {/* Project Name */}
            <h3 className="text-xl font-bold mb-2 text-card-title-color pr-24">{name}</h3>

            {/* Project Stats */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-light-text-color">
                    <FaFolder className="mr-2 text-primary-color" />
                    <span>파일 수: {count}</span>
                </div>
                {createdAt && (
                    <div className="flex items-center text-sm text-light-text-color">
                        <FaClock className="mr-2 text-primary-color" />
                        <span>생성일: {new Date(createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                )}
            </div>

            {/* Analysis Status */}
            <div className="mb-4">
                <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.bgColor}`}>
                    <i
                        className={`fas ${statusConfig.iconClass} mr-1.5 ${statusConfig.animation || ''}`}
                        style={{ color: statusConfig.color }}
                    ></i>
                    <span style={{ color: statusConfig.color }}>
                        해석 {statusConfig.label}
                    </span>
                </div>
            </div>

            {/* Result Files Indicator */}
            {hasResultFiles && (
                <div className="absolute bottom-3 left-6 flex items-center text-success-color text-sm font-semibold">
                    <FaChartLine className="mr-1.5" />
                    <span>결과 파일 있음</span>
                </div>
            )}

            {/* Action Buttons */}
            <div className="absolute bottom-3 right-6 flex space-x-2">
                {/* Delete Button */}
                <button
                    onClick={e => {
                        e.stopPropagation();
                        onDelete(name);
                    }}
                    className="flex items-center space-x-2 bg-danger-color/80 hover:bg-danger-color text-white px-3 py-1.5 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                    title="프로젝트 삭제"
                >
                    <FaTrash />
                    <span className="text-sm font-semibold">삭제</span>
                </button>
            </div>

            {/* Visual Indicator for Completed Analysis */}
            {analysisStatus === ANALYSIS_STATUS.COMPLETED && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-success-color/20 to-transparent rounded-bl-full"></div>
                </div>
            )}
        </div>
    );
};

export default ProjectCard;