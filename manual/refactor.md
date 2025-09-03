NodeInspector 컴포넌트 교체 작업 계획서

1. 요구사항 발견 (Requirements Discovery)

이 프로젝트의 목표는 기존 NodeInspector 컴포넌트의 근본적인 문제(데이터 불일치, 성능 저하, 나쁜 Undo/Redo 경험)를 해결하는 안정적이고 확장 가능한 신규 컴포넌트를 개발하는 것입니다.

* 핵심 목표 (Why):
    * 데이터 무결성 확보: 사용자가 입력한 데이터가 유실되는 현상을 원천적으로 제거한다.
    * 사용자 경험 개선: 의미 있는 단위(필드 입력 완료)로 Undo/Redo가 동작하도록 하여 직관적인 편집 경험을 제공한다.
    * 유지보수성 및 확장성 향상: 향후 새로운 노드 타입을 추가하거나 수정하기 쉬운 구조를 만든다.

* 사용자 여정 (User Journey):
    1. 사용자가 다이어그램에서 특정 노드를 클릭한다.
    2. 화면 우측에 해당 노드의 속성을 편집할 수 있는 인스펙터 UI가 나타난다.
    3. 사용자가 텍스트 필드에 값을 입력한다. (타이핑 중에는 UI가 부드럽게 반응해야 한다.)
    4. 사용자가 입력을 멈추면, 변경 사항이 자동으로 애플리케이션 전체 상태에 반영된다.
    5. 사용자가 'Undo'를 실행하면, 방금 필드에 입력한 내용 전체가 이전 상태로 복원된다.

* 성공 기준 (Success Criteria):
    * 필드 값 변경 후, 어떤 상황에서도 데이터가 유실되지 않는다.
    * Undo 실행 시, 키 입력 단위가 아닌 논리적 작업 단위로 실행 취소된다.
    * 복잡한 폼에서도 텍스트 입력 시 지연(lag)이 느껴지지 않는다.
    * 신규 컴포넌트의 코드는 테스트 가능하며, 주요 로직에 대한 단위 테스트가 존재한다.

* 제약 조건 (Constraints):
    * 기존 기술 스택(React, ReactFlow, Zustand) 내에서 구현해야 한다.
    * 기존 componentTypes 데이터 구조를 최대한 활용하되, 필요시 변환 계층을 둬서 처리한다.

  ---

2. 시스템 아키텍처 명세 (System Architecture Specifications)

* 컴포넌트 다이어그램:

1     [useFlowStore] <--- (전역 상태 업데이트) --- [NodeEditor]
2                                                     |
3                                           (Props 전달: node, definition, onPropertyChange)
4                                                     |
5                                                     v
6                                           [NewNodeInspector] ---> (재사용) ---> [FormField]
* NodeEditor는 useFlowStore의 상태를 구독하고, NewNodeInspector를 호스팅하며 양방향 데이터 흐름을 중재합니다.
* NewNodeInspector는 NodeEditor로부터 받은 데이터(Props)로 UI를 렌더링하고, 변경이 생기면 콜백 함수를 호출할 뿐, 전역 스토어의 존재를 알지 못합니다. 이는 느슨한 결합(Loose Coupling)을 유지하여 시스템의 유연성을 높입니다.

* 확장성 계획:
    * API 계약 기반 설계: NewNodeInspector는 명확한 Props API를 가집니다. 향후 완전히 다른 UI 라이브러리로 만든 인스펙터를 추가하더라도, 이 API 계약만 지키면 NodeEditor의 수정 없이 교체할 수 있습니다.
    * 설정 기반 UI: UI 구조가 componentDefinition이라는 데이터 객체에 의해 결정되므로, 새로운 노드 타입을 추가할 때 UI 코드를 직접 수정할 필요 없이 설정 파일(JS 객체)만 추가하면 됩니다.

* 기술 결정:
    * 상태 관리: Zustand를 계속 사용하되, 컴포넌트의 로컬 상태 사용을 최소화하고 단일 진실 공급원 원칙을 강화합니다.
    * 이벤트 처리: lodash.debounce를 사용하여 사용자의 연속적인 입력을 그룹화하고, 상태 업데이트 및 Undo 기록 생성을 최적화합니다.

  ---

3. API 및 UI 아키텍처 설계 (API & UI Architecture Design)

NewNodeInspector 컴포넌트 계약 (API)

