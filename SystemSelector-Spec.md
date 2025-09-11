# SystemSelector UI 컴포넌트 기능명세서

## 컴포넌트 개요 및 책임

SystemSelector는 Dashboard에서 사용자가 다양한 시스템 중 하나를 선택할 수 있는 UI 컴포넌트입니다. 사용 가능한 시스템 목록을 표시하고, 각 시스템의 정보를 시각적으로 제공하며, 시스템 선택 시 필요한 유효성 검사 및 전환 처리를 담당합니다.

**주요 책임:**
- 사용 가능한 시스템 목록 시각화
- 시스템 정보 및 메타데이터 표시
- 시스템 선택 및 전환 인터페이스 제공
- 시스템 호환성 및 요구사항 검증
- 선택된 시스템에 따른 동적 UI 변화

## 주요 기능 및 메서드

### 1. 시스템 목록 렌더링
```jsx
// 시스템 카드 목록 표시
const renderSystemList = () => {
  return availableSystems.map(system => (
    <SystemCard
      key={system.id}
      system={system}
      isSelected={selectedSystem?.id === system.id}
      onSelect={handleSystemSelect}
      isCompatible={checkCompatibility(system)}
    />
  ));
};

// 시스템 필터링
const filterSystems = (systems, filterCriteria) => {
  return systems.filter(system => {
    return matchesCategory(system, filterCriteria.category) &&
           matchesTags(system, filterCriteria.tags) &&
           meetsRequirements(system, filterCriteria.requirements);
  });
};
```

### 2. 시스템 선택 처리
```jsx
// 시스템 선택 핸들러
const handleSystemSelect = async (system) => {
  setIsProcessing(true);
  
  try {
    // 1. 호환성 검사
    const compatibilityResult = await checkSystemCompatibility(system);
    if (!compatibilityResult.compatible) {
      showIncompatibilityDialog(compatibilityResult.issues);
      return;
    }
    
    // 2. 요구사항 검증
    const requirements = await validateSystemRequirements(system);
    if (!requirements.satisfied) {
      showRequirementsDialog(requirements.missing);
      return;
    }
    
    // 3. 시스템 선택 완료
    setSelectedSystem(system);
    onSystemSelected(system);
    
  } catch (error) {
    handleSelectionError(error);
  } finally {
    setIsProcessing(false);
  }
};
```

### 3. 시스템 정보 표시
```jsx
// 상세 정보 패널
const SystemInfoPanel = ({ system }) => (
  <div className="system-info-panel">
    <SystemHeader system={system} />
    <SystemCapabilities capabilities={system.metadata.capabilities} />
    <SystemRequirements requirements={system.metadata.resourceRequirements} />
    <SystemCompatibility compatibility={system.metadata.compatibleSystems} />
  </div>
);

// 시스템 메트릭 표시
const SystemMetrics = ({ systemId }) => {
  const metrics = useSystemMetrics(systemId);
  
  return (
    <div className="system-metrics">
      <MetricItem label="성능" value={metrics.performance} />
      <MetricItem label="메모리 사용량" value={`${metrics.memoryUsage}MB`} />
      <MetricItem label="활성 프로젝트" value={metrics.activeProjects} />
    </div>
  );
};
```

## Props/Parameters 정의

### SystemSelector Props
```typescript
interface SystemSelectorProps {
  // 사용 가능한 시스템 목록
  availableSystems: SystemDefinition[];
  
  // 현재 선택된 시스템
  selectedSystem?: SystemDefinition;
  
  // 표시 모드
  displayMode?: 'grid' | 'list' | 'carousel';
  
  // 필터 옵션
  filterOptions?: {
    categories?: string[];
    tags?: string[];
    capabilities?: string[];
    showIncompatible?: boolean;
  };
  
  // 정렬 옵션
  sortBy?: 'name' | 'category' | 'recent' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  
  // UI 옵션
  showSystemInfo?: boolean;
  showMetrics?: boolean;
  allowMultiSelect?: boolean;
  
  // 이벤트 콜백
  onSystemSelected: (system: SystemDefinition) => void;
  onSystemDeselected?: (systemId: string) => void;
  onSystemHover?: (system: SystemDefinition) => void;
  onSystemDoubleClick?: (system: SystemDefinition) => void;
  
  // 상태 콜백
  onLoadingStart?: () => void;
  onLoadingEnd?: () => void;
  onError?: (error: Error) => void;
  
  // 커스터마이제이션
  customSystemCard?: React.ComponentType<SystemCardProps>;
  customInfoPanel?: React.ComponentType<SystemInfoPanelProps>;
}
```

