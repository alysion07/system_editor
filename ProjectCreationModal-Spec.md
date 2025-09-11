# ProjectCreationModal 확장 기능명세서

## 컴포넌트 개요 및 책임

ProjectCreationModal은 기존 프로젝트 생성 기능을 확장하여 다양한 시스템 타입에 대한 프로젝트 생성을 지원하는 모달 컴포넌트입니다. 시스템 타입 선택, 시스템별 초기 설정 구성, 확장된 프로젝트 메타데이터 관리를 담당하며, 각 시스템의 요구사항에 맞는 프로젝트 초기화를 수행합니다.

**주요 책임:**
- 다중 시스템 타입 프로젝트 생성 지원
- 시스템별 초기 설정 및 구성 관리
- 확장된 프로젝트 메타데이터 처리
- 프로젝트 템플릿 및 사전 설정 관리
- 시스템 호환성 검증 및 요구사항 확인

## 주요 기능 및 메서드

### 1. 시스템 타입 선택
```jsx
// 시스템 타입 선택 단계
const SystemTypeSelection = ({ availableSystems, onSystemSelect }) => {
  const [selectedSystem, setSelectedSystem] = useState(null);
  
  const handleSystemSelect = (system) => {
    setSelectedSystem(system);
    onSystemSelect(system);
    
    // 시스템별 기본 설정 로드
    loadSystemDefaults(system.id);
  };
  
  return (
    <div className="system-type-selection">
      <h3>프로젝트 시스템 타입 선택</h3>
      <div className="system-grid">
        {availableSystems.map(system => (
          <SystemTypeCard
            key={system.id}
            system={system}
            isSelected={selectedSystem?.id === system.id}
            onSelect={handleSystemSelect}
          />
        ))}
      </div>
    </div>
  );
};

// 시스템별 설정 로딩
const loadSystemDefaults = async (systemId) => {
  const defaults = await systemRegistry.getSystemDefaults(systemId);
  const templates = await systemRegistry.getSystemTemplates(systemId);
  
  return { defaults, templates };
};
```

### 2. 시스템별 초기 설정
```jsx
// 동적 설정 폼 생성
const SystemConfigurationForm = ({ system, config, onConfigChange }) => {
  const configSchema = system.getConfigSchema();
  const [formData, setFormData] = useState(config);
  
  const handleFieldChange = (fieldName, value) => {
    const updatedConfig = { ...formData, [fieldName]: value };
    setFormData(updatedConfig);
    onConfigChange(updatedConfig);
  };
  
  return (
    <DynamicForm
      schema={configSchema}
      data={formData}
      onChange={handleFieldChange}
      validation={system.validateConfig}
    />
  );
};

// 프리셋 관리
const PresetSelector = ({ systemId, onPresetSelect }) => {
  const [presets, setPresets] = useState([]);
  const [customPresets, setCustomPresets] = useState([]);
  
  useEffect(() => {
    loadSystemPresets(systemId).then(setPresets);
    loadUserPresets(systemId).then(setCustomPresets);
  }, [systemId]);
  
  return (
    <div className="preset-selector">
      <h4>프리셋 선택</h4>
      <div className="preset-list">
        {[...presets, ...customPresets].map(preset => (
          <PresetCard
            key={preset.id}
            preset={preset}
            onSelect={onPresetSelect}
          />
        ))}
      </div>
    </div>
  );
};
```

### 3. 프로젝트 메타데이터 확장
```jsx
// 확장된 메타데이터 폼
const ExtendedMetadataForm = ({ metadata, onMetadataChange }) => {
  const [formData, setFormData] = useState(metadata);
  
  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onMetadataChange(updated);
  };
  
  return (
    <div className="metadata-form">
      <BasicInfoSection
        data={formData.basic}
        onChange={(data) => handleChange('basic', data)}
      />
      
      <SystemSpecificSection
        systemId={formData.systemId}
        data={formData.systemSpecific}
        onChange={(data) => handleChange('systemSpecific', data)}
      />
      
      <TagsAndCategoriesSection
        tags={formData.tags}
        categories={formData.categories}
        onTagsChange={(tags) => handleChange('tags', tags)}
        onCategoriesChange={(categories) => handleChange('categories', categories)}
      />
      
      <ResourceSettingsSection
        resources={formData.resources}
        onChange={(resources) => handleChange('resources', resources)}
      />
    </div>
  );
};
```

## Props/Parameters 정의

