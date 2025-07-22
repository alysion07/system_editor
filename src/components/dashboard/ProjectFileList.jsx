// src/components/Dashboard/ProjectFileList.jsx
import React, { useEffect, useState } from 'react';
import { ProjectService } from '../../services/projectService';
import { FaFileAlt, FaDownload } from 'react-icons/fa';

const ProjectFileList = ({ bucket, userId, projectName, onReadyToEdit }) => {
    const [files, setFiles] = useState([]);
    const [hasRun, setHasRun] = useState(false);
    const [selected, setSelected] = useState('');

    useEffect(() => {
        (async () => {
            const prefix = `${userId}/${projectName}/`;
            const all = await ProjectService.listProjectFiles(userId, projectName);
            console.log(" --- received all file list ---  ", all)
            const filtered = all
                .filter(p => !p.endsWith('.json'))
                .map(p => p.replace(prefix, ''));
            setFiles(filtered);
            setHasRun(filtered.some(f => f.startsWith('run/')));
        })();
    }, [bucket, userId, projectName]);

    const inputs = files.filter(f => !f.startsWith('run/'));
    const outputs = files.filter(f => f.startsWith('run/'));

    const renderItem = (f, output = false) => {
        const name = f.replace('run/', '');
        const path = output ? `run/${name}` : f;
        const isSel = selected === path;

        const dl = async (e) => {
            e.stopPropagation();
            const key = `${userId}/${projectName}/${path}`;
            const url = await ProjectService.getSignedDownloadUrl(key);
            window.open(url, '_blank');
        };

        return (
            <li
                key={path}
                onClick={() => setSelected(path)}
                className={`flex items-center justify-between px-2 py-1 rounded-lg cursor-pointer transition
          ${isSel ? 'bg-gray-700 text-gray-100' : 'hover:bg-gray-800 text-gray-300'}`}
            >
                <div className="flex items-center space-x-2">
                    <FaFileAlt className={output ? 'text-teal-400' : 'text-blue-400'} />
                    <span>{name}</span>
                </div>
                {output && (
                    <button onClick={dl} className="text-gray-400 hover:text-white transition" title="다운로드">
                        <FaDownload />
                    </button>
                )}
            </li>
        );
    };

    return (
        <div className="border border-gray-700 rounded-xl p-6 mt-4 bg-gray-800 shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-gray-100">📁 {projectName} 파일 목록</h3>

            {inputs.length > 0 && (
                <div className="mb-6">
                    <p className="text-gray-400 font-semibold mb-2">입력 파일</p>
                    <ul className="space-y-1">{inputs.map(f => renderItem(f, false))}</ul>
                </div>
            )}

            {hasRun && outputs.length > 0 && (
                <div className="mb-6">
                    <p className="text-gray-400 font-semibold mb-2">출력 파일 (run/)</p>
                    <ul className="space-y-1">{outputs.map(f => renderItem(f, true))}</ul>
                </div>
            )}

            <div className="text-right mt-4">
                <button
                    onClick={() => {
                        onReadyToEdit({
                            userId,
                            projectName,
                        });
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                >
                    편집 시작
                </button>
            </div>
        </div>
    );
};

export default ProjectFileList;