### SystemCard Props
```typescript
interface SystemCardProps {
  system: SystemDefinition;
  isSelected: boolean;
  isCompatible: boolean;
  showMetrics?: boolean;
  size?: 'small' | 'medium' | 'large';
  
  onSelect: (system: SystemDefinition) => void;
  onInfo?: (system: SystemDefinition) => void;
  onSettings?: (system: SystemDefinition) => void;
}
```

### SystemDefinition 확장
```typescript
interface SystemDefinition {
  // 기본 정보
  id: string;
  name: string;
  version: string;
  description: string;
  
  // 시각적 정보
  icon?: string;
  thumbnail?: string;
  color?: string;
  
  // 분류 정보
  category: string;
  tags: string[];
  
  // 상태 정보
  status: 'available' | 'deprecated' | 'beta' | 'experimental';
  popularity: number;
  lastUsed?: Date;
  
  // 메타데이터
  metadata: SystemMetadata;
}
```

## 상태 관리 방식

### 컴포넌트 내부 상태
```jsx
const SystemSelector = (props) => {
  // 선택 상태
  const [selectedSystems, setSelectedSystems] = useState(new Set());
  const [hoveredSystem, setHoveredSystem] = useState(null);
  
  // 필터 및 정렬 상태
  const [filters, setFilters] = useState(props.filterOptions || {});
  const [sortConfig, setSortConfig] = useState({
    sortBy: props.sortBy || 'name',
    sortOrder: props.sortOrder || 'asc'
  });
  
  // UI 상태
  const [isLoading, setIsLoading] = useState(false);
  const [displayMode, setDisplayMode] = useState(props.displayMode || 'grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // 에러 상태
  const [error, setError] = useState(null);
  const [incompatibleSystems, setIncompatibleSystems] = useState(new Set());
};
```

### Zustand Store 통합
```javascript
const useSystemSelectorStore = create((set, get) => ({
  // 시스템 목록 상태
  availableSystems: [],
  filteredSystems: [],
  
  // 선택 상태
  selectedSystemIds: new Set(),
  lastSelectedSystem: null,
  
  // 필터 상태
  activeFilters: {},
  sortConfig: { sortBy: 'name', sortOrder: 'asc' },
  
  // UI 상태
  displayMode: 'grid',
  showSystemDetails: false,
  
  // 액션
  setAvailableSystems: (systems) => set({ availableSystems: systems }),
  
  applyFilters: (filters) => {
    set({ activeFilters: filters });
    get().updateFilteredSystems();
  },
  
  selectSystem: (systemId) => set((state) => ({
    selectedSystemIds: new Set([...state.selectedSystemIds, systemId]),
    lastSelectedSystem: systemId
  })),
  
  updateFilteredSystems: () => {
    const { availableSystems, activeFilters } = get();
    const filtered = filterAndSortSystems(availableSystems, activeFilters);
    set({ filteredSystems: filtered });
  },
}));
```

## 이벤트 및 콜백

### 시스템 선택 이벤트
```jsx
// 단일 선택
const handleSingleSelect = (system) => {
  if (selectedSystem?.id !== system.id) {
    setSelectedSystem(system);
    props.onSystemSelected(system);
    
    // 선택 히스토리 업데이트
    updateSelectionHistory(system);
  }
};

// 다중 선택
const handleMultiSelect = (system) => {
  const newSelection = new Set(selectedSystems);
  
  if (newSelection.has(system.id)) {
    newSelection.delete(system.id);
    props.onSystemDeselected?.(system.id);
  } else {
    newSelection.add(system.id);
    props.onSystemSelected(system);
  }
  
  setSelectedSystems(newSelection);
};
```

