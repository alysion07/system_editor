# ReactFlow 기반 MARS 컴포넌트 상태 시각화 설계

## 개요

MARS Input Manual 분석을 바탕으로 ReactFlow를 사용하여 MARS 컴포넌트의 실시간 상태와 연결성을 직관적으로 표현하는 시각화 시스템 설계 문서입니다.

---

## 1. 설계 원칙

### 1.1 핵심 목표
- **직관성**: MARS 컴포넌트의 물리적 특성을 시각적으로 표현
- **실시간성**: 시뮬레이션 상태 변화를 즉시 반영
- **검증성**: 연결 오류 및 상태 이상을 즉시 식별
- **확장성**: 새로운 컴포넌트 타입 추가 용이

### 1.2 시각화 전략
```
물리적 의미 → 시각적 표현 → 사용자 직관
    ↓              ↓           ↓
  흐름방향 →    화살표 →    연결순서
  압력상태 →    색상변화 →   정상/이상
  컴포넌트 →    형태구분 →   기능인식
```

---

## 2. 컴포넌트별 시각적 설계

### 2.1 기본 형태 정의

#### TMDPVOL (Time Dependent Volume)
```
┌─── TMDPVOL-100 ───┐
│     🔄 BC         │
│   Boundary        │●────
│   P: 15.5 MPa     │
│   T: 290°C        │
└───────────────────┘
```

**특징**:
- **형태**: 둥근 모서리 사각형
- **색상**: `#10B981` (emerald-500, 소스 의미)
- **아이콘**: 🔄 (순환 의미)
- **포트**: 출구만 (오른쪽)
- **상태표시**: 경계조건 파라미터

#### PIPE (Pipe Component)
```
┌──── PIPE-110 ────┐
│    → Flow →      │●─── (Face 2)
│   Multi Volume   │
│ P: 15.2→14.8 MPa │●─── (Face 3)
│ T: 285→280°C     │
│ ṁ: 1250 kg/s     │●─── (Face 4)
└───────────────── ┘
 ●─── (Face 1)
```

**특징**:
- **형태**: 직사각형 (긴 형태)
- **색상**: `#3B82F6` (blue-500, 흐름 의미)
- **아이콘**: → (방향성 표시)
- **포트**: 
  - 주포트: 왼쪽(Face 1), 오른쪽(Face 2)
  - 교차포트: 위쪽(Face 3), 아래쪽(Face 4)
- **상태표시**: 입구→출구 파라미터 변화

#### PUMP (Pump Component)
```
     ┌─── PUMP-200 ───┐
    ⚡│  ════►════    │
     │   Force Flow   │●────
     │ ΔP: +2.5 MPa   │
     │ RPM: 1800      │
     └────────────────┘
    ●────
```

**특징**:
- **형태**: 육각형
- **색상**: `#F59E0B` (amber-500, 강제 의미)
- **아이콘**: ⚡ (동력 의미)
- **애니메이션**: 펄스 효과 (작동 중)
- **포트**: 
  - 입구(Suction): 왼쪽
  - 출구(Discharge): 오른쪽
- **상태표시**: 압력차, RPM

#### SNGLVOL (Single Volume)
```
┌─── SNGLVOL-300 ───┐
│       Vol         │
●─│   Single Cell   │─●
│ P: 14.5 MPa       │
│ T: 275°C          │
│ Level: 85%        │
└───────────────────┘
```

**특징**:
- **형태**: 정사각형
- **색상**: `#8B5CF6` (violet-500, 저장 의미)
- **아이콘**: 📦 (체적 의미)
- **포트**: 양방향 (좌우 + 상하)
- **상태표시**: 압력, 온도, 수위

#### HTSTR (Heat Structure)
```
    🌡️
    │
┌───▼───┐
│ HTSTR │
│ ~~~~~│~~~~~ (열전달)
│  Hot  │
└───────┘
    │
   🌡️
```

**특징**:
- **형태**: 다이아몬드
- **색상**: `#EF4444` (red-500, 열 의미)
- **아이콘**: 🌡️ (온도 의미)
- **포트**: 4방향 열적연결 (사각형 포트)
- **연결선**: 물결무늬 (~~~~~)
- **상태표시**: 온도분포, 열유속

#### SNGLJUN (Single Junction)
```
     From        To
      ●─────●─────●
        Junction
      Flow: 1250 kg/s
      ΔP: 0.1 MPa
```

**특징**:
- **형태**: 작은 원형 (연결 중심)
- **색상**: `#6B7280` (gray-500, 연결 의미)
- **아이콘**: ⚬ (연결점 의미)
- **포트**: From(왼쪽) → To(오른쪽)
- **상태표시**: 유량, 압력차

