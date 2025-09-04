# MARS 컴포넌트별 포트 구조 및 연결 조건 분석

## 개요

MARS Input Manual 및 실제 입력 파일(SMART.i, copain.i) 분석을 통해 각 컴포넌트의 입/출구 조건, 연결 규칙, 그리고 현재 NodeItem 포트 구조와의 관계를 정리합니다.

---

## 1. SNGLVOL (Single Volume)

### 1.1 MARS 표준 정의
- **목적**: 단일 제어 체적을 나타내는 0차원 컴포넌트
- **체적 구성**: 1개의 체적 (Volume 01)
- **면 구성**: 6개 면 (Face 1-6)

### 1.2 입/출구 조건
| 면 번호 | 방향 | 연결 가능성 | 설명 |
|---------|------|-------------|------|
| **Face 1** | X- 방향 | ✅ 입구/출구 | 주 흐름 면 |
| **Face 2** | X+ 방향 | ✅ 입구/출구 | 주 흐름 면 |
| **Face 3** | Y- 방향 | 🟡 교차흐름 | 보조 연결 |
| **Face 4** | Y+ 방향 | 🟡 교차흐름 | 보조 연결 |
| **Face 5** | Z- 방향 | 🟡 교차흐름 | 보조 연결 |
| **Face 6** | Z+ 방향 | 🟡 교차흐름 | 보조 연결 |

### 1.3 컴포넌트간 연결 조건
```
SNGLVOL → SNGLJUN/TMDPJUN → 다른 컴포넌트
        ↓
      Face N → Junction → 연결된 컴포넌트 Face M
```

### 1.4 현재 NodeItem 포트와의 관계
```javascript
// 현재 구현
ports: {
    inputs: [{ id: 'from', label: 'From' }],    // Face 1 매핑
    outputs: [{ id: 'to', label: 'To' }]       // Face 2 매핑
}

// 개선 필요사항
- Face 3-6 교차흐름 포트 추가 고려
- 양방향성 명시 (Face 1 ↔ Face 2)
```

---

## 2. TMDPVOL (Time Dependent Volume)

### 2.1 MARS 표준 정의
- **목적**: 시간 종속 경계 조건을 제공하는 소스/싱크 컴포넌트
- **체적 구성**: 1개의 체적 (Volume 00 - 특별 처리)
- **연결 특성**: 단방향 소스 역할만 수행

### 2.2 입/출구 조건
| 구분 | 연결 형태 | MARS 코드 | 설명 |
|------|-----------|-----------|------|
| **출구만** | Source Only | `CCC000000` | 다른 컴포넌트로 유체 공급 |
| ~~입구~~ | ❌ 불가능 | - | 경계 조건이므로 입구 없음 |

### 2.3 컴포넌트간 연결 조건
```
TMDPVOL (소스) → SNGLJUN/TMDPJUN → 타겟 컴포넌트 Face 1 (입구면)
                       ↓
                 항상 출구 → 입구 연결
```

### 2.4 현재 NodeItem 포트와의 관계
```javascript
// 현재 구현 (잘못됨)
ports: {
    // inputs: [{ id: "from", label: "From" }], // 주석 처리됨
    outputs: [{ id: "to", label: "To" }]       // 정확함
}

// 개선 필요사항
✅ 출구만 있는 현재 구조는 정확
🔍 경계 조건임을 시각적으로 구분 필요
🔍 연결 검증: TMDPVOL은 다른 컴포넌트의 inlet과만 연결
```

---

## 3. PIPE (Pipe Component)

### 3.1 MARS 표준 정의
- **목적**: 다중 체적으로 구성된 1차원 유체 흐름 경로
- **체적 구성**: N개의 체적 (예: 5개 체적 - Volume 01~05)
- **면 구성**: 각 체적마다 6개 면, 총 N×6개 면

### 3.2 입/출구 조건
| 위치 | 면 번호 | MARS 코드 | 연결 특성 | 설명 |
|------|---------|-----------|-----------|------|
| **주 입구** | Face 1 | `CCC010001` | ↔️ 양방향 | 첫 번째 체적 입구면 |
| **주 출구** | Face 2 | `CCC050002` | ↔️ 양방향 | 마지막 체적 출구면 |
| **교차흐름** | Face 3 | `CCC0VV003` | ↔️ 양방향 | Y- 방향 연결 |
| **교차흐름** | Face 4 | `CCC0VV004` | ↔️ 양방향 | Y+ 방향 연결 |
| **교차흐름** | Face 5 | `CCC0VV005` | ↔️ 양방향 | Z- 방향 연결 |
| **교차흐름** | Face 6 | `CCC0VV006` | ↔️ 양방향 | Z+ 방향 연결 |

### 3.3 컴포넌트간 연결 조건
```
PIPE Face 2 (출구) → SNGLJUN → 다른 컴포넌트 Face 1 (입구)
PIPE Face 1 (입구) ← SNGLJUN ← 다른 컴포넌트 Face 2 (출구)

교차 흐름:
PIPE Face 3/4 ↔ SNGLJUN ↔ 다른 컴포넌트 (측면 연결)
```

