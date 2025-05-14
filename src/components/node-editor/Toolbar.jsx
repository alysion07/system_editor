// Toolbar.jsx
import {useRef, useState, useEffect, useCallback} from 'react';
import {useNavigate} from "react-router-dom";
import {uploadToMinio} from "../../services/minioService";

import './styles/Toolbar.css';

const FileUploader = ( {projectTitle}) => {

    const fileInputRef  = useRef(null);
    const navigate = useNavigate();

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleChange = async (event) => {

        const bucket = 'v-smr'
        const file = event.target.files[0];
        const userName = 'yjcho'
        const project = projectTitle
        console.log(file);

        const uploadPath = userName + '/' + project + '/' + file.name;
        console.log(uploadPath);

        try {
            const isSuccess = await uploadToMinio(bucket, uploadPath, file);

            if (isSuccess) {
                const args  = `${bucket},${userName}/${project},${file.name}`;

                navigate("/task", { state : args});
            } else {
                alert("업로드 실패!");
            }

        } catch (error) {
            console.error('업로드 실패:', error);
        }
    };

    return (
        <div>
            <button className="toolbar-button"
                    style={{width: 'auto', border : '1px solid #ccc'}}
                    onClick={handleClick}
            >
                Simulation Start
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleChange}
                style={{ display: 'none' }}
            />
        </div>
    );
};


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
                     onProjectNameChange,
                     onFileChange,
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
        <div className="editor-toolbar" >
            <div className="toolbar-group">
                <button className="toolbar-button"  style={{width: 'auto', border : '1px solid #ccc'}} onClick={onGeneralSetting} title="General Setting">
                    Input Setting
                </button>

            </div>
            <div className="toolbar-divider"></div>
            <button className="toolbar-button"  style={{width: 'auto', }} onClick={onSimplify} title="Simplify">
                <i className= { isSimplified ? "fas fa-expand-arrows-alt" :"fas fa-compress-arrows-alt" } ></i>
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
                 {isEditing ? (
                     <input
                         ref={inputRef}
                         type="text"
                         value={projectName}
                         onChange={(e) => onProjectNameChange(e.target.value)}
                         onBlur={handleProjectNameBlur}
                         onKeyDown={handleProjectNameKeyDown}
                         className="project-name-input"
                     />
                 ) : (
                     <h5 onClick={handleProjectNameClick}>{projectName}</h5>
                 )}
             </div>

            <div className="toolbar-right">
                <div className="toolbar-group">
                    <button className="toolbar-button" onClick={onImport} title="불러오기">
                        <i className="fas fa-upload"></i>
                    </button>
                    <button className="toolbar-button" onClick={onExport} title="내보내기">
                        <i className="fas fa-download"></i>
                    </button>
                </div>


            </div>
            <div className="toolbar-divider"></div>

            <FileUploader projectTitle={projectName} />

        </div>
    );
};

export default Toolbar;