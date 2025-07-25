// src/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';

import { ProjectService  } from '../../services/projectService.js';
import UploadModal from './UploadModal';
import ProjectCard from './ProjectCard';
import ProjectFileList from './ProjectFileList.jsx';

import useProjectStore from '../store/projectStore';
import useFlowStore from '../store/useFlowStore';

const Dashboard = () => {
    const [uploadOpen, setUploadOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [bucket] = useState("v-smr");
    const [selectedProject, setSelectedProject] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();
    const { user = '' } = location.state || {};
    const [userId, setUserId] = useState(user);

    useEffect(() => {
        if (!userId) {
            navigate('/');
        } else {
            fetchProjects();
        }
    }, [userId]);

    const fetchProjects = async () => {
        try {
            const files = await ProjectService.listProjects(userId);
            const map = {};
            files.forEach(path => {
                const name = path.replace(`${userId}/`, '').split('/')[0];
                if (name) map[name] = (map[name] || 0) + 1;
            });
            setProjects(Object.entries(map).map(([name, count]) => ({ name, count })));
        } catch (e) {
            console.error(e);
        }
    };

    const handleNew = async () => {
        const name = prompt("새 프로젝트 이름을 입력하세요");
        if (!name || name.trim() === '') return alert("이름이 비어있습니다");

        const existing = await ProjectService.listProjects(userId);
        if (existing.includes(name)) {
            return alert("이미 존재하는 프로젝트 이름입니다");
        }

        navigate('/nodeeditor', {
            state: {
                userId,
                projectName: name.trim()
            }
        });
    };

    const handleLogout = () => {
        useProjectStore.getState().reset(); // 프로젝트 관련 상태 초기화
        useFlowStore.setState({
            past: [],
            present: { nodes: [], edges: [] },
            future: [],
            selectedNodeId: null,
            canUndo: false,
            canRedo: false,
            dragStartNodes: null,
        }); // 다이어그램 상태 초기화

        navigate('/'); // 로그인 페이지로 이동
    };

    const handleUpload = async (file) => {

        try {
            // 1) baseName 추출 (확장자 .json 제거)
            const fileName = file.name;                         // ex: "projectA.json"
            const baseName = fileName.replace(/\.json$/i, '');  // ex: "projectA"
            // 2) 폴더 경로  파일 경로 생성
            const folderPrefix = `${userId}/${baseName}/`;      // ex: "user1/projectA/"
            const objectKey = `${folderPrefix}${fileName}`;

            // 3) JSON 업로드 (폴더는 MinIO가 자동으로 생성)
            await ProjectService.uploadProjectJson(userId, baseName, fileName);

            // 4) 모달 닫고, 리스트 갱신
            setUploadOpen(false);
            await fetchProjects();

            // 5) 새 프로젝트 생성 후 바로 편집 페이지로 이동
             navigate(`/nodeeditor`);
        } catch (e) {
            console.error(e);
            alert('업로드 실패: ' + e.message);

        }
    };

    // 프로젝트 삭제 핸들러
    const handleDeleteProject = async (projectName) => {
        if (!window.confirm(`프로젝트 "${projectName}"을(를) 정말 삭제하시겠습니까?`)) return;
        try {
            // userId/projectName/ 하위 전체 삭제
            await ProjectService.deleteProject(userId, projectName);
            await fetchProjects();               // 리스트 갱신
            if (selectedProject === projectName) setSelectedProject(null);
        } catch (err) {
            console.error('프로젝트 삭제 실패:', err);
            alert('프로젝트 삭제에 실패했습니다.');
        }
    };

    return (
        <div className="p-8 space-y-8 bg-background-color min-h-screen font-sans">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-100">{userId} 프로젝트 관리</h1>
                    <button
                        onClick={handleNew}
                        className="bg-primary-color text-white px-5 py-2.5 rounded-lg shadow-lg hover:bg-opacity-80 transition-all duration-300 font-semibold"
                    >
                        + 새 프로젝트 생성
                    </button>
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-primary-color text-white px-5 py-2.5 rounded-lg shadow-lg hover:bg-opacity-80 transition-all duration-300 font-semibold"
                >
                    <FiLogOut size={20} />
                </button>
            </header>
                    {/*<button*/}
                    {/*    onClick={() => setUploadOpen(true)}*/}
                    {/*    className="bg-success-color text-white px-5 py-2.5 rounded-lg shadow-lg hover:bg-opacity-80 transition-all duration-300 font-semibold"*/}
                    {/*>*/}
                    {/*    프로젝트 업로드*/}
                    {/*</button>*/}

            <section>
                <h2 className="text-xl font-semibold mb-2 text-gray-200">최근 프로젝트</h2>
                {projects.length === 0 ? (
                    <p className="text-light-text-color text-lg">등록된 프로젝트가 없습니다.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {projects.map(p => (
                            <ProjectCard
                                key={p.name}
                                name={p.name}
                                count={p.count}
                                onClick={
                                    () => {
                                        setSelectedProject(p.name)
                                    }
                                }
                                onDelete={handleDeleteProject}
                                selected={selectedProject === p.name}
                            />
                        ))}
                    </div>
                )}
            </section>

            <UploadModal
                open={uploadOpen}
                onClose={() => setUploadOpen(false)}
                onUpload={handleUpload}
            />

            {selectedProject && (
                <ProjectFileList
                    bucket={bucket}
                    userId={userId}
                    projectName={selectedProject}
                    onReadyToEdit={({ userId, projectName }) => {
                        navigate('/nodeeditor', {
                            state: {
                                userId,
                                projectName,
                            },
                        });
                    }}
                />
            )}
        </div>
    );
};

export default Dashboard;
