# 컴포넌트 유체 흐름 방향과 포트 위치 상관관계 분석

## 개요

본 문서는 MARS Input Manual 분석을 통해 파악한 유체 흐름 방향 규칙과 현재 NodeEditor의 포트 위치를 비교 분석하여, 엣지 연결 시 발생하는 기이한 형상 문제의 원인과 해결방안을 제시합니다.

## MARS Manual 분석 결과

### 1. 연결 형식 및 면 번호 규칙 (CCCVV000N)

MARS Manual에서 정의하는 연결 형식:
- **CCC**: 컴포넌트 번호
- **VV**: 체적 번호  
- **N**: 면 번호

**핵심 면 번호 규칙:**
- **N = 1**: 입구 면 (Inlet face - 주 좌표 방향)
- **N = 2**: 출구 면 (Outlet face - 주 좌표 방향)
- **N = 3-6**: 교차 흐름 면 (Crossflow faces - 보조/3차 좌표 방향)

### 2. 컴포넌트별 유체 흐름 방향

#### PIPE 컴포넌트
- **주 흐름 방향**: X-좌표를 따라 진행
- **입구**: 첫 번째 체적의 면 1 (CCC010001)
- **출구**: 마지막 체적의 면 2 (CCC050002 - 5체적 파이프의 경우)
- **교차 흐름**: Y, Z 좌표 방향의 면 3-6

#### PUMP 컴포넌트
- **단방향 흐름**: 입구에서 출구로의 명확한 방향성
- **입구 접합부**: CCC010000 (명시적으로 지정)
- **출구 접합부**: CCC020000 (명시적으로 지정)
- **경사각**: 양수 각도는 상향 흐름 (출구가 입구보다 높음)

#### SNGLJUN (단일 접합부)
- **"From" 연결**: 흐름이 시작되는 컴포넌트
- **"To" 연결**: 흐름이 종료되는 컴포넌트
- CCCVV000N 형식으로 면 1(입구), 면 2(출구) 사용

### 3. 포트 위치 규칙

#### 방향성 컴포넌트 (PUMP, VALVE):
- **왼쪽**: 입구 포트 (면 1)
- **오른쪽**: 출구 포트 (면 2)
- 자연스러운 좌→우 흐름 관례 준수

#### 양방향 컴포넌트 (PIPE, JUNCTION):
- **면 1**: 주 입구/소스 끝
- **면 2**: 주 출구/목적지 끝
- **면 3-6**: 교차 흐름 연결 (주 흐름에 수직)

## 현재 NodeEditor 구현 분석

### 현재 포트 설정

**모든 컴포넌트의 공통 문제:**
```javascript
// 현재 구현 (NodeItem.jsx:38,57)
<Handle type="target" position={Position.Top}/>     // 입구
<Handle type="source" position={Position.Bottom}/>  // 출구
```

**컴포넌트별 포트 정의:**
```javascript
// PIPE 컴포넌트
ports: {
    inputs: [{ id: 'from', label: 'From' }],
    outputs: [{ id: 'to', label: 'To' }]
}

// PUMP 컴포넌트
ports: {
    inputs: [{ id: 'from', label: 'In' }],
    outputs: [{ id: 'to', label: 'Out' }]
}

// SNGLJUN 컴포넌트
ports: {
    inputs: [{ id: "from", label: "From" }],
    outputs: [{ id: "to", label: "To" }]
}
```

### 문제점 분석

1. **위치 불일치**: 모든 컴포넌트가 상하(Top/Bottom) 배치를 사용하여 MARS 표준의 좌우(Left/Right) 배치와 불일치

2. **방향성 무시**: MARS Manual의 면 번호 규칙(1=입구, 2=출구)이 현재 구현에 반영되지 않음

3. **엣지 형상 문제**: 상하 배치로 인해 수평적 흐름을 표현할 때 부자연스러운 엣지 형상 발생

## 권장 해결 방안

### 1. 포트 위치 수정

#### 방향성 컴포넌트 (PUMP, VALVE):
```javascript
// 수정된 포트 위치
<Handle type="target" position={Position.Left} id="inlet" />    // 입구 (면 1)
<Handle type="source" position={Position.Right} id="outlet" />  // 출구 (면 2)
```

