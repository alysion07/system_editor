NodeInspector 리팩토링 영향 분석 및 체크리스트

종합 분석

NodeInspector의 상태 관리 로직(Debouncing 도입) 리팩토링은 단순히 해당 컴포넌트 하나에 국한되지 않습니다. 데이터의 흐름과 상태 업데이트의 주기를 변경하는 것이므로, NodeInspector와 데이터를 주고받는 모든 컴포넌트가 직간접적인 영향을 받습니다.

핵심 변경 사항은 "모든 키 입력마다 발생하던 상태 변경"을 "사용자의 입력이 끝난 후 일정 시간이 지나 한 번만 발생하는 상태 변경"으로 바꾸는 것입니다. 이로 인해 데이터 흐름의 중심에 있는 NodeEditor와 useFlowStore가 가장 큰 영향을 받게 됩니다.

1. 영향 받는 컴포넌트 상세 분석

가. NodeEditor.jsx (직접적, 가장 큰 영향)

* 역할: NodeInspector의 부모 컴포넌트로, 상태 변경을 처리하는 handlePropChange 함수를 onPropertyChange라는 이름의 prop으로 NodeInspector에 전달합니다.
* 영향 분석:
    1. 상태 업데이트 지연: 기존에는 onBlur 시점에만 업데이트했지만, 리팩토링 후에는 사용자가 입력을 멈춘 후 약 500ms 뒤에 업데이트됩니다. 이 "지연" 로직을 NodeEditor가 관리해야 합니다.
    2. Debounce 로직 구현: 상태 업데이트를 지연시키는 debounce 함수의 생성과 관리를 이 컴포넌트가 책임져야 합니다. useMemo와 같은 React Hook을 사용하여 불필요한 함수 재생성을 방지하는 최적화가 필요합니다.
* 결론: 리팩토링의 핵심 구현부가 될 컴포넌트입니다. debounce된 새로운 handlePropChange 함수를 만들어 NodeInspector에 주입하는 역할이 추가됩니다.

나. useFlowStore.jsx (간접적, 핵심적 영향)

* 역할: 애플리케이션의 모든 노드와 엣지 정보를 담고 있는 전역 스토어입니다. Undo/Redo 히스토리를 관리합니다.
* 영향 분석:
    1. Undo 단위 변경: 이 리팩토링의 가장 큰 목표입니다. updateNodeProp 함수가 호출되는 빈도가 줄어들면서, Undo 스택에 쌓이는 데이터의 단위가 '키 입력 하나'에서 '필드 입력 완료'로 변경됩니다.
    2. 호출 빈도 감소: NodeEditor에서 debounce를 적용하므로, useFlowStore의 updateNodeProp 함수는 훨씬 덜 호출됩니다. 이는 스토어의 부하를 줄여주고 메모리 사용량을 최적화하는 긍정적인 효과를 가져옵니다.
* 결론: useFlowStore.jsx 파일의 코드를 직접 수정할 필요는 없습니다. 하지만 이 컴포넌트의 동작 방식(Undo/Redo)이 리팩토링의 직접적인 수혜자이자 목표이므로, 가장 중요한 연관 컴포넌트입니다.

다. NodeInspector.jsx (직접적, 내부 로직 대폭 변경)

* 역할: 사용자 입력을 받아 onPropertyChange prop을 호출하여 상태 변경을 요청합니다.
* 영향 분석:
    1. 내부 상태 제거: 더 이상 임시 데이터를 저장하는 로컬 formValues 상태가 필요 없어집니다. 코드가 대폭 단순화됩니다.
    2. 로직 단순화: onBlur 핸들러, useEffect를 이용한 데이터 동기화 등 복잡한 로직이 모두 제거됩니다. 이제 NodeInspector는 그저 부모(NodeEditor)가 내려준 데이터를 보여주고, 변경이 생기면 부모에게 알리는 역할만 수행하면 됩니다.
* 결론: 리팩토링의 대상이 되는 컴포넌트로, 내부 구현이 훨씬 직관적이고 단순하게 변경됩니다.

