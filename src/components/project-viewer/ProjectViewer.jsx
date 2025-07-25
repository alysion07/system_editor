import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ProjectService } from '../../services/projectService.js';
import FilePreview from './FilePreview';
import useProjectStore from '../store/projectStore';
import ProjectFileList from "../dashboard/ProjectFileList";


const ProjectViewer = ({ bucketName }) => {
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedObjectKey, setSelectedObjectKey] = useState(null);
    const { userId, projectName } = useProjectStore();

    useEffect(() => {
        setSelectedProject(projectName);
        console.log("call effect projectName: ", projectName);
    }, [ projectName]);


    // 파일 선택 핸들러
    const handleFileSelect = (objectKey) => {
        setSelectedObjectKey(objectKey);
        console.log("call handleFileSelect ", objectKey)
    };


    useEffect(() => {
        console.log("call effect selectedProject: ", selectedProject);
        
    }, [selectedProject, setSelectedProject]);

    return (
        <div className="project-viewer-wrapper h-full flex flex-col">
            <div className="flex flex-row gap-4 flex-1 min-h-0">
                <div className="basis-1/4 flex-shrink-0">
                <ProjectFileList
                    bucket={bucketName}
                    userId={userId}
                    projectName={projectName}
                    onFileClick={handleFileSelect} // 파일 선택 시 오브젝트키 전달
                />
                </div>

                <div className="browser-section  basis-3/4 flex-shrink-0 pr-4">
                    <FilePreview
                        objectKey={selectedObjectKey}
                        buildFullKey={key => key} // 필요시 함수 전달
                    />
                </div>
            </div>
        </div>
    );
};

export default ProjectViewer;