#### 양방향 컴포넌트 (PIPE, SNGLJUN):
```javascript
// 주 흐름 포트
<Handle type="target" position={Position.Left} id="from" />     // 면 1
<Handle type="source" position={Position.Right} id="to" />      // 면 2

// 교차 흐름 포트 (필요시)
<Handle type="target" position={Position.Top} id="crossflow1" />    // 면 3
<Handle type="target" position={Position.Bottom} id="crossflow2" /> // 면 4
```

### 2. 컴포넌트별 구현 로직

```javascript
// 포트 위치 결정 로직
const getPortPositions = (componentType) => {
  switch(componentType) {
    case 'PUMP':
    case 'VALVE':
      return {
        inlet: { position: Position.Left, face: 1 },
        outlet: { position: Position.Right, face: 2 }
      };
    
    case 'PIPE':
    case 'SNGLJUN':
      return {
        primaryInlet: { position: Position.Left, face: 1 },
        primaryOutlet: { position: Position.Right, face: 2 },
        crossflowPorts: [
          { position: Position.Top, face: 3 },
          { position: Position.Bottom, face: 4 }
        ]
      };
    
    default:
      return {
        inlet: { position: Position.Left, face: 1 },
        outlet: { position: Position.Right, face: 2 }
      };
  }
};
```

### 3. 연결 유효성 검증

```javascript
// 연결 유효성 검증 함수
const validateConnection = (source, target) => {
  // 입구 포트(면 1)는 출구 포트(면 2)와 연결되어야 함
  const isValidFaceConnection = (source.face === 2 && target.face === 1);
  
  // 흐름 방향 호환성 검증
  const isFlowDirectionCompatible = validateFlowDirection(source, target);
  
  return isValidFaceConnection && isFlowDirectionCompatible;
};
```

### 4. 시각적 흐름 표시

```javascript
// 시각적 흐름 방향 표시
const FlowIndicator = ({ direction }) => (
  <div className="flow-indicator">
    <ArrowIcon direction={direction} />
  </div>
);

// 포트 스타일링 차별화
.inlet-port {
  border: 2px solid #blue;
  background: #lightblue;
}

.outlet-port {
  border: 2px solid #red;
  background: #lightcoral;
}

.crossflow-port {
  border: 2px solid #green;
  background: #lightgreen;
}
```

## 구현 우선순위

### Phase 1: 핵심 수정
1. **NodeItem.jsx** 수정: Handle 위치를 Top/Bottom → Left/Right로 변경
2. **컴포넌트별 포트 정의** 업데이트: 면 번호 규칙 적용
3. **기본 연결 로직** 검증 추가

### Phase 2: 고도화
1. **교차 흐름 포트** 추가 (PIPE 컴포넌트용)
2. **시각적 흐름 표시** 구현
3. **동적 포트 배치** (컴포넌트 회전 시)

### Phase 3: 검증 및 최적화
1. **연결 유효성 검증** 강화
2. **MARS 표준 준수** 완전 구현
3. **사용자 경험** 개선

## 예상 효과

1. **엣지 형상 개선**: 좌우 배치로 인한 자연스러운 수평 흐름 표현
2. **MARS 표준 준수**: 면 번호 규칙을 통한 정확한 시뮬레이션 연동
3. **사용자 직관성**: 전통적인 P&ID 다이어그램과 유사한 흐름 방향
4. **연결 오류 감소**: 명확한 입구/출구 구분으로 잘못된 연결 방지

## 참고 파일

- **MARS Manual**: `/D:/workspace/sys_edit_cl/public/ref/8 HYDRODYNAMIC COMPONENTS/`
- **현재 구현**: 
  - `NodeItem.jsx:38,57` - Handle 위치 정의
  - `PIPE.js:7-10` - PIPE 포트 정의
  - `PUMP.js:6-9` - PUMP 포트 정의  
  - `SNGLJUN.js:7-14` - SNGLJUN 포트 정의

## 실제 MARS 입력 파일 분석

