// src/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiLogOut, FiPlus, FiRefreshCw } from 'react-icons/fi';

import { ProjectService  } from '../../services/projectService.js';
import UploadModal from './UploadModal';
import ProjectCard from './ProjectCard';
import ProjectFileList from './ProjectFileList.jsx';
import CreateProjectModal from './CreateProjectModal';
import { ANALYSIS_STATUS } from '../../utils/systemTypes';

import useProjectStore from '../store/projectStore';
import useFlowStore from '../store/useFlowStore';

const Dashboard = () => {
    const [uploadOpen, setUploadOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [projectsWithMetadata, setProjectsWithMetadata] = useState([]);
    const [bucket] = useState("v-smr");
    const [selectedProject, setSelectedProject] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

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
            setRefreshing(true);
            // Step 1: Get list of project names
            const projectNames = await ProjectService.listProjects(userId);
            const projectMap = {};

            // Step 2: For each project, get its files and check for run folder
            for (const projectName of projectNames) {
                if (!projectName) continue;

                // Initialize project data
                projectMap[projectName] = {
                    name: projectName,
                    count: 0,
                    hasResultFiles: false,
                    hasRunFolder: false,
                    files: []
                };

                try {
                    // Get all files for this project
                    const projectFiles = await ProjectService.listProjectFiles(userId, projectName);

                    // Process each file path
                    for (const filePath of projectFiles) {
                        // Remove userId/projectName/ prefix to get relative path
                        const relativePath = filePath.replace(`${userId}/${projectName}/`, '');
                        projectMap[projectName].files.push(relativePath);
                        projectMap[projectName].count++;

                        // Check if this file is in run/ directory
                        if (relativePath.startsWith('run/') || relativePath.includes('/run/')) {
                            projectMap[projectName].hasRunFolder = true;
                            projectMap[projectName].hasResultFiles = true;
                            console.log(`[DEBUG] Found run folder in project ${projectName}: ${relativePath}`);
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching files for project ${projectName}:`, error);
                }
            }

            // Load metadata from localStorage or project files
            const projectsArray = Object.values(projectMap).map(project => {
                const storedMetadata = localStorage.getItem(`project_${userId}_${project.name}`);
                let metadata = {};

                if (storedMetadata) {
                    try {
                        metadata = JSON.parse(storedMetadata);
                    } catch (e) {
                        console.error('Error parsing metadata:', e);
                    }
                }

                // Determine analysis status based on run folder presence
                let analysisStatus = ANALYSIS_STATUS.PENDING;
                if (project.hasRunFolder) {
                    // If run/ folder exists, analysis is completed
                    analysisStatus = ANALYSIS_STATUS.COMPLETED;
                    console.log(`[DEBUG] Project ${project.name} status: COMPLETED (has run folder)`);
                } else if (project.files.some(f => f.includes('.running') || f.includes('.lock'))) {
                    // If there are .running or .lock files, analysis is in progress
                    analysisStatus = ANALYSIS_STATUS.RUNNING;
                    console.log(`[DEBUG] Project ${project.name} status: RUNNING (has .running/.lock files)`);
                } else {
                    console.log(`[DEBUG] Project ${project.name} status: PENDING (no run folder, files:`, project.files, `)`);
                }

                return {
                    ...project,
                    systemType: metadata.systemType || null,
                    description: metadata.description || '',
                    createdAt: metadata.createdAt || null,
                    analysisStatus
                };
            });

            setProjects(projectsArray);
            setProjectsWithMetadata(projectsArray);
        } catch (e) {
            console.error('Error fetching projects:', e);
        } finally {
            setRefreshing(false);
        }
    };

    const handleCreateProject = async (projectData) => {
        try {
            // Store metadata in localStorage
            const metadata = {
                systemType: projectData.systemType,
                description: projectData.description,
                createdAt: projectData.createdAt
            };
            localStorage.setItem(
                `project_${userId}_${projectData.name}`,
                JSON.stringify(metadata)
            );

            // Navigate to node editor with project info
            navigate('/nodeeditor', {
                state: {
                    userId,
                    projectName: projectData.name,
                    systemType: projectData.systemType
                }
            });

            setCreateModalOpen(false);
        } catch (error) {
            console.error('Error creating project:', error);
            alert('프로젝트 생성 중 오류가 발생했습니다.');
        }
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
            // Remove metadata from localStorage
            localStorage.removeItem(`project_${userId}_${projectName}`);
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
                    <h1 className="text-3xl font-bold text-gray-100">
                        {userId} 프로젝트 관리
                    </h1>
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="bg-primary-color text-white px-5 py-2.5 rounded-lg shadow-lg hover:bg-opacity-80 transition-all duration-300 font-semibold flex items-center gap-2"
                    >
                        <FiPlus size={18} />
                        새 프로젝트 생성
                    </button>
                    <button
                        onClick={fetchProjects}
                        disabled={refreshing}
                        className="bg-gray-700/80 text-white px-4 py-2.5 rounded-lg shadow-lg hover:bg-gray-600/80 transition-all duration-300 font-semibold flex items-center gap-2 disabled:opacity-50"
                    >
                        <FiRefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                        새로고침
                    </button>
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-primary-color text-white px-5 py-2.5 rounded-lg shadow-lg hover:bg-opacity-80 transition-all duration-300 font-semibold flex items-center gap-2"
                >
                    <FiLogOut size={20} />
                    로그아웃
                </button>
            </header>

            {/* Project Statistics */}
            <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-panel-bg/50 rounded-lg p-4">
                    <p className="text-light-text-color text-sm">전체 프로젝트</p>
                    <p className="text-2xl font-bold text-card-title-color">{projects.length}</p>
                </div>
                <div className="bg-panel-bg/50 rounded-lg p-4">
                    <p className="text-light-text-color text-sm">완료된 해석</p>
                    <p className="text-2xl font-bold text-success-color">
                        {projects.filter(p => p.analysisStatus === ANALYSIS_STATUS.COMPLETED).length}
                    </p>
                </div>
                <div className="bg-panel-bg/50 rounded-lg p-4">
                    <p className="text-light-text-color text-sm">진행 중</p>
                    <p className="text-2xl font-bold text-warning-color">
                        {projects.filter(p => p.analysisStatus === ANALYSIS_STATUS.RUNNING).length}
                    </p>
                </div>
                <div className="bg-panel-bg/50 rounded-lg p-4">
                    <p className="text-light-text-color text-sm">대기 중</p>
                    <p className="text-2xl font-bold text-gray-400">
                        {projects.filter(p => p.analysisStatus === ANALYSIS_STATUS.PENDING).length}
                    </p>
                </div>
            </section>

            {/* Projects Grid */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-200">프로젝트 목록</h2>
                    {projects.length > 0 && (
                        <p className="text-sm text-light-text-color">
                            총 {projects.length}개 프로젝트
                        </p>
                    )}
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-12 bg-panel-bg/30 rounded-xl">
                        <p className="text-light-text-color text-lg mb-4">
                            등록된 프로젝트가 없습니다.
                        </p>
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="bg-primary-color text-white px-6 py-3 rounded-lg shadow-lg hover:bg-opacity-80 transition-all duration-300 font-semibold inline-flex items-center gap-2"
                        >
                            <FiPlus size={20} />
                            첫 프로젝트 만들기
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {projects.map(p => (
                            <ProjectCard
                                key={p.name}
                                name={p.name}
                                count={p.count}
                                systemType={p.systemType}
                                analysisStatus={p.analysisStatus}
                                hasResultFiles={p.hasResultFiles}
                                createdAt={p.createdAt}
                                onClick={() => setSelectedProject(p.name)}
                                onDelete={handleDeleteProject}
                                selected={selectedProject === p.name}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Create Project Modal */}
            <CreateProjectModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreate={handleCreateProject}
                existingProjects={projects.map(p => p.name)}
            />

            {/* Upload Modal */}
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