### 2.2 상태별 색상 코드

| 상태 | 색상 | 설명 |
|------|------|------|
| **정상** | `#10B981` | 모든 파라미터 정상 범위 |
| **경고** | `#F59E0B` | 일부 파라미터 주의 범위 |
| **위험** | `#EF4444` | 임계값 초과 또는 오류 |
| **정지** | `#6B7280` | 비활성 상태 |
| **미연결** | `#E5E7EB` | 연결 대기 상태 |

---

## 3. 포트 및 연결 시각화

### 3.1 포트 유형별 표현

#### 질량 흐름 포트
```
입구 포트: 🔵 (파란 원형, 왼쪽)
출구 포트: 🔴 (빨간 원형, 오른쪽)  
교차 포트: 🟡 (노란 원형, 위/아래)
```

#### 열적 연결 포트
```
열전달 포트: 🟠 (주황 사각형, 4방향)
```

#### 경계 조건 포트
```
경계조건: 🟢 (초록 다이아몬드)
```

### 3.2 연결선 표현

#### 정상 연결
```
──────► (실선, 초록색)
Flow: 1250 kg/s ✅
```

#### 오류 연결  
```
┈┈┈┈┈► (점선, 빨간색)
Error: Wrong Face Connection ❌
```

#### 미연결
```
●     (빈 포트)
Waiting Connection...
```

#### 강제 방향 연결
```
══════► (굵은 실선)
Forced Flow (Pump/Valve)
```

#### 열적 연결
```
~~~~~~ (물결선, 주황색)  
Heat Transfer: 2.5 MW
```

### 3.3 흐름 애니메이션

```javascript
// 흐름 방향 애니메이션
const FlowAnimations = {
  forward: {
    pattern: "🔵→🔵→🔵",
    speed: "2s",
    color: "#10B981"
  },
  reverse: {
    pattern: "🔴←🔴←🔴", 
    speed: "2s",
    color: "#EF4444"
  },
  blocked: {
    pattern: "🟡■🟡■🟡",
    speed: "1s",
    color: "#F59E0B"  
  },
  thermal: {
    pattern: "🟠~🟠~🟠",
    speed: "3s", 
    color: "#F97316"
  }
}
```

---

## 4. 레이아웃 및 배치 전략

### 4.1 자동 레이어링

```
Level 1: [TMDPVOL] ────────────────► (소스 레이어)
                    │
Level 2: [PUMP] [VALVE] ──────────► (제어 레이어)  
                    │
Level 3: [PIPE] [PIPE] ───────────► (전달 레이어)
                    │
Level 4: [SNGLVOL] [SNGLVOL] ─────► (저장 레이어)
                    │
Level 5: [Junction Nodes] ────────► (연결 레이어)
```

### 4.2 그리드 기반 배치

```javascript
const LayoutGrid = {
  cellSize: { width: 200, height: 120 },
  margin: { x: 50, y: 40 },
  layers: {
    source: { y: 0 },      // TMDPVOL
    control: { y: 160 },   // PUMP, VALVE  
    transport: { y: 320 }, // PIPE
    storage: { y: 480 },   // SNGLVOL
    thermal: { y: 600 }    // HTSTR
  }
}
```

### 4.3 흐름 기반 자동 배치

1. **소스 컴포넌트** 식별 (TMDPVOL)
2. **흐름 방향** 추적 (Junction 연결)  
3. **레벨별 그룹화** (거리 기반)
4. **충돌 방지** 배치 (overlap 검사)

---

## 5. 상태 모니터링 시스템

### 5.1 실시간 데이터 구조

```javascript
const ComponentState = {
  id: "PIPE-110",
  type: "PIPE", 
  timestamp: "2025-09-04T10:30:15Z",
  
  // 운영 상태
  status: "running", // "running" | "stopped" | "error" | "warning"
  
  // 물리 파라미터
  parameters: {
    pressure: { 
      inlet: { value: 15.2, unit: "MPa", status: "normal" },
      outlet: { value: 14.8, unit: "MPa", status: "normal" }
    },
    temperature: {
      inlet: { value: 285.3, unit: "°C", status: "normal" },
      outlet: { value: 280.1, unit: "°C", status: "normal" }
    },
    massflow: { 
      value: 1250, unit: "kg/s", status: "high", threshold: 1000 
    }
  },
  
  // 연결 검증
  connections: [
    { 
      port: "inlet", 
      connected: true, 
      target: "PUMP-200:outlet",
      validation: "ok",
      marsCode: "11001000" 
    },
    { 
      port: "outlet", 
      connected: true, 
      target: "SNGLVOL-300:inlet",
      validation: "ok", 
      marsCode: "11002000"
    }
  ]
}
```

