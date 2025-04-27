// File: src/components/Toolbar.js
import React, {useRef} from 'react';
import '../styles/Toolbar.css';
import {useNavigate} from "react-router-dom";
import {uploadToMinio} from "../services/minioService";

const Toolbar = ({
                     onMousePosition,
                     onUndo,
                     onRedo,
                     canUndo,
                     canRedo,
                     onSave,
                     onLoad,
                     onGenerateInput,
                     projectName,
                     onProjectNameChange
                 }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const inputRef = React.useRef(null);

    const handleProjectNameClick = () => {
        setIsEditing(true);
    };

    const handleProjectNameBlur = () => {
        setIsEditing(false);
    };

    const handleProjectNameKeyDown = (e) => {
        if (e.key === 'Enter') {
            setIsEditing(false);
        }
    };
    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    // Hidden file input for load functionality
    const fileInputRef = React.useRef(null);
    const handleLoadClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="toolbar">
            <button
                className="toolbar-button"
                title={"Undo (Ctrl+Z)"}
            >
                {`x: ${onMousePosition.x}, y: ${onMousePosition.y}`}
            </button>
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
                    <h1 onClick={handleProjectNameClick}>{projectName}</h1>
                )}
            </div>

            <div className="toolbar-section toolbar-actions">
                <button
                    className="toolbar-button"
                    onClick={onUndo}
                    disabled={!canUndo}
                    title="Undo (Ctrl+Z)"
                >
                    ↩️ Undo
                </button>

                <button
                    className="toolbar-button"
                    onClick={onRedo}
                    disabled={!canRedo}
                    title="Redo (Ctrl+Y)"
                >
                    ↪️ Redo
                </button>

                <button
                    className="toolbar-button"
                    onClick={onSave}
                    title="Save Project"
                >
                    💾 Save
                </button>

                <button
                    className="toolbar-button"
                    onClick={handleLoadClick}
                    title="Load Project"
                >
                    📂 Load
                </button>

                {/*<button*/}
                {/*    className="toolbar-button"*/}
                {/*    // onClick={onGenerateInput}*/}
                {/*    title="Generate Input File"*/}
                {/*>*/}
                {/*    📝 Generate Input*/}
                {/*</button>*/}

                <FileUploader/>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={onLoad}
                />
            </div>
        </div>
    );
};

export default Toolbar;


const FileUploader = () => {
    const hiddenFileInput = useRef(null);
    const navigate = useNavigate();

    const handleClick = () => {
        hiddenFileInput.current.click();
    };

    const handleChange = async (event) => {

        const bucket = 'v-smr'
        const file = event.target.files[0];
        console.log(file);

        const uploadPath = 'user1/project1/' + file.name;
        console.log(uploadPath);

        try {
            const isSuccess = await uploadToMinio(bucket, uploadPath, file);

            if (isSuccess) {
                const args  = `${bucket},user1/project1/,${file.name}`;

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
                    onClick={handleClick}
            >
                👉 Simulation Start
            </button>
            <input
                type="file"
                ref={hiddenFileInput}
                onChange={handleChange}
                style={{ display: 'none' }}
            />
        </div>
    );
};