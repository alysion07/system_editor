# SystemRegistry 컴포넌트 기능명세서

## 컴포넌트 개요 및 책임

SystemRegistry는 플러그인 방식으로 시스템을 동적으로 등록, 관리, 로딩하는 핵심 컴포넌트입니다. 다양한 시스템 타입의 발견, 등록, 의존성 관리를 담당하며, 런타임에 새로운 시스템을 추가하거나 제거할 수 있는 확장 가능한 아키텍처를 제공합니다.

**주요 책임:**
- 시스템 플러그인의 동적 로딩 및 등록
- 시스템 간 의존성 관리 및 순환 참조 검증
- 시스템 메타데이터 관리 및 검색
- 시스템 생명주기 관리 (등록/해제)

## 주요 기능 및 메서드

### 1. 시스템 등록 관리
```javascript
// 시스템 등록
registerSystem(systemDefinition)
// 시스템 해제
unregisterSystem(systemId)
// 모든 시스템 목록 조회
getAllSystems()
// 시스템 ID로 조회
getSystemById(systemId)
```

### 2. 의존성 관리
```javascript
// 의존성 그래프 검증
validateDependencies(systemId)
// 로딩 순서 결정
resolveDependencyOrder(systemIds)
// 순환 참조 검사
checkCircularDependencies()
```

### 3. 동적 로딩
```javascript
// 시스템 플러그인 동적 로딩
loadSystemPlugin(pluginPath)
// 시스템 초기화
initializeSystem(systemId, config)
// 시스템 정리
cleanupSystem(systemId)
```

## Props/Parameters 정의

### SystemRegistry Props
```typescript
interface SystemRegistryProps {
  // 기본 시스템 목록
  defaultSystems?: SystemDefinition[];
  // 플러그인 디렉토리 경로
  pluginDirectory?: string;
  // 자동 발견 활성화
  autoDiscovery?: boolean;
  // 의존성 검증 활성화
  validateDependencies?: boolean;
  // 이벤트 콜백
  onSystemRegistered?: (system: SystemDefinition) => void;
  onSystemUnregistered?: (systemId: string) => void;
  onError?: (error: SystemRegistryError) => void;
}
```

### SystemDefinition 인터페이스
```typescript
interface SystemDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  // 시스템 구현 클래스
  implementation: typeof AbstractSystem;
  // 의존성 목록
  dependencies: string[];
  // 메타데이터
  metadata: {
    category: string;
    tags: string[];
    supportedFeatures: string[];
    minVersion: string;
  };
  // 설정 스키마
  configSchema: JSONSchema;
}
```

## 상태 관리 방식

### 내부 상태
```javascript
const [registeredSystems, setRegisteredSystems] = useState(new Map());
const [dependencyGraph, setDependencyGraph] = useState(new Map());
const [loadingStates, setLoadingStates] = useState(new Map());
const [errors, setErrors] = useState([]);
```

### Zustand Store 확장
```javascript
// systemStore.js에 추가
const useSystemStore = create((set, get) => ({
  registry: null,
  availableSystems: [],
  
  // SystemRegistry 인스턴스 설정
  setRegistry: (registry) => set({ registry }),
  
  // 사용 가능한 시스템 목록 업데이트
  updateAvailableSystems: (systems) => set({ availableSystems: systems }),
  
  // 시스템 등록 액션
  registerSystem: async (systemDef) => {
    const { registry } = get();
    if (registry) {
      await registry.registerSystem(systemDef);
      get().updateAvailableSystems(registry.getAllSystems());
    }
  },
}));
```

## 이벤트 및 콜백

### 등록 이벤트
```javascript
// 시스템 등록 완료
onSystemRegistered: (system) => {
  console.log(`시스템 등록됨: ${system.name}`);
  // UI 업데이트, 알림 표시 등
}

// 시스템 등록 해제
onSystemUnregistered: (systemId) => {
  console.log(`시스템 해제됨: ${systemId}`);
  // 관련 프로젝트 정리, UI 업데이트
}
```