### ProjectCreationModal Props
```typescript
interface ProjectCreationModalProps {
  // 모달 상태
  isOpen: boolean;
  onClose: () => void;
  
  // 시스템 관련
  availableSystems: SystemDefinition[];
  defaultSystemId?: string;
  systemRegistry: SystemRegistry;
  
  // 프로젝트 설정
  initialProjectData?: Partial<ProjectData>;
  templates?: ProjectTemplate[];
  
  // UI 옵션
  showAdvancedOptions?: boolean;
  allowSystemChange?: boolean;
  showPresets?: boolean;
  multiStepWizard?: boolean;
  
  // 검증 옵션
  validateOnChange?: boolean;
  requireSystemSelection?: boolean;
  
  // 이벤트 콜백
  onProjectCreate: (projectData: ProjectData) => Promise<void>;
  onSystemSelect?: (system: SystemDefinition) => void;
  onConfigChange?: (config: SystemConfig) => void;
  onValidationError?: (errors: ValidationError[]) => void;
  
  // 커스터마이제이션
  customSteps?: ModalStep[];
  customValidators?: ValidationFunction[];
}
```

### 확장된 ProjectData 인터페이스
```typescript
interface ProjectData {
  // 기본 정보
  name: string;
  description: string;
  
  // 시스템 정보
  systemId: string;
  systemVersion: string;
  systemConfig: SystemConfig;
  
  // 확장 메타데이터
  metadata: {
    // 기본 메타데이터
    author: string;
    version: string;
    createdAt: Date;
    tags: string[];
    categories: string[];
    
    // 시스템별 메타데이터
    systemSpecific: Record<string, any>;
    
    // 리소스 설정
    resources: {
      estimatedSize: number;
      complexity: 'low' | 'medium' | 'high';
      dependencies: string[];
    };
    
    // 프로젝트 설정
    settings: {
      privacy: 'private' | 'public' | 'team';
      backup: boolean;
      versioning: boolean;
      collaboration: boolean;
    };
  };
  
  // 초기 데이터
  initialData?: any;
  
  // 템플릿 정보
  templateId?: string;
  presetId?: string;
}
```

### ModalStep 인터페이스
```typescript
interface ModalStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<StepProps>;
  validation?: (data: any) => ValidationResult;
  canSkip?: boolean;
  dependsOn?: string[];
}

interface StepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onValidation: (isValid: boolean) => void;
}
```

## 상태 관리 방식

### 모달 내부 상태
```jsx
const ProjectCreationModal = (props) => {
  // 단계 관리
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  
  // 데이터 상태
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [projectData, setProjectData] = useState({});
  const [systemConfig, setSystemConfig] = useState({});
  
  // UI 상태
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // 검증 상태
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  // 단계별 상태 관리
  const steps = [
    {
      id: 'system-selection',
      title: '시스템 선택',
      component: SystemTypeSelection,
      validation: validateSystemSelection
    },
    {
      id: 'basic-info',
      title: '기본 정보',
      component: BasicInfoForm,
      validation: validateBasicInfo
    },
    {
      id: 'system-config',
      title: '시스템 설정',
      component: SystemConfigurationForm,
      validation: validateSystemConfig,
      dependsOn: ['system-selection']
    },
    {
      id: 'metadata',
      title: '프로젝트 설정',
      component: ExtendedMetadataForm,
      validation: validateMetadata
    },
    {
      id: 'review',
      title: '검토 및 생성',
      component: ProjectReviewForm,
      validation: validateComplete
    }
  ];
};
```

### Zustand Store 확장
```javascript
const useProjectCreationStore = create((set, get) => ({
  // 프로젝트 생성 상태
  creationInProgress: false,
  currentProjectData: null,
  
  // 템플릿 및 프리셋
  availableTemplates: [],
  userPresets: [],
  
  // 최근 생성 이력
  recentProjects: [],
  favoriteTemplates: [],
  
  // 액션
  startProjectCreation: (systemId) => {
    set({ 
      creationInProgress: true,
      currentProjectData: { systemId }
    });
  },
  
  updateProjectData: (updates) => set((state) => ({
    currentProjectData: { ...state.currentProjectData, ...updates }
  })),
  
  completeProjectCreation: (projectData) => {
    set((state) => ({
      creationInProgress: false,
      currentProjectData: null,
      recentProjects: [projectData, ...state.recentProjects.slice(0, 9)]
    }));
  },
  
  loadTemplates: async (systemId) => {
    const templates = await fetchSystemTemplates(systemId);
    set({ availableTemplates: templates });
  },
}));
```

## 이벤트 및 콜백