* Props (입력):
    * node: object (필수): 현재 선택된 ReactFlow 노드 객체.
    * componentDefinition: object (필수): node.type에 해당하는 UI 렌더링 스키마.
    * onPropertyChange: (nodeId, key, value) => void (필수): debounce가 적용된, 상태 변경을 부모에게 알리는 콜백 함수.

* Responsibilities (역할):
    * 자체적으로 폼 데이터 상태를 소유하지 않는 완전한 제어 컴포넌트로 동작해야 합니다.
    * componentDefinition 객체를 해석하여 탭, 카드, 필드를 포함한 UI를 동적으로 렌더링해야 합니다.
    * 재사용 가능한 FormField 하위 컴포넌트를 통해 다양한 입력 타입을 처리해야 합니다.

UI 아키텍처

* 컴포넌트 계층 구조:
    * NewNodeInspector (컨테이너)
        * TabGroup (탭 관리)
            * Card (섹션 그룹)
                * FormField (개별 입력 필드)
* 접근성: 모든 FormField는 label과 input 요소가 올바르게 연결되어야 하며, 키보드만으로도 모든 기능을 사용할 수 있도록 설계합니다.
* 성능: React.memo를 FormField 등 순수 컴포넌트에 적용하여 불필요한 리렌더링을 최소화합니다.

  ---

4. 구현 가이드 및 로드맵 (Implementation Guidance & Roadmap)

개발 로드맵

* 1단계: 환경 설정 및 기반 구축 (1일)
    * lodash 라이브러리 설치 및 debounce 유틸리티 확인.
    * NodeEditor.jsx에 debounce가 적용된 handlePropChange 콜백 함수 프로토타입 구현.

* 2단계: 신규 컴포넌트 구조 설계 및 구현 (3일)
    * NewNodeInspector.jsx 및 FormField.jsx 파일 생성.
    * Props API 명세에 따라 컴포넌트 구조 설계.
    * componentDefinition을 받아 UI를 동적으로 렌더링하는 핵심 로직 구현. (로컬 상태 없이)

* 3단계: 통합 및 기능 구현 (2일)
    * NodeEditor.jsx에서 기존 NodeInspector를 NewNodeInspector로 교체하고 Props 연동.
    * FormField의 onChange 이벤트를 onPropertyChange 콜백과 연결.
    * Undo/Redo 기능이 의도대로 동작하는지 1차 검증.

* 4단계: 테스트 및 안정화 (2일)
    * NewNodeInspector와 FormField에 대한 단위 테스트(Unit Test) 작성.
    * 다양한 노드 타입과 입력 시나리오에 대한 통합 테스트 및 QA 진행.

* 5단계: 코드 정리 및 배포 (1일)
    * 기존 NodeInspector 및 관련 파일 삭제.
    * 최종 코드 리뷰 및 문서화.

품질 게이트 (Quality Gates)

* 2단계 완료 조건: 신규 컴포넌트가 props만으로 UI를 렌더링할 수 있어야 하며, 단위 테스트 커버리지가 80% 이상이어야 한다.
* 3단계 완료 조건: 모든 노드 타입에 대해 인스펙터가 오류 없이 렌더링되어야 하며, Undo/Redo의 기본 동작이 정상 작동해야 한다.
* 4단계 완료 조건: 모든 테스트 케이스를 통과하고, QA 과정에서 치명적인 버그가 발견되지 않아야 한다.

리스크 관리 (Risk Mitigation)

* 리스크: debounce 시간(500ms)이 너무 길거나 짧아 사용자 경험을 해칠 수 있음.
    * 완화 전략: 해당 시간을 쉽게 변경할 수 있도록 상수로 관리하고, QA 과정에서 최적의 값을 찾는다.
* 리스크: 특정 노드 타입의 복잡한 componentDefinition 구조를 처리하지 못하는 엣지 케이스 발생.
    * 완화 전략: 개발 단계에서 가장 복잡한 노드 타입을 기준으로 구현하고, 정의되지 않은 필드 타입에 대한 경고(warning) 또는 오류 처리 로직을 추가한다.

성공 지표 (Success Metrics)

* 정량적 지표: 리팩토링 이후, 데이터 유실과 관련된 버그 리포트가 0건으로 감소한다.
* 정성적 지표: 내부 사용자(또는 QA팀)가 Undo/Redo 기능의 사용성이 "훨씬 직관적이고 개선되었다"고 평가한다.