라. Toolbar.jsx (간접적, 사용자 경험 영향)

* 역할: Undo/Redo 버튼을 포함하고 있는 툴바 컴포넌트입니다.
* 영향 분석: Toolbar.jsx의 코드는 변경되지 않지만, 이 컴포넌트가 제공하는 Undo/Redo 버튼의 사용자 경험이 완전히 달라집니다. 사용자는 더 이상 문자 하나를 지우기 위해 Undo를 누르지 않고, 의미 있는 단위로 작업을 되돌릴 수 있게 됩니다.
* 결론: 코드 변경은 없으나, 리팩토링의 성공 여부를 사용자가 직접 체감하게 되는 컴포넌트입니다.

  ---

2. 리팩토링을 위한 체크리스트

1단계: 준비 및 환경 설정

- [ ] 라이브러리 설치: debounce 함수를 사용하기 위해 lodash 라이브러리를 설치합니다. (npm install lodash 또는 yarn add lodash)
- [ ] 현상 분석: 리팩토링 전, 현재 애플리케이션에서 텍스트 필드에 값을 입력하고 Undo를 실행했을 때 한 글자씩 지워지는 현상을 직접 확인하고 기록합니다.
- [ ] (선택) 테스트 케이스 작성: 가능하다면, 위 현상을 재현하는 자동화된 테스트 케이스를 작성하여 리팩토링 후 성공 여부를 명확히 검증할 수 있도록 준비합니다.

2단계: NodeEditor.jsx 핵심 로직 수정

- [ ] lodash에서 debounce 함수를 import 합니다.
- [ ] react에서 useMemo Hook을 import 합니다.
- [ ] useMemo와 debounce를 조합하여, flowStore.updateNodeProp 호출을 500ms 지연시키는 debouncedUpdate 함수를 생성합니다.
- [ ] NodeInspector에 prop으로 전달할 handlePropChange 함수를 새로 작성하고, 이 함수가 내부적으로 debouncedUpdate를 호출하도록 구현합니다.
- [ ] NodeInspector 컴포넌트에 onPropertyChange prop으로 새로 만든 handlePropChange 함수를 전달합니다.

3단계: NodeInspector.jsx 내부 구조 단순화

- [ ] useState를 사용하여 관리하던 로컬 formValues 상태를 완전히 제거합니다.
- [ ] handleBlur 함수와 관련 로직을 모두 제거합니다.
- [ ] useEffect를 사용하여 selectedNode의 데이터를 formValues에 동기화하던 로직을 모두 제거합니다.
- [ ] 모든 입력 필드(input, select 등)가 props로 내려온 selectedNode.data.componentProp에서 직접 값을 읽도록 수정합니다.
- [ ] 모든 입력 필드의 onChange 이벤트 핸들러가 props.onPropertyChange를 직접 호출하도록 수정합니다. (내부 handleFieldChange 함수도 단순화되거나 제거될 수 있습니다.)

4단계: 검증 및 테스트

- [ ] 기능 검증 (Manual):
    - [ ] 텍스트 필드에 여러 글자를 빠르게 입력했을 때, 입력이 부드럽게 되는지 확인합니다.
    - [ ] 입력을 멈추고 약 0.5초 후, Undo 버튼을 한 번 눌렀을 때 필드의 내용 전체가 이전 상태로 돌아가는지 확인합니다. (한 글자씩 지워지면 실패)
    - [ ] 값을 수정한 뒤 다른 작업을 해도 데이터가 유실되지 않고 정상적으로 저장되는지 확인합니다.
- [ ] 테스트 실행: 만약 1단계에서 테스트 케이스를 작성했다면, 해당 테스트를 실행하여 통과하는지 확인합니다. 기존 테스트가 있다면 모두 실행하여 깨지는 부분이 없는지 확인합니다.
- [ ] 코드 정리: 더 이상 사용되지 않는 변수나 함수가 남아있지 않은지 확인하고 최종적으로 코드를 정리합니다.