### 단계 전환 이벤트
```jsx
// 다음 단계로 이동
const handleNextStep = async () => {
  const currentStepData = steps[currentStep];
  
  // 현재 단계 검증
  const validationResult = await currentStepData.validation?.(projectData);
  
  if (!validationResult?.isValid) {
    setValidationErrors(validationResult?.errors || {});
    return;
  }
  
  // 완료된 단계로 마킹
  setCompletedSteps(prev => new Set([...prev, currentStep]));
  
  // 다음 단계로 이동
  if (currentStep < steps.length - 1) {
    setCurrentStep(currentStep + 1);
  } else {
    await handleProjectCreation();
  }
};

// 이전 단계로 이동
const handlePreviousStep = () => {
  if (currentStep > 0) {
    setCurrentStep(currentStep - 1);
  }
};

// 특정 단계로 점프
const jumpToStep = (stepIndex) => {
  if (stepIndex < currentStep || completedSteps.has(stepIndex)) {
    setCurrentStep(stepIndex);
  }
};
```

### 프로젝트 생성 이벤트
```jsx
// 프로젝트 생성 처리
const handleProjectCreation = async () => {
  setIsLoading(true);
  
  try {
    // 최종 데이터 검증
    await validateProjectData(projectData);
    
    // 시스템별 초기화 데이터 준비
    const initialData = await prepareInitialData(selectedSystem, systemConfig);
    
    // 프로젝트 생성 요청
    const finalProjectData = {
      ...projectData,
      systemConfig,
      initialData,
      createdAt: new Date()
    };
    
    await props.onProjectCreate(finalProjectData);
    
    // 성공 처리
    showSuccessNotification('프로젝트가 성공적으로 생성되었습니다.');
    props.onClose();
    
  } catch (error) {
    console.error('프로젝트 생성 실패:', error);
    showErrorNotification('프로젝트 생성 중 오류가 발생했습니다.');
    props.onValidationError?.([{ field: 'general', message: error.message }]);
  } finally {
    setIsLoading(false);
  }
};

// 시스템 선택 이벤트
const handleSystemSelect = async (system) => {
  setSelectedSystem(system);
  props.onSystemSelect?.(system);
  
  // 시스템별 기본 설정 로드
  const defaults = await loadSystemDefaults(system.id);
  setSystemConfig(defaults);
  
  // 프로젝트 데이터 업데이트
  setProjectData(prev => ({
    ...prev,
    systemId: system.id,
    systemVersion: system.version
  }));
};
```

## 에러 핸들링

### 검증 에러 처리
```jsx
const ValidationErrorDisplay = ({ errors, onRetry }) => {
  if (!errors || Object.keys(errors).length === 0) return null;
  
  return (
    <div className="validation-errors">
      <h4>다음 항목을 확인해주세요:</h4>
      <ul>
        {Object.entries(errors).map(([field, error]) => (
          <li key={field}>
            <strong>{getFieldDisplayName(field)}:</strong> {error.message}
          </li>
        ))}
      </ul>
      
      <button onClick={onRetry} className="retry-button">
        다시 시도
      </button>
    </div>
  );
};

// 시스템별 검증
const validateSystemRequirements = async (system, config) => {
  const requirements = system.metadata.resourceRequirements;
  const errors = [];
  
  // 메모리 요구사항 검증
  if (config.performance?.maxMemory < requirements.minMemory) {
    errors.push({
      field: 'memory',
      message: `최소 ${requirements.minMemory}MB 메모리가 필요합니다.`
    });
  }
  
  // 필수 기능 검증
  for (const feature of requirements.requiredFeatures) {
    if (!config.features?.[feature]) {
      errors.push({
        field: 'features',
        message: `'${feature}' 기능이 필요합니다.`
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.reduce((acc, err) => ({ ...acc, [err.field]: err }), {})
  };
};
```

### 네트워크 에러 처리
```jsx
const handleNetworkError = (error, context) => {
  console.error(`네트워크 에러 (${context}):`, error);
  
  const errorHandlers = {
    'template-load': () => {
      showErrorDialog('템플릿을 불러올 수 없습니다. 네트워크 연결을 확인해주세요.');
      return { fallback: 'default-template' };
    },
    
    'project-create': () => {
      showErrorDialog('프로젝트 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
      return { retry: true, delay: 3000 };
    },
    
    'system-validate': () => {
      showWarningDialog('시스템 검증에 실패했습니다. 기본 설정으로 진행하시겠습니까?');
      return { continue: true, useDefaults: true };
    }
  };
  
  return errorHandlers[context]?.() || { retry: false };
};
```

## 성능 고려사항

