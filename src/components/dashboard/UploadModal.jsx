// src/components/ProjectManager/UploadModal.jsx
import React, { useState } from 'react';

const UploadModal = ({ open, onClose, onUpload }) => {
    const [file, setFile] = useState(null);
    if (!open) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
            <div className="bg-card-background/80 border border-border-color text-text-color p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-card-title-color">프로젝트 업로드</h2>
                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-light-text-color">JSON 파일 선택</label>
                    <input
                        type="file"
                        onChange={e => setFile(e.target.files[0])}
                        className="block w-full text-sm text-text-color file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-color/80 file:text-white hover:file:bg-primary-color"
                        accept=".json"
                    />
                </div>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg bg-gray-700/80 text-gray-300 hover:bg-gray-600/80 transition-all duration-300 font-semibold"
                    >
                        취소
                    </button>
                    <button
                        onClick={() => file && onUpload(file)}
                        className="px-5 py-2.5 rounded-lg bg-success-color text-white hover:bg-opacity-80 transition-all duration-300 font-semibold shadow-lg disabled:bg-disabled-bg disabled:cursor-not-allowed"
                        disabled={!file}
                    >
                        업로드
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;