### 사용자 입력 파일 분석 결과

**SMART.i 및 copain.i 파일 분석:**

#### 컴포넌트 명명 패턴
```
// SMART.i 예시
1100000     in_csb         sngljun
1750000     out_csa        sngljun  
2610000     sk_hole        sngljun
2890000     pzr_ij         sngljun

// copain.i 예시
1150000     jcn-1          sngljun
2050000     jcn-2          sngljun
2150000     jcn-1          sngljun
```

#### 연결 패턴 분석
```
// SNGLJUN 연결 예시 (SMART.i)
1100101     100010002      120010001      0.8162    // from → to
1750101     170070002      160010001      0.262
2610101     258050002      100010002      1.509

// copain.i 연결 예시  
1150101     110050002      150010001      0.30      // from → to
2050101     150100002      210010001      0.010
2150101     210050002      220000000      0.010
```

**핵심 발견사항:**
1. **컴포넌트 번호**: 3자리 숫자 (110, 115, 205, 215 등)
2. **면 번호 활용**: 연결에서 명확한 면 번호 사용 (002=출구면, 001=입구면)
3. **의미있는 이름**: `in_csb`, `out_csa`, `jcn-1`, `jcn-2` 등 목적 명시

## 현재 구현의 심각한 문제점

### 1. Edge 상태 동기화 문제

**현재 connectionHelper.jsx의 문제:**
```javascript
// 문제 1: 포트 ID 기반 추론의 한계
const formatConnectionCode = (node, portId) => {
    const componentNumber = node.id.replace(/\D/g, '').padStart(3, '0');
    let connectionSuffix = '000000'; // 기본 입구
    
    if (portId === 'out') {
        connectionSuffix = '010000'; // 출구
    }
    
    return `${componentNumber}${connectionSuffix}`;
};
```

**문제점:**
- **포트 ID 의존성**: 'out' 포트가 항상 출구 면(002)을 의미한다고 가정
- **면 번호 오류**: MARS 표준의 002(출구면)가 아닌 010000 형식 사용
- **체적 번호 누락**: 실제 MARS는 체적별 면 번호가 필요 (예: 110050002)

### 2. editorReducer.jsx의 동기화 오류

**현재 구현의 문제:**
```javascript
// 잘못된 연결 코드 생성
updatedData.fromConnection = `${targetNode.compNumber}${action.payload.targetPortId === 'out' ? '010000' : '000000'}`;
```

**실제 MARS 표준과의 차이:**
- **현재**: `110010000` (잘못된 형식)
- **MARS**: `110050002` (컴포넌트-체적-면번호)

### 3. 포트 위치와 명명의 불일치

**NodeItem.jsx의 포트 배치:**
```javascript
<Handle type="target" position={Position.Top}/>     // 현재: 상단
<Handle type="source" position={Position.Bottom}/>  // 현재: 하단
```

**실제 MARS 연결과의 모순:**
- MARS: `110050002 → 150010001` (출구면 → 입구면)
- 현재 UI: Top → Bottom (의미상 연관성 없음)

## 종합 개선 계획

### Phase 1: 연결 코드 표준화

#### 1.1 정확한 면 번호 매핑
```javascript
const getMARSFaceNumber = (componentType, portType, volumeIndex = 1) => {
  const baseCode = String(componentNumber).padStart(3, '0') + 
                   String(volumeIndex).padStart(2, '0') + '000';
  
  switch(componentType) {
    case 'PIPE':
      return portType === 'inlet' ? baseCode + '1' : baseCode + '2';
    case 'PUMP':
      return portType === 'inlet' ? baseCode + '1' : baseCode + '2';  
    case 'SNGLJUN':
      // SNGLJUN은 from/to 연결로 처리
      break;
  }
};
```

#### 1.2 체적 번호 고려
```javascript
const formatMARSConnection = (node, portType, volumeNumber) => {
  const compNum = String(node.compNumber || extractCompNumber(node.id)).padStart(3, '0');
  const volNum = String(volumeNumber).padStart(2, '0');
  const faceNum = portType === 'outlet' ? '2' : '1';
  
  return `${compNum}${volNum}000${faceNum}`;
};
```

