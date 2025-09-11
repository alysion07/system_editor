# SystemManager 서비스 클래스 기능명세서

## 컴포넌트 개요 및 책임

SystemManager는 활성 시스템의 관리 및 전환을 담당하는 핵심 서비스 클래스입니다. 현재 활성화된 시스템의 생명주기를 관리하고, 시스템 간 전환 시 필요한 검증 및 호환성 검사를 수행합니다. 또한 각 시스템별 설정과 메타데이터를 중앙에서 관리합니다.

**주요 책임:**
- 활성 시스템 관리 및 전환 제어
- 시스템별 설정 및 메타데이터 관리
- 시스템 호환성 검증 및 마이그레이션 처리
- 시스템 상태 모니터링 및 생명주기 관리

## 주요 기능 및 메서드

### 1. 시스템 활성화 관리
```javascript
class SystemManager {
  // 현재 활성 시스템 조회
  getCurrentSystem()
  
  // 시스템 활성화
  async activateSystem(systemId, config = {})
  
  // 시스템 비활성화
  async deactivateSystem(systemId)
  
  // 시스템 전환 (이전 시스템 비활성화 후 새 시스템 활성화)
  async switchSystem(fromSystemId, toSystemId, migrationData = {})
}
```

### 2. 설정 및 메타데이터 관리
```javascript
// 시스템 설정 관리
getSystemConfig(systemId)
updateSystemConfig(systemId, config)
resetSystemConfig(systemId)

// 메타데이터 관리
getSystemMetadata(systemId)
updateSystemMetadata(systemId, metadata)
getSystemCapabilities(systemId)
```

### 3. 호환성 검증
```javascript
// 시스템 호환성 검사
async checkCompatibility(sourceSystemId, targetSystemId)

// 데이터 마이그레이션 검증
async validateMigration(fromSystem, toSystem, data)

// 의존성 충돌 검사
checkDependencyConflicts(systemId)
```

### 4. 시스템 상태 모니터링
```javascript
// 시스템 상태 조회
getSystemStatus(systemId)

// 상태 변화 감지
monitorSystemHealth(systemId, callback)

// 성능 메트릭 수집
collectSystemMetrics(systemId)
```

## Props/Parameters 정의

### SystemManager 생성자 옵션
```typescript
interface SystemManagerOptions {
  // 시스템 레지스트리 참조
  registry: SystemRegistry;
  // 기본 시스템 ID
  defaultSystemId?: string;
  // 자동 복구 활성화
  autoRecovery?: boolean;
  // 상태 저장소
  stateStore?: SystemStateStore;
  // 이벤트 버스
  eventBus?: SystemEventBus;
  // 로깅 설정
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error';
    output: 'console' | 'file' | 'remote';
  };
}
```

### 시스템 설정 인터페이스
```typescript
interface SystemConfig {
  // 기본 설정
  enabled: boolean;
  autoStart: boolean;
  priority: number;
  
  // 리소스 제한
  resourceLimits: {
    memory: number;
    cpu: number;
    storage: number;
  };
  
  // 기능 플래그
  features: Record<string, boolean>;
  
  // 사용자 정의 설정
  custom: Record<string, any>;
}
```

### 시스템 상태 인터페이스
```typescript
interface SystemStatus {
  id: string;
  name: string;
  state: 'inactive' | 'initializing' | 'active' | 'error' | 'suspended';
  health: 'healthy' | 'degraded' | 'critical';
  lastActivated: Date;
  uptime: number;
  
  // 성능 메트릭
  metrics: {
    memoryUsage: number;
    cpuUsage: number;
    responseTime: number;
    errorRate: number;
  };
  
  // 에러 정보
  lastError?: {
    message: string;
    timestamp: Date;
    stack?: string;
  };
}
```

## 상태 관리 방식

### Zustand Store 통합
```javascript
const useSystemManagerStore = create((set, get) => ({
  // 현재 활성 시스템
  activeSystem: null,
  
  // 시스템 상태 맵
  systemStates: new Map(),
  
  // 전환 진행 상태
  isTransitioning: false,
  transitionProgress: 0,
  
  // 액션들
  setActiveSystem: (system) => set({ activeSystem: system }),
  
  updateSystemState: (systemId, state) => set((prev) => {
    const newStates = new Map(prev.systemStates);
    newStates.set(systemId, state);
    return { systemStates: newStates };
  }),
  
  startTransition: () => set({ isTransitioning: true, transitionProgress: 0 }),
  
  updateTransitionProgress: (progress) => set({ transitionProgress: progress }),
  
  completeTransition: () => set({ isTransitioning: false, transitionProgress: 100 }),
}));
```

### 상태 지속성
```javascript
// 상태 저장
async saveState() {
  const state = {
    activeSystemId: this.currentSystem?.id,
    systemConfigs: this.systemConfigs,
    lastUpdate: new Date().toISOString()
  };
  
  await this.stateStore.save('systemManager', state);
}

// 상태 복원
async restoreState() {
  const saved = await this.stateStore.load('systemManager');
  if (saved && saved.activeSystemId) {
    await this.activateSystem(saved.activeSystemId);
  }
}
```

## 이벤트 및 콜백

### 시스템 생명주기 이벤트
```javascript
// 시스템 활성화 이벤트
onSystemActivating: (systemId) => {
  console.log(`시스템 활성화 중: ${systemId}`);
  // UI 로딩 표시, 준비 작업 등
}

onSystemActivated: (systemId) => {
  console.log(`시스템 활성화 완료: ${systemId}`);
  // UI 업데이트, 알림 표시 등
}

// 시스템 전환 이벤트
onSystemTransitionStart: (fromId, toId) => {
  console.log(`시스템 전환 시작: ${fromId} → ${toId}`);
  // 진행 상황 표시기 시작
}

onSystemTransitionComplete: (fromId, toId) => {
  console.log(`시스템 전환 완료: ${fromId} → ${toId}`);
  // UI 업데이트, 성공 알림
}
```

