// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

import { ProjectService } from '../../services/projectService.js';
import Browser from './Browser';
import './ProjectViewer.css';



const ProjectViewer = ({ bucketName }) => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const navigate = useNavigate();
    const { user , previousPage , timestamp  } = location.state || {};

    useEffect(() => {
        if (!bucketName) return;
        fetchProjects();
    }, [bucketName]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const prefix = `${user}/`;
            const files = await ProjectService.listProjects(prefix);

            const uniqueProjects = new Set();

            files.forEach(path => {
                if (typeof path === 'string') {
                    const segments = path.split('/');
                    if (segments.length >= 2 && segments[0] === user) {
                        uniqueProjects.add(segments[1]);
                    }
                } else if (path.Key || path.Prefix) {
                    const raw = path.Key || path.Prefix;
                    const segments = raw.split('/');
                    if (segments.length >= 2 && segments[0] === user) {
                        uniqueProjects.add(segments[1]);
                    }
                }
            });

            setProjects([...uniqueProjects]);
        } catch (err) {
            console.error('프로젝트 목록 불러오기 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    const buildKeyPrefix = (user, projectName) => `${user}/${projectName}/`;

    return (
        <div className="project-viewer-wrapper">
            <h2 className="project-viewer-title">🗂 {user}의 프로젝트</h2>

            {loading ? (
                <div>로딩 중...</div>
            ) : (
                <div className="project-grid">
                    {projects.map(project => (
                        <div
                            key={project}
                            className={`project-card ${project === selectedProject ? 'selected' : ''}`}
                            onClick={() => setSelectedProject(project)}
                        >
                            <div className="project-title">{project}</div>
                        </div>
                    ))}
                </div>
            )}

            {selectedProject && (
                <div className="browser-section">
                    <Browser
                        key={selectedProject}
                        externalBucket={bucketName}
                        externalPrefix={buildKeyPrefix(user, selectedProject)}
                        buildFullKey={(relativePath) => buildKeyPrefix(user, selectedProject) + relativePath}
                    />
                </div>
            )}
        </div>
    );
};

export default ProjectViewer;