### Phase 2: 포트 위치 재설계

#### 2.1 MARS 표준 기반 포트 배치
```javascript
const MARSPortLayout = ({ componentType }) => {
  const getPortConfig = () => {
    switch(componentType) {
      case 'PIPE':
      case 'SNGLJUN':
      case 'PUMP':
        return {
          inlet: { position: Position.Left, face: 1 },
          outlet: { position: Position.Right, face: 2 }
        };
      default:
        return {
          inlet: { position: Position.Left, face: 1 },
          outlet: { position: Position.Right, face: 2 }
        };
    }
  };

  const portConfig = getPortConfig();
  
  return (
    <>
      <Handle 
        type="target" 
        position={portConfig.inlet.position}
        id="inlet"
        className="mars-inlet-port"
      />
      <Handle 
        type="source" 
        position={portConfig.outlet.position}
        id="outlet"
        className="mars-outlet-port"
      />
    </>
  );
};
```

### Phase 3: 엣지 동기화 개선

#### 3.1 실시간 연결 검증
```javascript
const validateMARSConnection = (sourceNode, targetNode, connection) => {
  const sourceCode = formatMARSConnection(sourceNode, 'outlet', getLastVolume(sourceNode));
  const targetCode = formatMARSConnection(targetNode, 'inlet', getFirstVolume(targetNode));
  
  // 출구면 → 입구면 연결 검증
  const isValidConnection = sourceCode.endsWith('2') && targetCode.endsWith('1');
  
  return {
    isValid: isValidConnection,
    sourceConnection: sourceCode,
    targetConnection: targetCode,
    warnings: isValidConnection ? [] : ['Invalid face connection: outlet must connect to inlet']
  };
};
```

#### 3.2 자동 연결 코드 업데이트
```javascript
const updateConnectionCodes = (nodes, edges) => {
  return nodes.map(node => {
    if (node.type === 'SNGLJUN') {
      const connections = findNodeConnections(node.id, edges);
      const updatedData = { ...node.data };
      
      connections.forEach(conn => {
        const connectedNode = findConnectedNode(conn, nodes, node.id);
        if (connectedNode) {
          const connectionCode = formatMARSConnection(
            connectedNode, 
            determinePortType(conn),
            getVolumeNumber(connectedNode, conn)
          );
          
          if (isFromConnection(conn, node.id)) {
            updatedData.fromConnection = connectionCode;
          } else {
            updatedData.toConnection = connectionCode;
          }
        }
      });
      
      return { ...node, data: updatedData };
    }
    return node;
  });
};
```

### Phase 4: 사용자 경험 개선

#### 4.1 시각적 연결 표시
```javascript
const ConnectionIndicator = ({ connection, isValid }) => (
  <div className={`connection-indicator ${isValid ? 'valid' : 'invalid'}`}>
    <div className="connection-code">{connection.from} → {connection.to}</div>
    <div className="face-indicator">
      Face {connection.sourceFace} → Face {connection.targetFace}
    </div>
    {!isValid && (
      <div className="warning">⚠️ Invalid connection pattern</div>
    )}
  </div>
);
```

#### 4.2 실시간 검증 피드백
```javascript
const EdgeValidationOverlay = ({ edge, isValid, warnings }) => (
  <div className="edge-validation-overlay">
    {!isValid && warnings.map(warning => (
      <div key={warning} className="validation-warning">
        {warning}
      </div>
    ))}
  </div>
);
```

## 구현 우선순위 (재정의)

### 즉시 수정 (Critical)
1. **connectionHelper.jsx**: 면 번호 매핑 수정 (000→001, 010→002)
2. **editorReducer.jsx**: 체적-면 번호 형식 적용
3. **NodeItem.jsx**: 포트 위치 Left/Right로 변경

### 단기 개선 (High Priority)  
1. **실시간 연결 검증**: 잘못된 연결 방지
2. **체적 번호 자동 추론**: 컴포넌트 속성 기반
3. **시각적 피드백**: 유효/무효 연결 표시