### 시스템 상호작용 이벤트
```jsx
// 호버 이벤트
const handleSystemHover = (system) => {
  setHoveredSystem(system);
  props.onSystemHover?.(system);
  
  // 미리보기 정보 로딩
  if (props.showSystemInfo) {
    preloadSystemInfo(system.id);
  }
};

// 더블클릭 이벤트
const handleSystemDoubleClick = (system) => {
  props.onSystemDoubleClick?.(system);
  
  // 즉시 활성화
  if (system.status === 'available') {
    activateSystemImmediately(system);
  }
};

// 컨텍스트 메뉴
const handleSystemContextMenu = (event, system) => {
  event.preventDefault();
  
  const menuItems = [
    { label: '선택', action: () => handleSystemSelect(system) },
    { label: '정보 보기', action: () => showSystemDetails(system) },
    { label: '설정', action: () => openSystemSettings(system) },
    system.status === 'deprecated' && { label: '제거', action: () => removeSystem(system) }
  ].filter(Boolean);
  
  showContextMenu(event.clientX, event.clientY, menuItems);
};
```

## 에러 핸들링

### 에러 타입 정의
```javascript
const SYSTEM_SELECTOR_ERRORS = {
  SYSTEM_LOAD_FAILED: 'SYSTEM_LOAD_FAILED',
  COMPATIBILITY_CHECK_FAILED: 'COMPATIBILITY_CHECK_FAILED',
  REQUIREMENTS_NOT_MET: 'REQUIREMENTS_NOT_MET',
  SYSTEM_UNAVAILABLE: 'SYSTEM_UNAVAILABLE',
  SELECTION_FAILED: 'SELECTION_FAILED'
};

class SystemSelectorError extends Error {
  constructor(type, systemId, details) {
    super(`SystemSelector Error: ${type}`);
    this.type = type;
    this.systemId = systemId;
    this.details = details;
  }
}
```

### 에러 처리 및 복구
```jsx
const ErrorBoundary = ({ children, onError }) => {
  return (
    <ErrorBoundary
      fallback={<SystemSelectorErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('SystemSelector Error:', error, errorInfo);
        onError?.(error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

const SystemSelectorErrorFallback = ({ error, retry }) => (
  <div className="system-selector-error">
    <h3>시스템 목록을 불러올 수 없습니다</h3>
    <p>{error.message}</p>
    <button onClick={retry}>다시 시도</button>
  </div>
);
```

### 호환성 검사 에러
```jsx
const handleCompatibilityError = (system, issues) => {
  const dialog = {
    title: `${system.name} 호환성 문제`,
    content: (
      <div>
        <p>다음 문제로 인해 시스템을 사용할 수 없습니다:</p>
        <ul>
          {issues.map((issue, index) => (
            <li key={index}>{issue.description}</li>
          ))}
        </ul>
      </div>
    ),
    actions: [
      { label: '취소', action: 'close' },
      { label: '강제 실행', action: () => forceSelectSystem(system), danger: true }
    ]
  };
  
  showDialog(dialog);
};
```

## 성능 고려사항

### 1. 가상화 및 페이지네이션
```jsx
// 대량 시스템 목록 가상화
const VirtualizedSystemList = ({ systems, itemHeight = 120 }) => {
  const listRef = useRef();
  
  const Row = ({ index, style }) => (
    <div style={style}>
      <SystemCard system={systems[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      ref={listRef}
      height={600}
      itemCount={systems.length}
      itemSize={itemHeight}
    >
      {Row}
    </FixedSizeList>
  );
};

// 무한 스크롤
const useInfiniteSystemList = (initialSystems, pageSize = 20) => {
  const [systems, setSystems] = useState(initialSystems.slice(0, pageSize));
  const [hasMore, setHasMore] = useState(initialSystems.length > pageSize);
  
  const loadMore = useCallback(() => {
    const currentLength = systems.length;
    const nextSystems = initialSystems.slice(currentLength, currentLength + pageSize);
    
    setSystems(prev => [...prev, ...nextSystems]);
    setHasMore(currentLength + nextSystems.length < initialSystems.length);
  }, [systems.length, initialSystems, pageSize]);
  
  return { systems, hasMore, loadMore };
};
```