### 3.4 현재 NodeItem 포트와의 관계
```javascript
// 현재 구현 (개선됨)
ports: {
    primary: {
        inlet: { id: 'inlet', label: 'Face 1 (Inlet)', marsCode: 1, position: 'left' },
        outlet: { id: 'outlet', label: 'Face 2 (Outlet)', marsCode: 2, position: 'right' }
    },
    crossflow: [
        { id: 'crossflow_top', label: 'Face 3 (Y+ Flow)', marsCode: 3, position: 'top' },
        { id: 'crossflow_bottom', label: 'Face 4 (Y- Flow)', marsCode: 4, position: 'bottom' },
        // Face 5-6은 선택적
    ]
}

// 개선 상태
✅ 주 흐름 좌우 배치 완료
✅ 교차 흐름 포트 정의 완료
✅ MARS 면 번호 매핑 완료
```

---

## 4. SNGLJUN (Single Junction)

### 4.1 MARS 표준 정의
- **목적**: 두 컴포넌트를 연결하는 단일 접합부
- **연결 특성**: From 컴포넌트 → To 컴포넌트 단방향 흐름
- **면 매핑**: 연결된 컴포넌트의 면 번호 참조

### 4.2 입/출구 조건
| 연결부 | 방향 | MARS 코드 형식 | 의미 | 
|--------|------|---------------|------|
| **From** | 입력 | `CCCVV000N` | 소스 컴포넌트의 특정 면 |
| **To** | 출력 | `CCCVV000M` | 타겟 컴포넌트의 특정 면 |

### 4.3 컴포넌트간 연결 조건
```
소스 컴포넌트 Face 2 (출구) → SNGLJUN From
                                ↓
SNGLJUN To → 타겟 컴포넌트 Face 1 (입구)

실제 예시 (copain.i):
110050002 → 150010001  (PIPE 110 출구 → PIPE 150 입구)
```

### 4.4 현재 NodeItem 포트와의 관계
```javascript
// 현재 구현 (개선됨)
ports: {
    primary: {
        from: { 
            id: 'from', 
            label: 'From Connection', 
            expectedFace: 2,  // 소스의 출구면
            position: 'left'
        },
        to: { 
            id: 'to', 
            label: 'To Connection', 
            expectedFace: 1,  // 타겟의 입구면
            position: 'right' 
        }
    }
}

// 개선 상태
✅ From → To 방향성 명확화
✅ 연결 검증 로직 포함
✅ UI 필드에서 연결 코드 표시
```

---

## 5. TMDPJUN (Time Dependent Junction)

### 5.1 MARS 표준 정의
- **목적**: 시간 종속 유량/압력 경계 조건을 제공하는 접합부
- **연결 특성**: 경계 조건과 일반 컴포넌트 연결
- **제어 플래그**: 제한된 플래그 사용 (주로 e-flag)

### 5.2 입/출구 조건
| 연결부 | 방향 | MARS 코드 | 특성 |
|--------|------|-----------|------|
| **From** | 입력 | `CCC000000` | 경계 조건 소스 |
| **To** | 출력 | `CCCVV000N` | 연결 대상 컴포넌트 |

### 5.3 컴포넌트간 연결 조건
```
TMDPVOL → TMDPJUN → 일반 컴포넌트
           ↓
    경계조건 → 시스템 내부

실제 예시 (copain.i):
100000000 → 110010000  (경계조건 → PIPE 110 입구)
```

### 5.4 현재 NodeItem 포트와의 관계
```javascript
// 현재 구현 (구현 필요)
// fileGenerator.jsx에서만 처리, 별도 컴포넌트 정의 없음

// 필요한 구현
ports: {
    primary: {
        from: { id: 'from', label: 'Boundary Condition', position: 'left' },
        to: { id: 'to', label: 'Target Component', position: 'right' }
    },
    componentType: 'boundary_junction'
}

// 개선 필요사항
🚨 별도 컴포넌트 정의 필요
🔍 경계 조건 특성 시각화
```

---

## 6. HTSTR (Heat Structure)

### 6.1 MARS 표준 정의
- **목적**: 고체 열전도 및 열전달을 모델링하는 구조체
- **연결 특성**: 유체 컴포넌트와 열적 결합
- **면 특성**: 유체 경계면에서만 연결

### 6.2 입/출구 조건
| 연결 형태 | 방향 | 연결 대상 | 설명 |
|-----------|------|-----------|------|
| **열적 연결** | ↔️ 양방향 | 유체 컴포넌트 | 열전달만, 질량 유동 없음 |
| **표면 연결** | - | 특정 체적 면 | 대류/복사 열전달 |

### 6.3 컴포넌트간 연결 조건
```
HTSTR ↔ PIPE/SNGLVOL (열적 연결)
  ↓
질량 연결 없음, 열전달만

연결 형식:
HTSTR → Fluid Component Volume Face (열적 경계 조건)
```