### 중장기 발전 (Medium Priority)
1. **교차 흐름 포트**: 면 3-6 지원
2. **동적 포트 생성**: 체적 수에 따른 포트 자동 생성
3. **MARS 파일 역변환**: 기존 파일로부터 다이어그램 자동 생성

## 구현 영향도 분석

### 🔴 고위험 영향 범위

#### 1. 전체 시스템 아키텍처 변경
- **포트 위치 시스템**: 모든 컴포넌트의 Handle 위치 변경 (Top/Bottom → Left/Right)
- **연결 코드 포맷**: MARS 표준 CCCVV000N 형식으로 전면 교체
- **컴포넌트 정의**: PIPE, PUMP, SNGLJUN 포트 구조 재설계

#### 2. 기존 프로젝트 호환성 문제
- **프로젝트 파일**: 모든 기존 `.json` 파일 마이그레이션 필요
- **연결 참조**: SNGLJUN `fromConnection`, `toConnection` 속성 형식 변경
- **엣지 데이터**: ReactFlow 연결 데이터 구조 업데이트 필수

### 🟡 주요 영향 받는 파일

#### 핵심 시각 컴포넌트 (직접 영향)
```javascript
// NodeItem.jsx (Lines 38, 57) - 모든 컴포넌트 시각적 표현
// 현재: Position.Top, Position.Bottom
// 변경: Position.Left, Position.Right
```

#### 연결 관리 시스템 (치명적 영향)
```javascript
// connectionHelper.jsx (Lines 77-93)
// 현재: 'ccc000000'/'ccc010000' (잘못된 형식)
// 변경: 'cccvv000n' MARS 표준 형식

// editorReducer.jsx (Lines 130, 132, 155, 157)  
// 현재: 하드코딩된 연결 접미사
// 변경: 면 기반 번호 시스템 (001=입구, 002=출구)
```

#### 파일 생성 시스템 (치명적 영향)
```javascript
// fileGenerator.jsx (Lines 431-494)
// 현재: 부정확한 연결 형식으로 SNGLJUN 생성
// 변경: MARS 면 번호 체계 완전 구현
```

### 🟠 데이터 호환성 문제

#### 1. 마이그레이션 필수 항목
```javascript
// 연결 코드 변환 함수 필요
const migrateConnectionCodes = (oldCode) => {
    // "110010000" → "110050002" 변환
    const compNum = oldCode.substring(0, 3);
    const isOutlet = oldCode.includes('010000');
    const volumeNum = '05'; // 파이프 기본 체적 5
    const faceNum = isOutlet ? '2' : '1';
    return `${compNum}${volumeNum}000${faceNum}`;
};

// 포트 ID 매핑 변환
const legacyPortMapping = {
    'from': { newId: 'face1', position: Position.Left },
    'to': { newId: 'face2', position: Position.Right },
    'out': { newId: 'face2', position: Position.Right }
};
```

#### 2. 프로젝트 데이터 마이그레이션
```javascript
const migrateProjectData = (projectData) => {
    return {
        ...projectData,
        nodes: projectData.nodes.map(migrateNodePorts),
        edges: projectData.edges.map(migrateEdgeConnections)
    };
};
```

### ⚠️ 위험 완화 전략

#### 1. 점진적 롤아웃 계획
- **기능 플래그**: 구/신 포트 시스템 토글 기능
- **이중 지원**: 전환 기간 동안 두 시스템 병행 운영
- **자동 백업**: 마이그레이션 전 프로젝트 자동 백업

#### 2. 테스트 계획

**Phase 1: 단위 테스트**
```javascript
describe('NodeItem Port Positions', () => {
    test('PIPE component should have left inlet, right outlet', () => {
        const pipeComponent = render(<NodeItem type="PIPE" />);
        expect(pipeComponent.getByTestId('inlet-handle'))
            .toHaveStyle('left: 0');
        expect(pipeComponent.getByTestId('outlet-handle'))
            .toHaveStyle('right: 0');
    });
});

describe('MARS Face Numbering', () => {
    test('should generate correct face codes', () => {
        expect(formatMARSConnection(pipeNode, 'outlet', 5))
            .toBe('110050002');
    });
});
```