### 2. 메모이제이션 및 캐싱
```jsx
// 시스템 카드 메모이제이션
const MemoizedSystemCard = memo(({ system, isSelected, onSelect }) => {
  return (
    <SystemCard
      system={system}
      isSelected={isSelected}
      onSelect={onSelect}
    />
  );
}, (prevProps, nextProps) => {
  return prevProps.system.id === nextProps.system.id &&
         prevProps.isSelected === nextProps.isSelected;
});

// 필터링 결과 캐싱
const useFilteredSystems = (systems, filters) => {
  return useMemo(() => {
    return filterAndSortSystems(systems, filters);
  }, [systems, filters]);
};

// 호환성 검사 결과 캐싱
const compatibilityCache = new Map();

const checkSystemCompatibility = useCallback(async (system) => {
  const cacheKey = `${system.id}-${system.version}`;
  
  if (compatibilityCache.has(cacheKey)) {
    return compatibilityCache.get(cacheKey);
  }
  
  const result = await performCompatibilityCheck(system);
  compatibilityCache.set(cacheKey, result);
  
  return result;
}, []);
```

### 3. 지연 로딩
```jsx
// 시스템 정보 지연 로딩
const LazySystemInfo = ({ systemId }) => {
  return (
    <Suspense fallback={<SystemInfoSkeleton />}>
      <SystemInfoComponent systemId={systemId} />
    </Suspense>
  );
};

// 이미지 지연 로딩
const LazySystemThumbnail = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div className="system-thumbnail">
      {!isLoaded && <ThumbnailSkeleton />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        style={{ display: isLoaded ? 'block' : 'none' }}
      />
    </div>
  );
};
```

## 사용 예시

### 1. 기본 사용법
```jsx
import SystemSelector from './SystemSelector';

const Dashboard = () => {
  const [selectedSystem, setSelectedSystem] = useState(null);
  const availableSystems = useSystemStore(state => state.availableSystems);
  
  const handleSystemSelected = (system) => {
    console.log('선택된 시스템:', system.name);
    setSelectedSystem(system);
    
    // 시스템 전환 로직
    switchToSystem(system.id);
  };
  
  return (
    <div className="dashboard">
      <SystemSelector
        availableSystems={availableSystems}
        selectedSystem={selectedSystem}
        displayMode="grid"
        showSystemInfo={true}
        onSystemSelected={handleSystemSelected}
        filterOptions={{
          categories: ['editor', 'viewer', 'manager'],
          showIncompatible: false
        }}
      />
    </div>
  );
};
```

### 2. 커스텀 시스템 카드
```jsx
const CustomSystemCard = ({ system, isSelected, onSelect }) => {
  return (
    <div 
      className={`custom-system-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(system)}
    >
      <div className="system-header">
        <img src={system.icon} alt={system.name} />
        <h3>{system.name}</h3>
        <span className="version">v{system.version}</span>
      </div>
      
      <div className="system-description">
        {system.description}
      </div>
      
      <div className="system-tags">
        {system.tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      
      <div className="system-actions">
        <button onClick={(e) => {
          e.stopPropagation();
          showSystemInfo(system);
        }}>
          정보
        </button>
      </div>
    </div>
  );
};

// 커스텀 카드 사용
<SystemSelector
  customSystemCard={CustomSystemCard}
  // ... 기타 props
/>
```

### 3. 필터링 및 검색
```jsx
const SystemSelectorWithFilters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  const filterOptions = {
    search: searchTerm,
    categories: categoryFilter !== 'all' ? [categoryFilter] : [],
    capabilities: [],
    showIncompatible: false
  };
  
  return (
    <div>
      <div className="system-filters">
        <input
          type="text"
          placeholder="시스템 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">모든 카테고리</option>
          <option value="editor">에디터</option>
          <option value="viewer">뷰어</option>
          <option value="manager">매니저</option>
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">이름순</option>
          <option value="recent">최근 사용순</option>
          <option value="popularity">인기순</option>
        </select>
      </div>
      
      <SystemSelector
        filterOptions={filterOptions}
        sortBy={sortBy}
        // ... 기타 props
      />
    </div>
  );
};
```