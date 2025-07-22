// src/components/Dashboard/ProjectCard.jsx
import React from 'react';
import { FaTrash } from 'react-icons/fa';

const ProjectCard = ({ name, count, onClick, onDelete }) => (
    <div
        onClick={onClick}
        className="p-4 rounded-xl shadow border border-gray-700 bg-gray-800 hover:shadow-lg transition cursor-pointer"
    >
        <h3 className="text-lg font-semibold mb-2 text-gray-100">{name}</h3>
        <p className="text-sm text-gray-400 mb-4">파일 수: {count}</p>
        <div className="flex justify-end space-x-2">
            {/* 삭제 버튼 */}
            <button
                onClick={e => {
                    e.stopPropagation();
                    onDelete(name);
                }}
                className="flex items-center space-x-1 hover:bg-red-900 text-white px-2 py-1 rounded transition"
                title="프로젝트 삭제"
            >
                <FaTrash />
                <span className="text-sm"></span>
            </button>
        </div>
    </div>
);

export default ProjectCard;
