# MARS GUI 전처리기 구현 계획서

> React Flow 기반 MARS 전처리 GUI 시스템 완전 재구현 계획

##  프로젝트 개요

### 목표
- SMART.i 기준 MARS 입력 덱 생성을 위한 웹 기반 전처리기 개발
- 노드/엣지 그래픽 UI를 통한 직관적인 계통 모델링
- MARS CCC 카드 구조 자동 생성 및 검증
- 실시간 유효성 검사 및 오류 방지

### 핵심 기능
- **11개 MARS 컴포넌트 타입 지원**: snglvol, pipe, sngljun, mtpljun, branch, pump, valve, prizer, sg, accumulator, eccmixer 등
- **자동 CCC 번호 관리**: 시스템별 번호 범위 (100-199: Primary, 200-299: Secondary 등)
- **실시간 연결 검증**: from/to 규칙, phase 매칭, 방향성 제약 검사
- **MARS 포맷 자동 생성**: 슬롯 매핑을 통한 CCC 카드 구조 출력

---

## 🏗️ 시스템 아키텍처

### 계층 구조
```
┌─────────────────────────────────────┐
│        Presentation Layer           │
│     (React + React Flow UI)         │
├─────────────────────────────────────┤
│        Business Logic Layer         │
│  (Validation, Export, Numbering)    │
├─────────────────────────────────────┤
│          Data Layer                 │
│      (Zustand State Stores)         │
├─────────────────────────────────────┤
│          Type Layer                 │
│    (TypeScript Definitions)         │
└─────────────────────────────────────┘
```

### 핵심 설계 결정
- **React Flow**: 검증된 그래프 시각화 라이브러리
- **Zustand**: 가벼운 상태 관리 (Redux 대비 React Flow 호환성 우수)
- **TypeScript**: 타입 안전성으로 복잡한 MARS 규칙 관리
- **커스텀 검증 엔진**: MARS 고유 규칙 처리
- **실시간 검증**: 사용자 경험 최적화

---

## 📂 파일 구조 및 모듈 조직

### 전체 디렉토리 구조
```
mars-gui/
├── public/
├── src/
│   ├── components/              # React 컴포넌트
│   │   ├── nodes/              # MARS 노드 컴포넌트
│   │   ├── edges/              # 연결선 컴포넌트
│   │   ├── ui/                 # 공통 UI 컴포넌트
│   │   └── canvas/             # 캔버스 관련 컴포넌트
│   ├── engine/                 # 비즈니스 로직
│   │   ├── validation/         # 검증 엔진
│   │   ├── export/             # MARS 출력 엔진
│   │   ├── numbering/          # CCC 번호 관리
│   │   └── graph/              # 그래프 연산
│   ├── store/                  # 상태 관리
│   ├── types/                  # 타입 정의
│   ├── utils/                  # 유틸리티 함수
│   ├── hooks/                  # 커스텀 훅
│   └── App.tsx                 # 메인 애플리케이션
├── tests/                      # 테스트 파일
├── docs/                       # 문서
└── package.json
```

### 🎨 주요 컴포넌트 파일

#### Node 컴포넌트 (src/components/nodes/)
```
SnglvolNode.tsx          # 단일 체적 노드
PipeNode.tsx             # 파이프 노드 (다중 셀 지원)
PumpNode.tsx             # 펌프 노드 (inlet/outlet + 곡선)
ValveNode.tsx            # 밸브 노드 (트립 로직 지원)
BranchNode.tsx           # 분기 노드 (다중 junction)
MtpljunNode.tsx          # 다중 접합 노드
EccMixerNode.tsx         # ECC 혼합기 (3-port 필수)
PrizerNode.tsx           # 가압기 노드
SgNode.tsx               # 증기발생기 노드
AccumulatorNode.tsx      # 축압기 노드
TmdpvolNode.tsx          # 시간의존 체적
TmdpjunNode.tsx          # 시간의존 접합
CircltrNode.tsx          # 순환기 노드
BaseNode.tsx             # 공통 노드 기능
NodeFactory.tsx          # 노드 생성 팩토리
```

#### Edge 컴포넌트 (src/components/edges/)
```
MarsEdge.tsx             # MARS 연결선 (from/to 표시)
ConnectionValidator.tsx   # 연결 유효성 실시간 검사
EdgeFactory.tsx          # 엣지 타입 결정 로직
JunctionHandler.tsx      # junction 매개변수 처리
```

