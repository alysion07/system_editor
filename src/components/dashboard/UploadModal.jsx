// src/components/ProjectManager/UploadModal.jsx
import React, { useState } from 'react';

const UploadModal = ({ open, onClose, onUpload }) => {
    const [file, setFile] = useState(null);
    if (!open) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-gray-800 text-gray-100 p-6 rounded-xl shadow-xl w-96">
                <h2 className="text-xl font-semibold mb-4">프로젝트 업로드</h2>
                <input
                    type="file"
                    onChange={e => setFile(e.target.files[0])}
                    className="mb-4 text-gray-100"
                />
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
                    >
                        취소
                    </button>
                    <button
                        onClick={() => file && onUpload(file)}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                        업로드
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
