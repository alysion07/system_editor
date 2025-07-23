// src/components/Dashboard/ProjectFileList.jsx
import React, { useEffect, useState } from 'react';
import { ProjectService } from '../../services/projectService';
import { FaFileAlt, FaDownload, FaEdit } from 'react-icons/fa';

const ProjectFileList = ({ bucket, userId, projectName, onReadyToEdit }) => {
    const [files, setFiles] = useState([]);
    const [hasRun, setHasRun] = useState(false);
    const [selected, setSelected] = useState('');

    useEffect(() => {
        (async () => {
            const prefix = `${userId}/${projectName}/`;
            const all = await ProjectService.listProjectFiles(userId, projectName);
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
                className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
          ${isSel ? 'bg-primary-color/80 text-white shadow-md' : 'hover:bg-hover-background text-light-text-color'}`}
            >
                <div className="flex items-center space-x-3">
                    <FaFileAlt className={output ? 'text-success-color' : 'text-primary-color'} />
                    <span className="font-medium">{name}</span>
                </div>
                {output && (
                    <button onClick={dl} className="text-light-text-color hover:text-white transition-colors duration-200" title="다운로드">
                        <FaDownload />
                    </button>
                )}
            </li>
        );
    };

    return (
        <div className="border border-border-color rounded-2xl p-8 mt-6 bg-card-background/70 backdrop-blur-md shadow-xl">
            <h3 className="text-2xl font-bold mb-6 text-card-title-color">📁 {projectName} 파일 목록</h3>

            {inputs.length > 0 && (
                <div className="mb-8">
                    <p className="text-light-text-color font-semibold mb-3 text-lg">입력 파일</p>
                    <ul className="space-y-2">{inputs.map(f => renderItem(f, false))}</ul>
                </div>
            )}

            {hasRun && outputs.length > 0 && (
                <div className="mb-8">
                    <p className="text-light-text-color font-semibold mb-3 text-lg">출력 파일 (run/)</p>
                    <ul className="space-y-2">{outputs.map(f => renderItem(f, true))}</ul>
                </div>
            )}

            <div className="text-right mt-6">
                <button
                    onClick={() => {
                        onReadyToEdit({
                            userId,
                            projectName,
                        });
                    }}
                    className="inline-flex items-center space-x-2 bg-primary-color text-white px-6 py-3 rounded-xl hover:bg-opacity-80 transition-all duration-300 font-semibold shadow-lg"
                >
                    <FaEdit />
                    <span>편집 시작</span>
                </button>
            </div>
        </div>
    );
};

export default ProjectFileList;