// Toolbar.jsx
import {useRef, useState, useEffect, useCallback} from 'react';
import {useNavigate} from "react-router-dom";
import { ProjectService } from "../../services/projectService";

import './styles/Toolbar.css';
//
// const INPUT = './'
//
// const FileUploader = ( {projectTitle}) => {
//
//     const fileInputRef  = useRef(null);
//     const navigate = useNavigate();
//
//     const  handleClick = async () => {
//         // fileInputRef.current.click();
//
//         const bucket = 'v-smr';
//         const userName = 'yjcho';
//         const project = projectTitle;
//         const uploadPath = userName + '/' + project + '/SMART.i';
//
//         try {
//             // public/resource/smart.i 파일을 fetch로 읽기
//             const response = await fetch('/resource/SMART.i');
//             if (!response.ok) throw new Error('파일을 불러올 수 없습니다.');
//             const fileBlob = await response.blob();
//
//             // Blob을 File 객체로 변환 (Minio 업로드 함수가 File 필요시)
//             const file = new File([fileBlob], 'SMART.i', { type: fileBlob.type });
//
//             const isSuccess = await projectService.uploadToMinio(bucket, uploadPath, file);
//
//             if (isSuccess) {
//                 const args = `${bucket},${userName}/${project},SMART.i`;
//                 navigate("/task", { state: args });
//             } else {
//                 alert("업로드 실패!");
//             }
//         } catch (error) {
//             alert('업로드 실패: ' + error.message);
//             console.error('업로드 실패:', error);
//         }
//     };
//
//     const handleChange = async (event) => {
//         console.log("업로드를 해당 위치에서 수행하지 않음. 프로젝트 관리 기능으로 이관")
//         // const bucket = 'v-smr'
//         // const file = event.target.files[0];
//         // const userName = 'yjcho'
//         // const project = projectTitle
//         // console.log(file);
//         //
//         // const uploadPath = userName + '/' + project + '/' + file.name;
//         // console.log(uploadPath);
//         //
//         // try {
//         //     const blob = new Blob([JSON.stringify(flowData)], { type: 'application/json' });
//         //     const isSuccess = await ProjectService.uploadProjectJson(userId, projectName, blob);
//         //
//         //     if (isSuccess) {
//         //         const args  = `${bucket},${userName}/${project},${file.name}`;
//         //
//         //         navigate("/task", { state : args});
//         //     } else {
//         //         alert("업로드 실패!");
//         //     }
//         //
//         // } catch (error) {
//         //     console.error('업로드 실패:', error);
//         // }
//     };
//
//     return (
//         <div>
//             <button className="toolbar-button"
//                     style={{width: 'auto', border : '1px solid #ccc'}}
//                     onClick={handleClick}
//             >
//                 Simulation Start
//             </button>
//         </div>
//     );
// };
//

const Toolbar = ({
                     onUndo,
                     onRedo,
                     canUndo,
                     canRedo,
                     onExport,
                     onImport,
                     onGeneralSetting,
                     onSimplify,
                     isSimplified,
                     projectName,
                     onSave
                 }) => {

    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef(null);

    const handleProjectNameClick = () => {
        setIsEditing(true);
    };
    const handleProjectNameChanged = (e) => {
    };
    const handleProjectNameBlur = () => {
        setIsEditing(false);
    };

    const handleProjectNameKeyDown = (e) => {
        if (e.key === 'Enter') {
            setIsEditing(false);
        }
    };

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    return (
        <div className="editor-toolbar">
            <div className="toolbar-group">
                <button className="toolbar-button" style={{width: 'auto', border: '1px solid #ccc'}}
                        onClick={onGeneralSetting} title="General Setting">
                    Input Setting
                </button>

            </div>
            <div className="toolbar-divider"></div>
            <button className="toolbar-button" style={{width: 'auto',}} onClick={onSimplify} title="Simplify">
                <i className={isSimplified ? "fa-solid fa-toggle-on" : "fa-solid fa-toggle-off"}></i>
            </button>
            <div className="toolbar-divider"></div>

            <div className="toolbar-group">
                <button className="toolbar-button" onClick={onUndo} disabled={!canUndo} title="실행 취소">
                    <i className="fas fa-undo"></i>
                </button>
                <button className="toolbar-button" onClick={onRedo} disabled={!canRedo} title="다시 실행">
                    <i className="fas fa-redo"></i>
                </button>
            </div>

            <div className="toolbar-divider"></div>

            <div className="toolbar-section project-name">
                <h5 title="현재 프로젝트">{projectName || '(이름 없음)'}</h5>
            </div>

            <button
                className="toolbar-button"
                title="프로젝트 저장"
                onClick={onSave}
                disabled={!projectName}  // 이름 없으면 저장 금지
            >
                <i className="fa-solid fa-save"></i>
            </button>

            <div className="toolbar-right">
                <div className="toolbar-group">
                    <button className="toolbar-button" onClick={onImport} title="불러오기">
                        <i className="fa-solid fa-file-import"></i>
                    </button>
                    <button className="toolbar-button" onClick={onExport} title="내보내기">
                        <i className="fa-solid fa-file-export"></i>
                    </button>
                </div>


            </div>
            <div className="toolbar-divider"></div>

            {/*<FileUploader projectTitle={projectName}/>*/}

        </div>
    );
};

export default Toolbar;