### 의존성 해결 이벤트
```javascript
// 의존성 해결 시작
onDependencyResolutionStart: (systemId) => {
  // 로딩 표시기 표시
}

// 의존성 해결 완료
onDependencyResolutionComplete: (resolved) => {
  // 로딩 완료, 시스템 활성화
}
```

## 에러 핸들링

### 에러 타입 정의
```javascript
class SystemRegistryError extends Error {
  constructor(type, systemId, details) {
    super(`SystemRegistry Error: ${type}`);
    this.type = type;
    this.systemId = systemId;
    this.details = details;
  }
}

// 에러 타입
const ERROR_TYPES = {
  DUPLICATE_SYSTEM: 'DUPLICATE_SYSTEM',
  MISSING_DEPENDENCY: 'MISSING_DEPENDENCY',
  CIRCULAR_DEPENDENCY: 'CIRCULAR_DEPENDENCY',
  INVALID_SYSTEM: 'INVALID_SYSTEM',
  LOADING_FAILED: 'LOADING_FAILED'
};
```

### 에러 처리 로직
```javascript
try {
  await registry.registerSystem(systemDef);
} catch (error) {
  if (error instanceof SystemRegistryError) {
    switch (error.type) {
      case ERROR_TYPES.DUPLICATE_SYSTEM:
        // 중복 시스템 처리
        break;
      case ERROR_TYPES.CIRCULAR_DEPENDENCY:
        // 순환 참조 에러 처리
        break;
      default:
        // 일반적인 에러 처리
    }
  }
}
```

## 성능 고려사항

### 1. 지연 로딩
- 시스템 플러그인은 필요할 때만 로딩
- 의존성 해결은 캐싱을 통해 최적화
- 메타데이터만 먼저 로딩하고 구현체는 지연 로딩

### 2. 메모리 관리
```javascript
// 사용하지 않는 시스템 정리
cleanupUnusedSystems() {
  const activeSystems = this.getActiveSystems();
  const allSystems = this.getAllSystems();
  
  allSystems.forEach(system => {
    if (!activeSystems.includes(system.id)) {
      this.unloadSystemResources(system.id);
    }
  });
}
```

### 3. 병렬 처리
```javascript
// 병렬 시스템 로딩
async loadSystemsInParallel(systemIds) {
  const loadPromises = systemIds.map(id => this.loadSystem(id));
  const results = await Promise.allSettled(loadPromises);
  
  // 성공/실패 결과 처리
  return results.map((result, index) => ({
    systemId: systemIds[index],
    success: result.status === 'fulfilled',
    data: result.value || result.reason
  }));
}
```

## 사용 예시

### 1. 기본 사용법
```jsx
import SystemRegistry from './SystemRegistry';
import { defaultSystems } from './systems/index';

function App() {
  const handleSystemRegistered = (system) => {
    console.log('새 시스템 등록:', system.name);
  };

  return (
    <SystemRegistry
      defaultSystems={defaultSystems}
      autoDiscovery={true}
      validateDependencies={true}
      onSystemRegistered={handleSystemRegistered}
    />
  );
}
```

### 2. 동적 시스템 추가
```jsx
const DynamicSystemLoader = () => {
  const registry = useSystemStore(state => state.registry);

  const loadCustomSystem = async () => {
    try {
      const systemDef = await import('./plugins/custom-system');
      await registry.registerSystem(systemDef.default);
    } catch (error) {
      console.error('시스템 로딩 실패:', error);
    }
  };

  return (
    <button onClick={loadCustomSystem}>
      커스텀 시스템 로딩
    </button>
  );
};
```

### 3. 의존성 관리 예시
```javascript
// 시스템 정의 예시
const nodeEditorSystem = {
  id: 'node-editor',
  name: 'Node Editor System',
  dependencies: ['core-ui', 'reactflow'],
  implementation: NodeEditorSystem,
  // ... 기타 메타데이터
};

// 의존성 순서 해결
const loadOrder = registry.resolveDependencyOrder(['node-editor']);
// 결과: ['core-ui', 'reactflow', 'node-editor']
```