### 5.2 알람 및 경고 시스템

#### 시각적 알림
```javascript
const AlertStyles = {
  critical: {
    border: "3px solid #EF4444",
    animation: "pulse 1s infinite",
    badge: "🚨"
  },
  warning: {
    border: "2px solid #F59E0B", 
    animation: "glow 2s infinite",
    badge: "⚠️"
  },
  info: {
    border: "1px solid #3B82F6",
    badge: "ℹ️"  
  }
}
```

#### 알람 조건
- **압력 임계값 초과**: P > P_critical
- **온도 한계 도달**: T > T_max  
- **유량 이상**: ṁ < ṁ_min 또는 ṁ > ṁ_max
- **연결 오류**: 잘못된 Face 연결
- **방향성 위반**: 강제 방향 역류

---

## 6. 사용자 인터랙션

### 6.1 선택 및 상세보기

```javascript
// 컴포넌트 클릭 시 상세 패널
const DetailPanel = {
  position: "right",
  content: {
    basic: "ID, Type, Status",
    parameters: "실시간 파라미터 그래프",  
    connections: "연결 상태 및 검증 결과",
    history: "파라미터 변화 히스토리"
  }
}
```

### 6.2 드래그 앤 드롭

```javascript
// 새 컴포넌트 추가
const ComponentPalette = {
  categories: [
    "Volumes", // SNGLVOL, TMDPVOL
    "Flow", // PIPE, PUMP, VALVE
    "Thermal", // HTSTR  
    "Junctions" // SNGLJUN, TMDPJUN
  ],
  dragPreview: "반투명 컴포넌트 미리보기",
  dropValidation: "연결 가능성 실시간 검사"
}
```

### 6.3 컨텍스트 메뉴

```
우클릭 메뉴:
├─ Properties... (속성 편집)
├─ Connections... (연결 관리)  
├─ Duplicate (복제)
├─ Delete (삭제)
└─ Export Data... (데이터 내보내기)
```

---

## 7. 구현 기술 스택

### 7.1 핵심 라이브러리

```javascript
// React Flow 확장
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState 
} from 'reactflow';

// 애니메이션
import { motion } from 'framer-motion';

// 상태 관리  
import { create } from 'zustand';

// 스타일링
import styled from 'styled-components';
```

### 7.2 커스텀 노드 구현

```javascript
const MarsComponentNode = ({ data, selected }) => {
  const { type, parameters, status, connections } = data;
  
  return (
    <motion.div
      className={`mars-node mars-${type.toLowerCase()}`}
      animate={{ 
        scale: selected ? 1.05 : 1,
        boxShadow: status === 'error' ? '0 0 20px red' : 'none'
      }}
    >
      <NodeHeader type={type} status={status} />
      <NodeBody parameters={parameters} />
      <NodePorts connections={connections} />
    </motion.div>
  );
};
```

### 7.3 실시간 업데이트

```javascript
// WebSocket 또는 Server-Sent Events
const useRealtimeData = (componentId) => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const eventSource = new EventSource(`/api/components/${componentId}/stream`);
    
    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData(newData);
    };
    
    return () => eventSource.close();
  }, [componentId]);
  
  return data;
};
```

---

## 8. 확장 및 개선 방안

### 8.1 고도화 기능

- **3D 시각화**: Three.js 연동으로 입체적 표현
- **VR/AR 지원**: 몰입형 시뮬레이션 환경  
- **AI 예측**: 머신러닝 기반 이상 예측
- **협업 기능**: 실시간 다중 사용자 편집

### 8.2 성능 최적화

- **가상화**: 대용량 시스템을 위한 뷰포트 기반 렌더링
- **메모이제이션**: 불필요한 리렌더링 방지
- **워커 스레드**: 무거운 계산 작업 분리
- **캐싱 전략**: 자주 사용되는 데이터 캐싱

---

## 9. 결론

본 설계는 MARS 컴포넌트의 물리적 특성과 연결 관계를 직관적으로 표현하여 시뮬레이션 시스템의 이해도와 운영 효율성을 크게 향상시킬 것으로 기대됩니다.

**핵심 가치**:
- ✅ **직관적 이해**: 복잡한 MARS 시스템을 한눈에 파악
- ✅ **실시간 모니터링**: 즉각적인 상태 변화 감지  
- ✅ **오류 방지**: 연결 검증으로 설정 실수 최소화
- ✅ **확장성**: 새로운 컴포넌트 추가 용이

---

**작성일**: 2025-09-04  
**기반 자료**: mars-component-port-analysis.md  
**대상 시스템**: sys_edit_cl ReactFlow 컴포넌트  
**설계 버전**: v1.0