### 6.4 현재 NodeItem 포트와의 관계
```javascript
// 현재 구현 (기본적)
ports: {
    // 포트 정의 미완성
}

// 필요한 구현
ports: {
    thermal: [
        { id: 'thermal_left', label: 'Left Surface', position: 'left' },
        { id: 'thermal_right', label: 'Right Surface', position: 'right' },
        { id: 'thermal_top', label: 'Top Surface', position: 'top' },
        { id: 'thermal_bottom', label: 'Bottom Surface', position: 'bottom' }
    ],
    connectionType: 'thermal_only'
}

// 개선 필요사항
🚨 열적 연결 전용 포트 정의 필요
🔍 질량 흐름과 구별되는 시각적 표현
```

---

## 7. VALVE (구현 예정)

### 7.1 MARS 표준 정의
- **목적**: 유동 제어 밸브 (개도 조절 가능)
- **연결 특성**: 단방향 강제 흐름 제어
- **제어**: 개도율에 따른 유량 제어

### 7.2 입/출구 조건 (예상)
| 포트 | 방향 | MARS 코드 | 특성 |
|------|------|-----------|------|
| **Inlet** | 입구 | `CCC010001` | ← 강제 방향성 |
| **Outlet** | 출구 | `CCC020002` | → 강제 방향성 |

### 7.3 현재 NodeItem 포트와의 관계
```javascript
// 구현 필요
ports: {
    primary: {
        inlet: { 
            id: 'inlet', 
            label: 'Valve Inlet', 
            position: 'left',
            flowDirection: 'forced_inlet'
        },
        outlet: { 
            id: 'outlet', 
            label: 'Valve Outlet', 
            position: 'right',
            flowDirection: 'forced_outlet'
        }
    },
    controlType: 'valve_control'
}
```

---

## 8. PUMP

### 8.1 MARS 표준 정의
- **목적**: 유체 가압 및 순환 펌프
- **연결 특성**: 강제 단방향 흐름 (Suction → Discharge)
- **체적 구성**: 2개 체적 (Volume 01: 입구, Volume 02: 출구)

### 8.2 입/출구 조건
| 포트 | 방향 | MARS 코드 | 특성 |
|------|------|-----------|------|
| **Suction** | 입구 | `CCC010000` | ← 강제 흡입 |
| **Discharge** | 출구 | `CCC020000` | → 강제 토출 |

### 8.3 컴포넌트간 연결 조건
```
소스 컴포넌트 Face 2 → SNGLJUN → PUMP Suction (CCC010000)
PUMP Discharge (CCC020000) → SNGLJUN → 타겟 컴포넌트 Face 1

강제 방향성: Suction → Discharge (역류 불가)
```

### 8.4 현재 NodeItem 포트와의 관계
```javascript
// 현재 구현 (개선됨)
ports: {
    primary: {
        inlet: { 
            id: 'inlet', 
            label: 'Inlet (Volume 01)', 
            marsCode: 1, 
            position: 'left',
            connectionCode: 'CCC010000'
        },
        outlet: { 
            id: 'outlet', 
            label: 'Outlet (Volume 02)', 
            marsCode: 2, 
            position: 'right',
            connectionCode: 'CCC020000'
        }
    },
    flowDirection: 'unidirectional'
}

// 개선 상태
✅ 단방향 흐름 명시
✅ 체적별 연결 코드 정의
✅ 강제 방향성 구현
```

---

## 종합 분석 결과

### 포트 위치 표준화
| 컴포넌트 | 입구 위치 | 출구 위치 | 특별 포트 |
|----------|-----------|-----------|-----------|
| **SNGLVOL** | Left (Face 1) | Right (Face 2) | Top/Bottom (Face 3-4) |
| **TMDPVOL** | ❌ 없음 | Right (Volume 00) | - |
| **PIPE** | Left (Face 1) | Right (Face 2) | Top/Bottom (Face 3-4) |
| **SNGLJUN** | Left (From) | Right (To) | - |
| **TMDPJUN** | Left (From BC) | Right (To) | - |
| **HTSTR** | - | - | 4방향 열적 연결 |
| **VALVE** | Left (Inlet) | Right (Outlet) | 제어 신호 |
| **PUMP** | Left (Suction) | Right (Discharge) | - |

### 연결 검증 규칙
1. **출구면 → 입구면**: Face 2 → Face 1
2. **경계 조건**: TMDPVOL/TMDPJUN → 일반 컴포넌트만 가능
3. **강제 방향성**: PUMP, VALVE는 역방향 연결 금지
4. **열적 연결**: HTSTR은 질량 흐름 연결 금지

### 개선 완료 현황
- ✅ **PIPE**: MARS 표준 완전 구현
- ✅ **PUMP**: 단방향성 및 체적 매핑 완료  
- ✅ **SNGLJUN**: From/To 연결 및 UI 통합
- 🟡 **SNGLVOL**: 기본 구조만 구현
- 🟡 **TMDPVOL**: 소스 전용 구조 유지
- 🚨 **TMDPJUN**: 별도 컴포넌트 정의 필요
- 🚨 **HTSTR**: 열적 연결 포트 재설계 필요
- 🚨 **VALVE**: 신규 구현 필요

---

**작성일**: 2025-09-04  
**분석 기준**: MARS Input Manual + 실제 입력 파일 (SMART.i, copain.i)  
**대상 시스템**: sys_edit_cl NodeEditor 컴포넌트