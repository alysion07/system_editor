const SNGLJUN = {
    type: 'SNGLJUN',
    label: 'SGJ',
    description: '단일 접합부 컴포넌트는 두 체적을 연결하는 유체 흐름 경로를 나타냅니다.',
    category:'hydro',
    icon: 'SGJ',
    ports: {
        inputs: [
            { 
                id: "from", 
                label: "From",
                position: 'left',
                marsCode: 1,
                connectionType: 'fluid',
                description: '유체 흐름 입구 (Face 1 연결)'
            }
        ],
        outputs: [
            { 
                id: "to", 
                label: "To",
                position: 'right',
                marsCode: 2,
                connectionType: 'fluid',
                description: '유체 흐름 출구 (Face 2 연결)'
            }
        ]
    },
    properties: {
        tabs: [
            {
                id: "geometry",
                label: "접합부 기하학적 데이터",
                cards: [
                    {
                        id: "CCC0101-0109",
                        label: "접합부 기하학적 데이터",
                        description: "접합부의 기하학적 특성과 연결 정보를 정의합니다.",
                        fields: [
                            {
                                id: "fromConnection",
                                label: "연결 시작점 (From)",
                                type: "text",
                                placeholder: "ccc000000 또는 cccvv000n",
                                description: "접합부 시작점 연결 코드",
                                helpText: "구형 형식: ccc000000(입구), ccc010000(출구). 확장 형식: cccvv000n(ccc=컴포넌트번호, vv=체적번호, n=면번호)",
                                required: true
                            },
                            {
                                id: "toConnection",
                                label: "연결 종료점 (To)",
                                type: "text",
                                placeholder: "ccc000000 또는 cccvv000n",
                                description: "접합부 종료점 연결 코드",
                                helpText: "구형 형식: ccc000000(입구), ccc010000(출구). 확장 형식: cccvv000n(ccc=컴포넌트번호, vv=체적번호, n=면번호)",
                                required: true
                            },
                            {
                                id: "junctionArea",
                                label: "접합부 면적",
                                type: "number",
                                unit: "m², ft²",
                                placeholder: "0.0",
                                description: "접합부 유동 면적",
                                helpText: "0 입력 시 인접한 체적의 최소 유동 면적으로 자동 설정됨",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "forwardLossCoef",
                                label: "순방향 유동 손실 계수 (AF)",
                                type: "number",
                                placeholder: "0.0",
                                description: "레이놀즈 수 독립적 순방향 에너지 손실 계수",
                                helpText: "접합부 속도가 양수일 때 사용됨",
                                required: true,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "reverseLossCoef",
                                label: "역방향 유동 손실 계수 (AR)",
                                type: "number",
                                placeholder: "0.0",
                                description: "레이놀즈 수 독립적 역방향 에너지 손실 계수",
                                helpText: "접합부 속도가 음수일 때 사용됨",
                                required: true,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "junctionFlags",
                                label: "접합부 제어 플래그",
                                type: "flags",
                                description: "다양한 물리적 모델 및 옵션을 제어하는 플래그",
                                helpText: "형식: jefvcahs (각 문자는 특정 옵션을 제어)",
                                required: true,
                                subfields: [
                                    {
                                        id: "jFlag",
                                        label: "제트 접합부 (j)",
                                        type: "select",
                                        options: [
                                            { value: "0", label: "제트 접합부 아님" },
                                            { value: "1", label: "제트 접합부" }
                                        ],
                                        description: "제트 접합부 설정",
                                        helpText: "제트 접합부는 풀 표면 응축을 향상시킵니다",
                                        default: "0"
                                    },
                                    {
                                        id: "eFlag",
                                        label: "수정된 PV 항 (e)",
                                        type: "select",
                                        options: [
                                            { value: "0", label: "적용 안함" },
                                            { value: "1", label: "적용" }
                                        ],
                                        description: "에너지 방정식의 수정된 PV 항",
                                        default: "0"
                                    },
                                    {
                                        id: "fFlag",
                                        label: "CCFL 옵션 (f)",
                                        type: "select",
                                        options: [
                                            { value: "0", label: "CCFL 모델 사용 안함" },
                                            { value: "1", label: "CCFL 모델 사용" }
                                        ],
                                        description: "역류 제한(CCFL) 모델 적용 여부",
                                        default: "0"
                                    },
                                    {
                                        id: "vFlag",
                                        label: "수평 성층화 모델 (v)",
                                        type: "select",
                                        options: [
                                            { value: "0", label: "모델 적용 안함" },
                                            { value: "1", label: "상향 지향 접합부" },
                                            { value: "2", label: "하향 지향 접합부" },
                                            { value: "3", label: "중앙(측면) 위치 접합부" },
                                            { value: "4", label: "확장된 각진 측면 접합부" }
                                        ],
                                        description: "수평 성층화 견인/끌어당김 옵션",
                                        helpText: "수평 체적에 연결된 접합부에 대한 모델",
                                        default: "0"
                                    },
                                    {
                                        id: "cFlag",
                                        label: "초킹 옵션 (c)",
                                        type: "select",
                                        options: [
                                            { value: "0", label: "초킹 모델 적용" },
                                            { value: "1", label: "초킹 모델 적용 안함" }
                                        ],
                                        description: "유동 초킹(choking) 모델 적용 여부",
                                        default: "0"
                                    },
                                    {
                                        id: "aFlag",
                                        label: "면적 변화 옵션 (a)",
                                        type: "select",
                                        options: [
                                            { value: "0", label: "매끄러운 면적 변화" },
                                            { value: "1", label: "완전 급격 면적 변화" },
                                            { value: "2", label: "부분 급격 면적 변화" }
                                        ],
                                        description: "면적 변화에 따른 모델링 방식",
                                        helpText: "면적 변화에 따른 손실 계수 계산 방법",
                                        default: "0"
                                    },
                                    {
                                        id: "hFlag",
                                        label: "동질/비동질 옵션 (h)",
                                        type: "select",
                                        options: [
                                            { value: "0", label: "비동질(두 속도 운동량 방정식)" },
                                            { value: "1", label: "동질(단일 속도 운동량 방정식)" },
                                            { value: "2", label: "동질(단일 속도 운동량 방정식)" }
                                        ],
                                        description: "유체 혼합물의 동질성 가정",
                                        default: "0"
                                    },
                                    {
                                        id: "sFlag",
                                        label: "운동량 플럭스 옵션 (s)",
                                        type: "select",
                                        options: [
                                            { value: "0", label: "양쪽 체적에서 운동량 플럭스 사용" },
                                            { value: "1", label: "시작 체적만 운동량 플럭스 사용" },
                                            { value: "2", label: "종료 체적만 운동량 플럭스 사용" },
                                            { value: "3", label: "운동량 플럭스 사용 안함" }
                                        ],
                                        description: "운동량 플럭스 적용 방식",
                                        default: "0"
                                    }
                                ]
                            },
                            {
                                id: "dischargeCoef",
                                label: "방출 계수",
                                type: "number",
                                placeholder: "1.0",
                                description: "Henry-Fauske 임계 유동 모델의 방출 계수",
                                helpText: "미입력 시 기본값 1.0 사용",
                                conditionalDisplay: {
                                    field: "junctionFlags.cFlag",
                                    value: "0"
                                },
                                validation: {
                                    min: 0,
                                    max: 2
                                }
                            },
                            {
                                id: "thermalNonequilConstant",
                                label: "열적 비평형 상수",
                                type: "number",
                                placeholder: "0.14",
                                description: "Henry-Fauske 임계 유동 모델의 열적 비평형 상수",
                                helpText: "미입력 시 기본값 0.14 사용, <0.01: 평형 옵션, >1000: 동결 옵션",
                                conditionalDisplay: {
                                    field: "junctionFlags.cFlag",
                                    value: "0"
                                }
                            },
                            {
                                id: "subcooledDischargeCoef",
                                label: "과냉각 방출 계수",
                                type: "number",
                                placeholder: "1.0",
                                description: "원래 RELAP5 임계 유동 모델의 과냉각 방출 계수",
                                helpText: "미입력 시 기본값 1.0 사용",
                                conditionalDisplay: {
                                    field: "junctionFlags.cFlag",
                                    value: "0"
                                },
                                validation: {
                                    min: 0,
                                    max: 2
                                }
                            },
                            {
                                id: "twoPhaseDischCoef",
                                label: "이상(two-phase) 방출 계수",
                                type: "number",
                                placeholder: "1.0",
                                description: "원래 RELAP5 임계 유동 모델의 이상 방출 계수",
                                helpText: "미입력 시 기본값 1.0 사용",
                                conditionalDisplay: {
                                    field: "junctionFlags.cFlag",
                                    value: "0"
                                },
                                validation: {
                                    min: 0,
                                    max: 2
                                }
                            },
                            {
                                id: "superheatedDischCoef",
                                label: "과열증기 방출 계수",
                                type: "number",
                                placeholder: "1.0",
                                description: "원래 RELAP5 임계 유동 모델의 과열증기 방출 계수",
                                helpText: "미입력 시 기본값 1.0 사용",
                                conditionalDisplay: {
                                    field: "junctionFlags.cFlag",
                                    value: "0"
                                },
                                validation: {
                                    min: 0,
                                    max: 2
                                }
                            },
                            {
                                id: "horizontalAngle",
                                label: "수평 각도",
                                type: "number",
                                unit: "도",
                                placeholder: "0.0",
                                description: "시작 체적과 종료 체적 사이의 수평 각도",
                                conditionalDisplay: {
                                    field: "junctionFlags.vFlag",
                                    value: "4"
                                },
                                validation: {
                                    min: -180,
                                    max: 180
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: "ccflData",
                label: "직경 및 CCFL 데이터",
                cards: [
                    {
                        id: "CCC0110",
                        label: "접합부 수력학적 직경 및 CCFL 데이터",
                        description: "접합부 직경과 역류 제한(CCFL) 모델 매개변수를 정의합니다. (선택 사항)",
                        fields: [
                            {
                                id: "hydraulicDiameter",
                                label: "수력학적 직경",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "접합부 수력학적 직경",
                                helpText: "CCFL 상관식과 계면 항력에 사용됨. 0 입력 시 면적에서 자동 계산.",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "floodingForm",
                                label: "침수 상관식 형태 (β)",
                                type: "number",
                                placeholder: "0.0",
                                description: "CCFL 상관식 형태",
                                helpText: "0: Wallis 형태, 1: Kutateladze 형태, 0~1: Bankoff 가중치",
                                conditionalDisplay: {
                                    field: "junctionFlags.fFlag",
                                    value: "1"
                                },
                                validation: {
                                    min: 0,
                                    max: 1
                                }
                            },
                            {
                                id: "gasIntercept",
                                label: "가스 절편 (c)",
                                type: "number",
                                placeholder: "1.0",
                                description: "CCFL 상관식의 가스 절편",
                                helpText: "Hf^(1/2) = 0일 때 사용됨",
                                conditionalDisplay: {
                                    field: "junctionFlags.fFlag",
                                    value: "1"
                                },
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "slope",
                                label: "기울기 (m)",
                                type: "number",
                                placeholder: "1.0",
                                description: "CCFL 상관식의 기울기",
                                conditionalDisplay: {
                                    field: "junctionFlags.fFlag",
                                    value: "1"
                                },
                                validation: {
                                    min: 0
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: "formLossData",
                label: "형상 손실 데이터",
                cards: [
                    {
                        id: "CCC0111",
                        label: "접합부 형상 손실 데이터",
                        description: "레이놀즈 수에 따른 형상 손실 계수를 정의합니다. (선택 사항)",
                        fields: [
                            {
                                id: "volumeNumber",
                                label: "체적 번호",
                                type: "number",
                                placeholder: "1",
                                description: "ORNL ANS 인터페이스 모델의 체적 번호 (W3(I))",
                                helpText: "ORNL ANS 인터페이스 모델 사용 시 필요한 체적 번호",
                                required: false,
                                validation: {
                                    min: 1,
                                    custom: "validateInteger"
                                }
                            },
                            {
                                id: "BF",
                                label: "순방향 BF",
                                type: "number",
                                placeholder: "0.0",
                                description: "순방향 형상 손실 계수의 레이놀즈 수 의존 계수",
                                helpText: "KF = AF + BF*Re^(-CF)",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "CF",
                                label: "순방향 CF",
                                type: "number",
                                placeholder: "0.0",
                                description: "순방향 형상 손실 계수의 레이놀즈 수 지수",
                                helpText: "KF = AF + BF*Re^(-CF)",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "BR",
                                label: "역방향 BR",
                                type: "number",
                                placeholder: "0.0",
                                description: "역방향 형상 손실 계수의 레이놀즈 수 의존 계수",
                                helpText: "KR = AR + BR*Re^(-CR)",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "CR",
                                label: "역방향 CR",
                                type: "number",
                                placeholder: "0.0",
                                description: "역방향 형상 손실 계수의 레이놀즈 수 지수",
                                helpText: "KR = AR + BR*Re^(-CR)",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: "initialConditions",
                label: "초기 조건",
                cards: [
                    {
                        id: "CCC0201",
                        label: "접합부 초기 조건",
                        description: "접합부의 초기 유동 상태를 정의합니다.",
                        fields: [
                            {
                                id: "initControlWord",
                                label: "제어 단어",
                                type: "select",
                                options: [
                                    { value: "0", label: "속도 입력" },
                                    { value: "1", label: "질량 유량 입력" }
                                ],
                                description: "초기 조건 입력 방식",
                                required: true,
                                default: "0"
                            },
                            {
                                id: "initLiquidVel",
                                label: "초기 액체 속도",
                                type: "number",
                                unit: "m/s, ft/s",
                                placeholder: "0.0",
                                description: "초기 액체 속도",
                                conditionalDisplay: {
                                    field: "initControlWord",
                                    value: "0"
                                },
                                required: true
                            },
                            {
                                id: "initVaporVel",
                                label: "초기 증기 속도",
                                type: "number",
                                unit: "m/s, ft/s",
                                placeholder: "0.0",
                                description: "초기 증기 속도",
                                conditionalDisplay: {
                                    field: "initControlWord",
                                    value: "0"
                                },
                                required: true
                            },
                            {
                                id: "initLiquidFlow",
                                label: "초기 액체 질량 유량",
                                type: "number",
                                unit: "kg/s, lb/s",
                                placeholder: "0.0",
                                description: "초기 액체 질량 유량",
                                conditionalDisplay: {
                                    field: "initControlWord",
                                    value: "1"
                                },
                                required: true
                            },
                            {
                                id: "initVaporFlow",
                                label: "초기 증기 질량 유량",
                                type: "number",
                                unit: "kg/s, lb/s",
                                placeholder: "0.0",
                                description: "초기 증기 질량 유량",
                                conditionalDisplay: {
                                    field: "initControlWord",
                                    value: "1"
                                },
                                required: true
                            },
                            {
                                id: "interfaceVelocity",
                                label: "계면 속도",
                                type: "number",
                                unit: "m/s, ft/s",
                                placeholder: "0.0",
                                description: "계면 속도",
                                helpText: "항상 0을 입력하세요",
                                default: "0.0",
                                required: true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    formatters: {
        generateHeader: function(component) {
            return `* SNGLJUN 컴포넌트 입력\n*\n${component.number}0000  ${component.name}  SNGLJUN\n`;
        },
        formatGeometryCard: function(data) {
            // CCC0101-0109 카드 데이터 포맷팅
            let output = `${data.componentNumber}0101  ${data.fromConnection}  ${data.toConnection}  ${data.junctionArea || '0.0'}  `;
            output += `${data.forwardLossCoef || '0.0'}  ${data.reverseLossCoef || '0.0'}  `;

            // 접합부 제어 플래그 생성
            const jFlags = {
                j: data.junctionFlags?.jFlag || '0',
                e: data.junctionFlags?.eFlag || '0',
                f: data.junctionFlags?.fFlag || '0',
                v: data.junctionFlags?.vFlag || '0',
                c: data.junctionFlags?.cFlag || '0',
                a: data.junctionFlags?.aFlag || '0',
                h: data.junctionFlags?.hFlag || '0',
                s: data.junctionFlags?.sFlag || '0'
            };
            const flagStr = jFlags.j + jFlags.e + jFlags.f + jFlags.v + jFlags.c + jFlags.a + jFlags.h + jFlags.s;
            output += flagStr;

            // 초킹 모델 관련 추가 데이터
            if (jFlags.c === '0') {
                if (data.dischargeCoef) output += `  ${data.dischargeCoef}`;
                if (data.thermalNonequilConstant) output += `  ${data.thermalNonequilConstant}`;

                // 상황에 따라 다른 추가 데이터
                if (jFlags.v === '4' && data.horizontalAngle) {
                    output += `  ${data.horizontalAngle}`;
                } else if (data.subcooledDischargeCoef) {
                    output += `  ${data.subcooledDischargeCoef}`;
                    if (data.twoPhaseDischCoef) output += `  ${data.twoPhaseDischCoef}`;
                    if (data.superheatedDischCoef) output += `  ${data.superheatedDischCoef}`;
                }
            }

            return output + '\n';
        },
        formatCcflCard: function(data) {
            // CCC0110 카드 데이터 포맷팅 (선택 사항)
            if (!data.hydraulicDiameter && !data.floodingForm && !data.gasIntercept && !data.slope) {
                return '';
            }

            let output = `${data.componentNumber}0110  ${data.hydraulicDiameter || '0.0'}`;

            if (data.junctionFlags?.fFlag === '1') {
                if (data.floodingForm) output += `  ${data.floodingForm}`;
                if (data.gasIntercept) output += `  ${data.gasIntercept}`;
                if (data.slope) output += `  ${data.slope}`;
            }

            return output + '\n';
        },
        formatFormLossCard: function(data) {
            // CCC0111 카드 데이터 포맷팅 (선택 사항)
            if (!data.BF && !data.CF && !data.BR && !data.CR) {
                return '';
            }

            return `${data.componentNumber}0111  ${data.BF || '0.0'}  ${data.CF || '0.0'}  ${data.BR || '0.0'}  ${data.CR || '0.0'}\n`;
        },
        formatInitialCondCard: function(data) {
            // CCC0201 카드 데이터 포맷팅
            let output = `${data.componentNumber}0201  ${data.initControlWord || '0'}  `;

            if (data.initControlWord === '0') {
                output += `${data.initLiquidVel || '0.0'}  ${data.initVaporVel || '0.0'}`;
            } else {
                output += `${data.initLiquidFlow || '0.0'}  ${data.initVaporFlow || '0.0'}`;
            }

            output += `  ${data.interfaceVelocity || '0.0'}`;

            return output + '\n';
        }
    },
    validators: {
        validateJunctionArea: function(value, data) {
            // 급격한 면적 변화의 경우 제약 조건 검증 (실제로는 인접 체적 면적을 알아야 함)
            return true;
        },
        validateHydraulicDiameter: function(value, data) {
            // 수력학적 직경 검증
            return value >= 0;
        },
        validateJunctionFlags: function(flags) {
            // 접합부 제어 플래그 검증
            // 필요한 경우 구현
            return true;
        }
    }
};

export default SNGLJUN;