#### UI 컴포넌트 (src/components/ui/)
```
ComponentPalette.tsx     # 컴포넌트 팔레트 (드래그 앤 드롭)
PropertiesPanel.tsx      # 노드/엣지 속성 패널
ValidationPanel.tsx      # 검증 결과 표시 패널
ExportPreview.tsx        # MARS 출력 미리보기
ParameterForm.tsx        # 동적 매개변수 입력 폼
ErrorTooltip.tsx         # 오류 툴팁 컴포넌트
ProgressIndicator.tsx    # 진행 상황 표시
```

#### Canvas 컴포넌트 (src/components/canvas/)
```
FlowCanvas.tsx           # 메인 React Flow 캔버스
Toolbar.tsx              # 도구 모음 (저장/불러오기 등)
GridBackground.tsx       # 격자 배경
MiniMap.tsx              # 미니맵 컴포넌트
```

### ⚙️ 비즈니스 로직 파일 (src/engine/)

#### 검증 엔진 (src/engine/validation/)
```
ValidationEngine.ts      # 메인 검증 엔진
ConnectionRules.ts       # 연결 규칙 (from/to, phase, 방향)
ComponentRules.ts        # 컴포넌트별 규칙
MarsRules.ts             # MARS 고유 규칙
PortConflictChecker.ts   # 포트 충돌 검사
PhaseValidator.ts        # phase 매칭 검증
GeometryValidator.ts     # 기하 매개변수 검증
```

#### 출력 엔진 (src/engine/export/)
```
MarsExporter.ts          # 메인 출력 엔진
CardGenerator.ts         # CCC 카드 생성기
SlotMapper.ts            # 슬롯 매핑 (PLAN.md 기준)
ComponentExporter.ts     # 컴포넌트별 출력 로직
JunctionExporter.ts      # 접합 출력 로직
FormatValidator.ts       # 출력 포맷 검증
```

#### CCC 번호 관리 (src/engine/numbering/)
```
CCCNumbering.ts          # CCC 번호 할당/관리
SystemRanges.ts          # 시스템별 번호 범위
ConflictResolver.ts      # 번호 충돌 해결
NumberGenerator.ts       # 자동 번호 생성
```

#### 그래프 연산 (src/engine/graph/)
```
GraphOperations.ts       # 그래프 기본 연산
PortManager.ts           # 포트 관리 (생성/삭제/연결)
ConnectionManager.ts     # 연결 관리
NodeLifecycle.ts         # 노드 생명주기 관리
```

###  상태 관리 파일 (src/store/)
```
graphStore.ts            # 노드/엣지 상태
validationStore.ts       # 검증 결과 상태  
exportStore.ts           # 출력 설정 상태
uiStore.ts               # UI 상태 (선택, 패널 등)
numberingStore.ts        # CCC 번호 할당 상태
historyStore.ts          # Undo/Redo 상태
```

###  타입 정의 파일 (src/types/)
```
mars-types.ts            # MARS 노드/엣지 타입
component-schemas.ts     # 컴포넌트별 스키마
validation-types.ts      # 검증 관련 타입
export-types.ts          # 출력 관련 타입
ui-types.ts              # UI 상태 타입
port-types.ts            # 포트 시스템 타입
```

###  유틸리티 파일 (src/utils/)
```
mars-utils.ts            # MARS 전용 유틸리티
graph-utils.ts           # 그래프 조작 유틸리티
validation-utils.ts      # 검증 헬퍼 함수
format-utils.ts          # 포맷 변환 유틸리티
port-utils.ts            # 포트 관리 유틸리티
```

###  커스텀 훅 (src/hooks/)
```
useValidation.ts         # 검증 상태 관리
useExport.ts             # 출력 기능 관리
useGraphOperations.ts    # 그래프 연산 훅
useNodeConnection.ts     # 노드 연결 관리
useParameterForm.ts      # 매개변수 폼 관리
useCCCNumbering.ts       # CCC 번호 관리
```

---

##  기술 스택

### 핵심 기술
| 기술 | 버전 | 목적 |
|------|------|------|
| React | 18+ | UI 프레임워크 |
| TypeScript | 5+ | 타입 안전성 |
| React Flow | 11+ | 그래프 시각화 |
| Vite | 4+ | 빌드 도구 |
| Zustand | 4+ | 상태 관리 |

### UI 및 스타일링
| 기술 | 목적 |
|------|------|
| Tailwind CSS | 유틸리티 스타일링 |
| Headless UI | 접근성 컴포넌트 |
| React Hook Form | 복잡한 폼 관리 |
| Radix UI | 고급 UI 컴포넌트 |

### 개발 도구
| 기술 | 목적 |
|------|------|
| ESLint + Prettier | 코드 품질 |
| Jest + RTL | 테스트 |
| Storybook | 컴포넌트 개발 |
| Zod | 런타임 검증 |

---

## 📋 단계별 구현 계획

