// src/components/Dashboard/ProjectCard.jsx
import React from 'react';
import { FaTrash } from 'react-icons/fa';

const ProjectCard = ({ name, count, onClick, onDelete }) => (
    <div
        onClick={onClick}
        className="p-6 rounded-xl shadow-lg border border-border-color bg-card-background/70 backdrop-blur-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
    >
        <h3 className="text-xl font-bold mb-2 text-card-title-color">{name}</h3>
        <p className="text-sm text-light-text-color mb-4">파일 수: {count}</p>
        <div className="flex justify-end space-x-2">
            {/* 삭제 버튼 */}
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
    </div>
);

export default ProjectCard;