### 1. 코드 분할 및 지연 로딩
```jsx
// 시스템별 컴포넌트 지연 로딩
const SystemConfigComponents = {
  'node-editor': lazy(() => import('./configs/NodeEditorConfig')),
  'task-manager': lazy(() => import('./configs/TaskManagerConfig')),
  'project-viewer': lazy(() => import('./configs/ProjectViewerConfig'))
};

// 동적 컴포넌트 로딩
const DynamicSystemConfig = ({ systemId, ...props }) => {
  const Component = SystemConfigComponents[systemId];
  
  if (!Component) {
    return <GenericSystemConfig systemId={systemId} {...props} />;
  }
  
  return (
    <Suspense fallback={<ConfigLoadingSkeleton />}>
      <Component {...props} />
    </Suspense>
  );
};

// 템플릿 지연 로딩
const useTemplates = (systemId) => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (systemId) {
      setIsLoading(true);
      loadSystemTemplates(systemId)
        .then(setTemplates)
        .finally(() => setIsLoading(false));
    }
  }, [systemId]);
  
  return { templates, isLoading };
};
```

### 2. 폼 최적화
```jsx
// 디바운스된 검증
const useDebouncedValidation = (data, validator, delay = 500) => {
  const [validationResult, setValidationResult] = useState({ isValid: true });
  const [isValidating, setIsValidating] = useState(false);
  
  useEffect(() => {
    setIsValidating(true);
    
    const timer = setTimeout(async () => {
      try {
        const result = await validator(data);
        setValidationResult(result);
      } catch (error) {
        setValidationResult({ isValid: false, errors: { general: error } });
      } finally {
        setIsValidating(false);
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, [data, validator, delay]);
  
  return { validationResult, isValidating };
};

// 폼 데이터 메모이제이션
const useOptimizedFormData = () => {
  const [formData, setFormData] = useState({});
  
  const updateField = useCallback((field, value) => {
    setFormData(prev => {
      if (prev[field] === value) return prev;
      return { ...prev, [field]: value };
    });
  }, []);
  
  const updateFields = useCallback((updates) => {
    setFormData(prev => {
      const hasChanges = Object.entries(updates).some(([key, value]) => 
        prev[key] !== value
      );
      return hasChanges ? { ...prev, ...updates } : prev;
    });
  }, []);
  
  return { formData, updateField, updateFields };
};
```

## 사용 예시

### 1. 기본 모달 사용
```jsx
const Dashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const availableSystems = useSystemStore(state => state.availableSystems);
  
  const handleProjectCreate = async (projectData) => {
    try {
      await createProject(projectData);
      
      // 프로젝트 목록 새로고침
      refreshProjectList();
      
      // 성공 알림
      showNotification('프로젝트가 생성되었습니다.');
      
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      throw error; // 모달에서 에러 처리
    }
  };
  
  return (
    <div className="dashboard">
      <button onClick={() => setShowCreateModal(true)}>
        새 프로젝트 생성
      </button>
      
      <ProjectCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        availableSystems={availableSystems}
        onProjectCreate={handleProjectCreate}
        showAdvancedOptions={true}
        multiStepWizard={true}
      />
    </div>
  );
};
```

### 2. 커스텀 단계 추가
```jsx
const CustomProjectCreationModal = () => {
  const customSteps = [
    {
      id: 'team-setup',
      title: '팀 설정',
      component: TeamSetupForm,
      validation: validateTeamSetup
    },
    {
      id: 'integration',
      title: '외부 연동',
      component: IntegrationForm,
      validation: validateIntegrations,
      canSkip: true
    }
  ];
  
  return (
    <ProjectCreationModal
      customSteps={customSteps}
      // ... 기타 props
    />
  );
};

// 커스텀 단계 컴포넌트
const TeamSetupForm = ({ data, onChange, onValidation }) => {
  const [teamData, setTeamData] = useState(data.team || {});
  
  const handleTeamChange = (updates) => {
    const newTeamData = { ...teamData, ...updates };
    setTeamData(newTeamData);
    onChange({ ...data, team: newTeamData });
    
    // 실시간 검증
    const isValid = validateTeamData(newTeamData);
    onValidation(isValid);
  };
  
  return (
    <div className="team-setup-form">
      {/* 팀 설정 폼 컨텐츠 */}
    </div>
  );
};
```

### 3. 시스템별 템플릿 사용
```jsx
const TemplateBasedCreation = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    
    // 템플릿 기반 초기 데이터 설정
    const initialData = {
      name: template.defaultName || '',
      systemId: template.systemId,
      systemConfig: template.defaultConfig,
      metadata: {
        ...template.metadata,
        templateId: template.id
      }
    };
    
    return initialData;
  };
  
  return (
    <ProjectCreationModal
      initialProjectData={selectedTemplate ? 
        handleTemplateSelect(selectedTemplate) : 
        undefined
      }
      showPresets={true}
      templates={templates}
      onSystemSelect={(system) => {
        loadSystemTemplates(system.id);
      }}
    />
  );
};
```