### Phase 1: 기초 인프라 (주 1-2)
**목표**: 프로젝트 기반 구조 및 기본 React Flow 통합

#### 주요 작업
- [x] 프로젝트 초기화 (Vite + React + TypeScript)
- [x] React Flow 기본 설정 및 캔버스 구현
- [x] 기본 상태 관리 구조 (Zustand 스토어)
- [x] 핵심 타입 정의 (`mars-types.ts`, `component-schemas.ts`)
- [x] 기본 노드/엣지 렌더링 테스트

#### 완료 기준
- ✅ 빈 React Flow 캔버스가 렌더링됨
- ✅ 기본 노드를 생성/삭제할 수 있음
- ✅ TypeScript 컴파일 에러 없음
- ✅ 기본 테스트 환경 구성 완료

---

### Phase 2: 노드 시스템 구현 (주 3-4)
**목표**: MARS 컴포넌트별 커스텀 노드 구현

#### 주요 작업
**Week 3**: 기본 노드 타입
- [x] BaseNode 추상 클래스 구현
- [x] SnglvolNode, PipeNode 구현
- [x] 포트 시스템 기초 구현 (PortManager)
- [x] 노드 생성/삭제 기능

**Week 4**: 고급 노드 타입
- [x] PumpNode (inlet/outlet 포트)
- [x] ValveNode (제어 로직 지원)
- [x] BranchNode, MtpljunNode (다중 접합)
- [x] EccMixerNode (3-port 필수 구조)

#### 완료 기준
- ✅ 11개 MARS 컴포넌트 노드 모두 렌더링 가능
- ✅ 각 노드의 고유 포트 구조 구현
- ✅ 노드별 기본 매개변수 관리
- ✅ ComponentPalette에서 드래그 앤 드롭 생성

---

### Phase 3: 연결 시스템 구현 (주 5-6)
**목표**: 엣지 생성, 검증, 매개변수 관리

#### 주요 작업
**Week 5**: 기본 연결 기능
- [x] MarsEdge 컴포넌트 구현
- [x] 드래그 앤 드롭 연결 기능
- [x] from/to 포트 참조 시스템
- [x] 기본 연결 검증 (출력→입력)

**Week 6**: 고급 연결 규칙
- [x] Phase 매칭 검증 (liquid↔liquid 등)
- [x] 포트 용량 제한 (single inlet vs multi outlet)
- [x] 연결 매개변수 팝오버 (area, kfor, krev, flags)
- [x] 실시간 연결 피드백 시스템

#### 완료 기준
- ✅ 유효한 연결만 생성 가능
- ✅ 연결 시도 시 실시간 검증 피드백
- ✅ 연결 매개변수 편집 가능
- ✅ 잘못된 연결 시 명확한 오류 메시지

---

### Phase 4: 검증 엔진 구현 (주 7-8)  
**목표**: 종합적인 MARS 규칙 검증 시스템

#### 주요 작업
**Week 7**: 핵심 검증 규칙
- [x] ValidationEngine 메인 클래스
- [x] CCC 번호 중복 검사
- [x] 포트 충돌 검사 (CCCVV000N 중복 방지)
- [x] 그래프 연결성 검사 (고아 노드 탐지)

**Week 8**: MARS 고유 규칙
- [x] 컴포넌트별 필수 매개변수 검사
- [x] 금지 조합 검사 (매뉴얼 기준)
- [x] 물리적 제약 검사 (기하, 압력 등)
- [x] 실시간 검증 결과 UI 표시

#### 완료 기준
- ✅ 모든 MARS 규칙이 자동 검증됨
- ✅ ValidationPanel에서 오류/경고 목록 표시
- ✅ 검증 실패 시 출력 방지
- ✅ 실시간 검증으로 사용자 가이드 제공

---

### Phase 5: 출력 시스템 구현 (주 9-10)
**목표**: MARS 포맷 출력 및 파일 생성

#### 주요 작업
**Week 9**: 기본 출력 기능
- [x] MarsExporter 메인 클래스
- [x] CCC 번호 자동 할당 시스템
- [x] 기본 컴포넌트 카드 생성 (CCC0000)
- [x] 단순 junction 카드 생성

**Week 10**: 고급 출력 기능
- [x] SlotMapper를 통한 복잡한 매개변수 출력
- [x] 테이블 데이터 처리 (H-Q 곡선 등)
- [x] 출력 검증 및 미리보기 기능
- [x] 파일 다운로드 기능

#### 완료 기준
- ✅ 유효한 MARS 입력 덱 생성
- ✅ PLAN.md의 슬롯 매핑 테이블 완전 구현
- ✅ 출력 전 검증으로 오류 방지
- ✅ ExportPreview로 사용자 확인 가능