**Phase 2: 통합 테스트**
- 엣지 생성 시 올바른 MARS 코드 생성 검증
- 파일 생성 시 SNGLJUN 섹션 정확성 검증
- Undo/Redo 상태 관리 새 포트 구조 지원 확인

**Phase 3: 사용자 수용 테스트**
- 수평 흐름의 직관성 및 가독성 검증
- 연결 워크플로우 사용성 테스트
- 대용량 다이어그램 성능 테스트

#### 3. 롤백 전략
```javascript
// 긴급 롤백을 위한 레거시 모드
const LEGACY_MODE = process.env.REACT_APP_LEGACY_PORTS || false;

const getPortPosition = (portType) => {
    if (LEGACY_MODE) {
        return portType === 'inlet' ? Position.Top : Position.Bottom;
    }
    return portType === 'inlet' ? Position.Left : Position.Right;
};
```

### 📋 세부 구현 로드맵

#### Phase 1: 핵심 인프라 수정 (2-3주)
```bash
# 우선순위 1: 연결 코드 형식 수정
- connectionHelper.jsx formatConnectionCode 함수 재작성
- editorReducer.jsx ADD_CONNECTION 액션 면 번호 적용
- 기존 데이터 마이그레이션 유틸리티 개발

# 우선순위 2: 포트 위치 변경
- NodeItem.jsx Handle position 수정 (Top/Bottom → Left/Right)
- ReactFlow 엣지 라우팅 테스트 및 최적화
```

#### Phase 2: 컴포넌트 정의 업데이트 (1-2주)
```bash
# 컴포넌트별 포트 재정의
- PIPE.js: 면 1/2 + 교차 흐름 면 3-6 지원
- PUMP.js: 명확한 입구/출구 방향성
- SNGLJUN.js: From/To 연결의 면 번호 매핑

# 시각적 개선
- 포트별 색상 구분 (입구: 파란색, 출구: 빨간색)
- 흐름 방향 표시 화살표 추가
```

#### Phase 3: 검증 및 테스트 (2주)
```bash
# 종합 테스트 수행
- 연결 로직 정확성 검증
- MARS 파일 생성 결과 검증
- 기존 프로젝트 마이그레이션 테스트
- 성능 벤치마크 (대용량 다이어그램)
```

#### Phase 4: 사용자 경험 개선 (1주)
```bash
# UX 향상 작업
- 실시간 연결 유효성 피드백
- 도움말 및 가이드 업데이트
- 연결 오류 시 명확한 메시지 제공
```

### 🎯 성공 지표

#### 기술적 지표
- **연결 정확도**: MARS 시뮬레이션 파일 100% 호환
- **마이그레이션 성공률**: 기존 프로젝트 데이터 무손실 변환
- **성능 유지**: 포트 변경 후에도 렌더링 성능 동일 수준

#### 사용자 지표  
- **학습 곡선**: 새로운 연결 패턴 적응 시간 최소화
- **오류 감소**: 잘못된 연결로 인한 시뮬레이션 오류 90% 감소
- **직관성**: 수평 흐름으로 P&ID 다이어그램 유사성 증가

## 예상 개선 효과

### 기술적 개선
- **정확한 연결 코드**: MARS 시뮬레이션과 완벽 호환
- **동기화 오류 해결**: 엣지 상태와 컴포넌트 데이터 일관성 보장
- **표준 준수**: MARS Manual 8. HYDRODYNAMIC COMPONENTS 완전 구현

### 사용자 경험 개선  
- **직관적 연결**: 좌→우 흐름으로 자연스러운 P&ID 스타일
- **실시간 검증**: 잘못된 연결 시 즉시 경고
- **자동 코드 생성**: 수동 입력 오류 방지

---

**작성일**: 2025-09-04  
**최종 업데이트**: 2025-09-04 (영향도 분석 추가)  
**분석 기준**: MARS Input Manual + 실제 사용자 입력 파일 (SMART.i, copain.i) + 코드베이스 종속성 분석  
**구현 대상**: sys_edit_cl NodeEditor 컴포넌트