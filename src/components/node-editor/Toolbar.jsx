// Toolbar.jsx
import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { ProjectService } from "../../services/projectService";
import { BsFillPlayFill } from 'react-icons/bs';
import './styles/Toolbar.css';
import  useProjectStore  from "../store/projectStore"

const Toolbar = ({
                     onUndo,
                     onRedo,
                     canUndo,
                     canRedo,
                     onExport,
                     onGeneralSetting,
                     onSimplify,
                     isSimplified,
                     onSave
                 }) => {

    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const { userId, projectName } = useProjectStore();

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleClick = async () => {

        try {

            if (onSave) {
                await onSave(); // 상태 저장
            }

            // TODO
            // components 구현 완료 후, 실제 입력된 값을 기반으로 인풋 파일을 생성하고 fetch 할 수 있도록 구현 필요
            //// public/resource/smart.i 파일을 fetch로 읽기
            const response = await fetch('/resource/SMART.i');
            if (!response.ok) throw new Error('파일을 불러올 수 없습니다.');
            const fileBlob = await response.blob();

            // Blob을 File 객체로 변환 (Minio 업로드 함수가 File 필요시)
            const file = new File([fileBlob], 'SMART.i', { type: fileBlob.type });
            const isSuccess = await ProjectService.uploadProjectFile(userId, projectName, file);

            if (isSuccess) {
                const args = `v-smr,${userId}/${projectName},SMART.i`;
                navigate("/task", { state: args });
            } else {
                alert("업로드 실패!");
            }

        } catch (error) {
            alert('업로드 실패: ' + error.message);
            console.error('업로드 실패:', error);
        }
    };

    return (
        <div className="editor-toolbar">
            <div className="toolbar-group">
                <button
                    className="toolbar-button"
                    onClick={onGeneralSetting}
                    title="General Setting"
                >
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

            <div className="toolbar-right">
                <div className="toolbar-group">
                    <button
                        className="toolbar-button"
                        title="프로젝트 저장"
                        onClick={onSave}
                        disabled={!projectName}  // 이름 없으면 저장 금지
                    >
                        <i className="fa-solid fa-save"></i>
                    </button>
                    <div className="toolbar-divider"></div>
                    <button className="toolbar-button" onClick={onExport} title="내보내기">
                        <i className="fa-solid fa-file-export"></i>
                    </button>
                </div>

                <button
                    className="bg-primary-color text-white px-4 py-1 rounded-lg shadow-lg hover:bg-opacity-80 transition-all duration-300 font-semibold flex items-center gap-2"
                    onClick={handleClick}
                >
                    <BsFillPlayFill size={22} />
                    Simulation Start
                </button>
            </div>

        </div>
    );
};

export default Toolbar;