---

### Phase 6: UI 완성 및 최적화 (주 11-12)
**목표**: 사용자 경험 개선 및 성능 최적화

#### 주요 작업
**Week 11**: 사용자 경험 개선
- [x] 프로젝트 저장/불러오기 기능
- [x] Undo/Redo 시스템
- [x] 키보드 단축키 지원
- [x] 컨텍스트 메뉴 및 도구 모음

**Week 12**: 성능 및 품질
- [x] 대용량 그래프 최적화
- [x] 메모리 사용 최적화
- [x] 접근성 개선 (스크린 리더 등)
- [x] 포괄적인 테스트 스위트

#### 완료 기준
- ✅ 100+ 노드 그래프에서 원활한 성능
- ✅ 직관적이고 반응성 있는 UI
- ✅ 포괄적인 테스트 커버리지 (>80%)
- ✅ 프로덕션 배포 준비 완료

---

## ⚠️ 위험 요소 및 완화 전략

### 성능 위험
| 위험 | 영향 | 완화 전략 |
|------|------|----------|
| 대용량 그래프 렌더링 지연 | 높음 | React Flow 최적화, 가상화 |
| 실시간 검증 성능 저하 | 중간 | 디바운싱, 백그라운드 검증 |
| 메모리 사용량 증가 | 중간 | 메모이제이션, 지연 로딩 |

### 데이터 일관성 위험
| 위험 | 영향 | 완화 전략 |
|------|------|----------|
| CCC 번호 충돌 | 높음 | 중앙집중식 번호 관리 |
| 상태 동기화 오류 | 높음 | Immutable 상태, 트랜잭션 |
| 검증 상태 불일치 | 중간 | 상태 의존성 명시적 관리 |

### 사용자 경험 위험
| 위험 | 영향 | 완화 전략 |
|------|------|----------|
| 학습 곡선 가파름 | 중간 | 단계별 튜토리얼, 컨텍스트 도움말 |
| 복잡한 매개변수 관리 | 높음 | 직관적 폼 디자인, 기본값 |
| 오류 복구 어려움 | 높음 | 강력한 Undo/Redo, 자동 저장 |

---

## 🎯 성공 기준

### 기능적 요구사항
- [x] **완전한 MARS 지원**: 11개 모든 컴포넌트 타입 구현
- [x] **정확한 검증**: PLAN.md의 모든 규칙 구현
- [x] **올바른 출력**: 유효한 MARS 입력 덱 생성
- [x] **직관적 UI**: 비전문가도 사용 가능한 인터페이스

### 비기능적 요구사항
- [x] **성능**: 100+ 노드 그래프에서 < 2초 응답
- [x] **신뢰성**: 99%+ 검증 정확도
- [x] **접근성**: WCAG 2.1 AA 준수
- [x] **확장성**: 새로운 MARS 컴포넌트 추가 용이

### 품질 기준
- [x] **테스트 커버리지**: >80% 코드 커버리지
- [x] **타입 안전성**: 100% TypeScript, strict 모드
- [x] **코드 품질**: ESLint/Prettier 준수
- [x] **문서화**: 완전한 API 문서 및 사용 가이드

---

## 🚀 배포 및 운영

### 개발 환경
```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 시작
npm run test         # 테스트 실행
npm run build        # 프로덕션 빌드
```

### 빌드 출력물
- `dist/`: 정적 파일 (HTML, CSS, JS)
- 단일 페이지 애플리케이션 (SPA)
- CDN 배포 가능

### 브라우저 지원
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 📚 참고 자료

- [PLAN.md](./PLAN.md) - MARS 전처리 GUI 설계 스펙
- [React Flow 공식 문서](https://reactflow.dev/)
- SMART.i 매뉴얼 - MARS 컴포넌트 사양
- 핵공학 열수력 시뮬레이션 가이드

---

## 📞 추가 고려사항

### 확장 가능성
- **플러그인 아키텍처**: 새로운 컴포넌트 타입 추가
- **테마 시스템**: 다크/라이트 모드 지원
- **다국어 지원**: i18n 국제화 준비
- **클라우드 연동**: 프로젝트 클라우드 저장 기능

### 성능 최적화
- **코드 분할**: 컴포넌트별 지연 로딩
- **서비스 워커**: 오프라인 지원
- **웹어셈블리**: 복잡한 계산 최적화
- **CDN 캐싱**: 정적 자원 최적화

이 계획서는 MARS GUI 전처리기의 완전한 재구현을 위한 포괄적인 로드맵을 제공합니다. 각 단계별 구현을 통해 안정적이고 확장 가능한 시스템을 구축할 수 있습니다.