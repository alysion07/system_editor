// src/components/dashboard/CreateProjectModal.jsx
import React, { useState } from 'react';
import { SYSTEM_TYPES, getSystemTypesList } from '../../utils/systemTypes';

const CreateProjectModal = ({ open, onClose, onCreate, existingProjects = [] }) => {
  const [projectName, setProjectName] = useState('');
  const [systemType, setSystemType] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  const systemTypesList = getSystemTypesList();

  const validateForm = () => {
    const newErrors = {};

    if (!projectName.trim()) {
      newErrors.projectName = '프로젝트 이름을 입력해주세요';
    } else if (projectName.trim().length < 2) {
      newErrors.projectName = '프로젝트 이름은 최소 2자 이상이어야 합니다';
    } else if (existingProjects.includes(projectName.trim())) {
      newErrors.projectName = '이미 존재하는 프로젝트 이름입니다';
    }

    if (!systemType) {
      newErrors.systemType = '계통 설계 종류를 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onCreate({
        name: projectName.trim(),
        systemType,
        description: description.trim(),
        createdAt: new Date().toISOString()
      });
      // Reset form
      setProjectName('');
      setSystemType('');
      setDescription('');
      setErrors({});
    }
  };

  const handleClose = () => {
    // Reset form on close
    setProjectName('');
    setSystemType('');
    setDescription('');
    setErrors({});
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
      <div className="bg-card-background/95 border border-border-color text-text-color p-8 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-card-title-color mb-2">새 프로젝트 생성</h2>
          <p className="text-light-text-color text-sm">
            프로젝트 정보와 설계할 계통 종류를 선택해주세요
          </p>
        </div>

        {/* Project Name Input */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-light-text-color">
            프로젝트 이름 <span className="text-danger-color">*</span>
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              if (errors.projectName) {
                setErrors({ ...errors, projectName: '' });
              }
            }}
            placeholder="예: NPP_System_Analysis"
            className={`w-full px-4 py-3 rounded-lg bg-panel-bg/50 border ${
              errors.projectName ? 'border-danger-color' : 'border-border-color'
            } text-text-color placeholder-light-text-color/50 focus:outline-none focus:border-primary-color transition-colors`}
          />
          {errors.projectName && (
            <p className="mt-1 text-sm text-danger-color">{errors.projectName}</p>
          )}
        </div>

        {/* System Type Selection */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-light-text-color">
            계통 설계 종류 <span className="text-danger-color">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {systemTypesList.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setSystemType(type.id);
                  if (errors.systemType) {
                    setErrors({ ...errors, systemType: '' });
                  }
                }}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  systemType === type.id
                    ? 'border-primary-color bg-primary-color/10'
                    : 'border-border-color bg-panel-bg/30 hover:border-primary-color/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <i className={`fas ${type.iconClass} text-2xl`} style={{ color: type.color }}></i>
                  <div className="flex-1">
                    <div className="font-semibold text-text-color">{type.name}</div>
                    <div className="text-xs text-light-text-color/70 mt-1">
                      {type.nameEn}
                    </div>
                    <div className="text-xs text-light-text-color/60 mt-2">
                      {type.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {errors.systemType && (
            <p className="mt-2 text-sm text-danger-color">{errors.systemType}</p>
          )}
        </div>

        {/* Description (Optional) */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-light-text-color">
            프로젝트 설명 (선택사항)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="프로젝트에 대한 간단한 설명을 입력하세요..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-panel-bg/50 border border-border-color text-text-color placeholder-light-text-color/50 focus:outline-none focus:border-primary-color transition-colors resize-none"
          />
        </div>

        {/* Selected System Type Details */}
        {systemType && (
          <div className="mb-6 p-4 rounded-lg bg-panel-bg/30 border border-border-color/50">
            <div className="flex items-center space-x-2 mb-2">
              <i
                className={`fas ${SYSTEM_TYPES[Object.keys(SYSTEM_TYPES).find(key => SYSTEM_TYPES[key].id === systemType)]?.iconClass} text-lg`}
                style={{ color: SYSTEM_TYPES[Object.keys(SYSTEM_TYPES).find(key => SYSTEM_TYPES[key].id === systemType)]?.color }}
              ></i>
              <h4 className="font-semibold text-text-color">
                선택된 계통: {SYSTEM_TYPES[Object.keys(SYSTEM_TYPES).find(key => SYSTEM_TYPES[key].id === systemType)]?.name}
              </h4>
            </div>
            <p className="text-sm text-light-text-color/80">
              사용 가능한 컴포넌트: {
                SYSTEM_TYPES[Object.keys(SYSTEM_TYPES).find(key => SYSTEM_TYPES[key].id === systemType)]?.components.join(', ')
              }
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-lg bg-gray-700/80 text-gray-300 hover:bg-gray-600/80 transition-all duration-300 font-semibold"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-lg bg-primary-color text-white hover:bg-opacity-80 transition-all duration-300 font-semibold shadow-lg disabled:bg-disabled-bg disabled:cursor-not-allowed"
            disabled={!projectName.trim() || !systemType}
          >
            프로젝트 생성
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;