### 에러 및 복구 이벤트
```javascript
onSystemError: (systemId, error) => {
  console.error(`시스템 에러: ${systemId}`, error);
  // 에러 로깅, 복구 시도, 사용자 알림
}

onSystemRecovery: (systemId) => {
  console.log(`시스템 복구: ${systemId}`);
  // 복구 알림, 상태 정상화
}
```

## 에러 핸들링

### 에러 타입 정의
```javascript
class SystemManagerError extends Error {
  constructor(type, systemId, details) {
    super(`SystemManager Error: ${type}`);
    this.type = type;
    this.systemId = systemId;
    this.details = details;
  }
}

const ERROR_TYPES = {
  ACTIVATION_FAILED: 'ACTIVATION_FAILED',
  DEACTIVATION_FAILED: 'DEACTIVATION_FAILED',
  TRANSITION_FAILED: 'TRANSITION_FAILED',
  COMPATIBILITY_FAILED: 'COMPATIBILITY_FAILED',
  CONFIG_INVALID: 'CONFIG_INVALID',
  SYSTEM_CRASHED: 'SYSTEM_CRASHED'
};
```

### 자동 복구 메커니즘
```javascript
async handleSystemCrash(systemId, error) {
  console.error(`시스템 크래시 감지: ${systemId}`, error);
  
  if (this.options.autoRecovery) {
    try {
      // 1. 시스템 정리
      await this.cleanupCrashedSystem(systemId);
      
      // 2. 재시작 시도
      await this.restartSystem(systemId);
      
      // 3. 복구 성공 알림
      this.eventBus.emit('system:recovered', { systemId });
      
    } catch (recoveryError) {
      // 복구 실패 시 폴백 시스템으로 전환
      await this.switchToFallbackSystem(systemId);
    }
  }
}
```

### 트랜잭션 기반 전환
```javascript
async switchSystemWithTransaction(fromId, toId, data) {
  const transaction = this.createTransaction();
  
  try {
    // 1. 전환 전 상태 저장
    await transaction.saveCheckpoint();
    
    // 2. 호환성 검증
    await this.checkCompatibility(fromId, toId);
    
    // 3. 데이터 마이그레이션
    const migratedData = await this.migrateData(fromId, toId, data);
    
    // 4. 시스템 전환 실행
    await this.deactivateSystem(fromId);
    await this.activateSystem(toId, migratedData);
    
    // 5. 트랜잭션 커밋
    await transaction.commit();
    
  } catch (error) {
    // 롤백 실행
    await transaction.rollback();
    throw new SystemManagerError('TRANSITION_FAILED', toId, error);
  }
}
```

## 성능 고려사항

### 1. 지연 로딩 및 캐싱
```javascript
// 시스템 메타데이터 캐싱
const metadataCache = new Map();

getSystemMetadata(systemId) {
  if (!metadataCache.has(systemId)) {
    const metadata = this.loadSystemMetadata(systemId);
    metadataCache.set(systemId, metadata);
  }
  return metadataCache.get(systemId);
}

// 설정 캐싱
const configCache = new LRUCache({ maxSize: 100 });
```

### 2. 비동기 초기화
```javascript
// 병렬 초기화
async initializeSystemsInParallel(systemIds) {
  const initPromises = systemIds.map(id => 
    this.initializeSystemBackground(id)
  );
  
  const results = await Promise.allSettled(initPromises);
  return this.processInitializationResults(results);
}
```

### 3. 메모리 관리
```javascript
// 비활성 시스템 리소스 정리
cleanupInactiveSystems() {
  this.systemStates.forEach((state, systemId) => {
    if (state.state === 'inactive' && 
        Date.now() - state.lastDeactivated > this.CLEANUP_THRESHOLD) {
      this.releaseSystemResources(systemId);
    }
  });
}
```

## 사용 예시

### 1. 기본 시스템 관리
```javascript
import SystemManager from './SystemManager';
import SystemRegistry from './SystemRegistry';

const registry = new SystemRegistry();
const systemManager = new SystemManager({
  registry,
  defaultSystemId: 'node-editor',
  autoRecovery: true
});

// 시스템 활성화
await systemManager.activateSystem('node-editor', {
  theme: 'dark',
  autoSave: true
});
```

### 2. 시스템 전환
```jsx
const SystemSwitcher = () => {
  const systemManager = useSystemManager();
  
  const handleSystemSwitch = async (targetSystemId) => {
    try {
      const currentSystem = systemManager.getCurrentSystem();
      const projectData = currentSystem.exportData();
      
      await systemManager.switchSystem(
        currentSystem.id,
        targetSystemId,
        projectData
      );
    } catch (error) {
      console.error('시스템 전환 실패:', error);
    }
  };
  
  return (
    <button onClick={() => handleSystemSwitch('task-manager')}>
      태스크 매니저로 전환
    </button>
  );
};
```

### 3. 시스템 상태 모니터링
```jsx
const SystemMonitor = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const systemManager = useSystemManager();
  
  useEffect(() => {
    const unsubscribe = systemManager.monitorSystemHealth(
      'node-editor',
      (status) => setSystemStatus(status)
    );
    
    return unsubscribe;
  }, [systemManager]);
  
  return (
    <div>
      <h3>시스템 상태</h3>
      <p>상태: {systemStatus?.state}</p>
      <p>건강도: {systemStatus?.health}</p>
      <p>메모리 사용량: {systemStatus?.metrics.memoryUsage}MB</p>
    </div>
  );
};
```