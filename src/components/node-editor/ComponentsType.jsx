import metaTMDPJUN  from "./controls/TmdpJunComponent.jsx";

export const componentTypes = {
    SNGLVOL: {
        type: 'SNGLVOL',
        label: 'SGV',
        icon: 'SGV',
        description: '단일 체적 컴포넌트는 유체 시스템의 단일 제어 체적을 나타냅니다.',
        category: 'hydro',
        ports: {
            inputs: [{ id: 'from', label: 'From' }],
            outputs: [{ id: 'to', label: 'To' }]
        },
        properties: {
            tabs: [
                {
                    id: "basic",
                    label: "기본 데이터",
                    cards: [
                        {
                            id: "CCC0101-0109",
                            label: "체적 X-좌표 데이터",
                            description: "체적의 기하학적 데이터를 정의합니다.",
                            fields: [
                                {
                                    id: "area",
                                    label: "면적",
                                    type: "number",
                                    unit: "m², ft²",
                                    placeholder: "0.0",
                                    description: "체적의 단면적",
                                    helpText: "",
                                    required: true,
                                    relatedFields: ["length", "volume"],
                                    validation: {
                                        min: 0
                                    }
                                },
                                {
                                    id: "length",
                                    label: "길이",
                                    type: "number",
                                    unit: "m, ft",
                                    placeholder: "0.0",
                                    description: "체적의 길이",
                                    helpText: "",
                                    required: true,
                                    relatedFields: ["area", "volume"],
                                    validation: {
                                        min: 0
                                    }
                                },
                                {
                                    id: "volume",
                                    label: "부피",
                                    type: "number",
                                    unit: "m³, ft³",
                                    placeholder: "0.0",
                                    description: "체적의 부피",
                                    helpText: "면적 × 길이와 일치해야 함",
                                    required: false,
                                    relatedFields: ["area", "length"],
                                    validation: {
                                        min: 0,
                                        custom: "validateVolume"
                                    }
                                },
                                {
                                    id: "azimuthal",
                                    label: "방위각",
                                    type: "number",
                                    unit: "도",
                                    placeholder: "0.0",
                                    description: "방위각",
                                    helpText: "절대값 < 360°",
                                    required: false,
                                    validation: {
                                        min: -360,
                                        max: 360
                                    }
                                },
                                {
                                    id: "inclination",
                                    label: "경사각",
                                    type: "number",
                                    unit: "도",
                                    placeholder: "0.0",
                                    description: "경사각",
                                    helpText: "절대값 < 90°",
                                    required: false,
                                    validation: {
                                        min: -90,
                                        max: 90
                                    }
                                },
                                {
                                    id: "elevation",
                                    label: "고도 변화",
                                    type: "number",
                                    unit: "m, ft",
                                    placeholder: "0.0",
                                    description: "입구에서 출구까지의 고도 변화",
                                    helpText: "양수: 고도 증가",
                                    required: false
                                },
                                {
                                    id: "roughness",
                                    label: "벽 거칠기",
                                    type: "number",
                                    unit: "m, ft",
                                    placeholder: "0.0",
                                    description: "벽면 거칠기",
                                    required: false,
                                    validation: {
                                        min: 0
                                    }
                                },
                                {
                                    id: "hydraulic",
                                    label: "수력학적 직경",
                                    type: "number",
                                    unit: "m, ft",
                                    placeholder: "0.0",
                                    description: "수력학적 직경",
                                    helpText: "0 입력 시 자동 계산",
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
                    id: "flags",
                    label: "제어 플래그",
                    cards: [
                        {
                            id: "volume-flags",
                            label: "체적 제어 플래그",
                            description: "체적에 대한 다양한 물리적 모델을 제어합니다.",
                            fields: [
                                {
                                    id: "tFlag",
                                    label: "열 전단 추적 모델 (t)",
                                    type: "boolean",
                                    description: "열 전단 추적 모델 사용 여부",
                                    helpText: "열 전단 추적 모델 사용 여부를 설정합니다",
                                    required: false,
                                    default: false
                                },
                                {
                                    id: "lFlag",
                                    label: "혼합 레벨 추적 모델 (l)",
                                    type: "boolean",
                                    description: "혼합 레벨 추적 모델 사용 여부",
                                    helpText: "혼합 레벨 추적 모델 사용 여부를 설정합니다",
                                    required: false,
                                    default: false
                                },
                                {
                                    id: "pFlag",
                                    label: "물 압축 방식 (p)",
                                    type: "boolean",
                                    description: "물 압축 방식 사용 여부",
                                    helpText: "물 압축 방식 사용 여부를 설정합니다",
                                    required: false,
                                    default: false
                                },
                                {
                                    id: "vFlag",
                                    label: "수직 층화 모델 (v)",
                                    type: "boolean",
                                    description: "수직 층화 모델 사용 여부",
                                    helpText: "수직 층화 모델 사용 여부를 설정합니다",
                                    required: false,
                                    default: false
                                },
                                {
                                    id: "bFlag",
                                    label: "계면 마찰 모델 (b)",
                                    type: "select",
                                    description: "사용할 계면 마찰 모델",
                                    helpText: "사용할 계면 마찰 모델을 선택합니다",
                                    required: false,
                                    default: "0",
                                    options: [
                                        { value: "0", label: "파이프 모델" },
                                        { value: "1", label: "봉다발 모델" },
                                        { value: "2", label: "ORNL ANS 모델" }
                                    ]
                                },
                                {
                                    id: "fFlag",
                                    label: "벽 마찰 계산 (f)",
                                    type: "boolean",
                                    description: "벽 마찰 계산 여부",
                                    helpText: "벽 마찰 계산 여부를 설정합니다",
                                    required: false,
                                    default: false
                                },
                                {
                                    id: "eFlag",
                                    label: "열평형 계산 (e)",
                                    type: "boolean",
                                    description: "열평형/비평형 계산 여부",
                                    helpText: "비평형(0) 또는 평형(1) 계산 여부를 설정합니다",
                                    required: false,
                                    default: false
                                }
                            ]
                        },
                        {
                            id: "CCC0111",
                            label: "ORNL ANS 인터페이스 모델 값",
                            description: "ORNL ANS 인터페이스 모델에 사용되는 값들",
                            conditionalDisplay: {
                                field: "bFlag",
                                value: "2"
                            },
                            fields: [
                                {
                                    id: "gap",
                                    label: "Gap",
                                    type: "number",
                                    unit: "m, ft",
                                    placeholder: "0.0",
                                    description: "Gap (측면 벽 사이 거리/피치/채널 폭)",
                                    helpText: "측면 벽 사이 거리/피치/채널 폭",
                                    required: true,
                                    validation: {
                                        min: 0
                                    }
                                },
                                {
                                    id: "span",
                                    label: "Span",
                                    type: "number",
                                    unit: "m, ft",
                                    placeholder: "0.0",
                                    description: "Span (한쪽 끝에서 다른 쪽 끝까지의 거리)",
                                    helpText: "한쪽 끝에서 다른 쪽 끝까지의 거리",
                                    required: true,
                                    validation: {
                                        min: 0
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: "friction",
                    label: "마찰 데이터",
                    cards: [
                        {
                            id: "CCC0131",
                            label: "추가 벽 마찰 데이터",
                            description: "추가적인 벽면 마찰 계수 데이터",
                            fields: [
                                {
                                    id: "xShape",
                                    label: "X-좌표 층류 형상 인자",
                                    type: "number",
                                    placeholder: "1.0",
                                    description: "X-좌표 방향 층류 형상 인자",
                                    default: "1.0",
                                    required: false
                                },
                                {
                                    id: "xVisc",
                                    label: "X-좌표 점도비 지수",
                                    type: "number",
                                    placeholder: "0.0",
                                    description: "X-좌표 방향 점도비 지수",
                                    default: "0.0",
                                    required: false
                                },
                                {
                                    id: "yShape",
                                    label: "Y-좌표 층류 형상 인자",
                                    type: "number",
                                    placeholder: "1.0",
                                    description: "Y-좌표 방향 층류 형상 인자",
                                    default: "1.0",
                                    required: false
                                },
                                {
                                    id: "yVisc",
                                    label: "Y-좌표 점도비 지수",
                                    type: "number",
                                    placeholder: "0.0",
                                    description: "Y-좌표 방향 점도비 지수",
                                    default: "0.0",
                                    required: false
                                },
                                {
                                    id: "zShape",
                                    label: "Z-좌표 층류 형상 인자",
                                    type: "number",
                                    placeholder: "1.0",
                                    description: "Z-좌표 방향 층류 형상 인자",
                                    default: "1.0",
                                    required: false
                                },
                                {
                                    id: "zVisc",
                                    label: "Z-좌표 점도비 지수",
                                    type: "number",
                                    placeholder: "0.0",
                                    description: "Z-좌표 방향 점도비 지수",
                                    default: "0.0",
                                    required: false
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
                            id: "CCC0200",
                            label: "초기 조건 카드",
                            description: "체적의 초기 열역학적 상태를 정의합니다.",
                            fields: [
                                {
                                    id: "thermoState",
                                    label: "열역학적 상태 정의 방법",
                                    type: "select",
                                    description: "열역학적 상태를 정의하는 방법",
                                    required: true,
                                    default: "3",
                                    options: [
                                        { value: "0", label: "[압력, 액체 내부 에너지, 증기 내부 에너지, 증기 체적 분율]" },
                                        { value: "1", label: "[온도, 정적 품질] (평형)" },
                                        { value: "2", label: "[압력, 정적 품질] (평형)" },
                                        { value: "3", label: "[압력, 온도] (평형)" },
                                        { value: "4", label: "[압력, 온도, 정적 품질] (비응축성 가스)" },
                                        { value: "5", label: "[온도, 정적 품질, 비응축성 품질] (비응축성 가스)" },
                                        { value: "6", label: "[압력, 액체 내부 에너지, 증기 내부 에너지, 증기 체적 분율, 비응축성 품질]" }
                                    ]
                                },
                                // 나머지 필드들...
                            ]
                        }
                    ]
                }
            ]
        },
        formatters: {
            generateHeader: function(component) {
                return `* SNGLVOL 컴포넌트 입력\n*\n${component.number}0000  ${component.name}  SNGLVOL\n`;
            },
            formatCard0101: function(data) {
                // 포맷팅 로직 
            },
            formatCard0111: function(data) {
                // 포맷팅 로직 
            },
            formatCard0131: function(data) {
                // 포맷팅 로직 
            },
            formatCard0200: function(data) {
                // 포맷팅 로직 
            },
            generateControlFlags: function(flags) {
                return `${flags.tFlag ? '1' : '0'}${flags.lFlag ? '1' : '0'}${flags.pFlag ? '1' : '0'}${flags.vFlag ? '1' : '0'}${flags.bFlag}${flags.fFlag ? '1' : '0'}${flags.eFlag ? '1' : '0'}`;
            }
        },
        validators: {
            validateVolume: function(value, data) {
                if(data.area && data.length && value) {
                    const calculatedVolume = data.area * data.length;
                    const error = Math.abs((value - calculatedVolume) / calculatedVolume);
                    return error <= 0.000001;
                }
                return true;
            }
        }
    },

    TMDPVOL: {
        type: 'TMDPVOL',
        label: 'TDV',
        description: '시간 종속 체적 컴포넌트는 시간에 따라 변하는 열역학적 상태를 가진 체적을 나타냅니다. 주로 경계 조건 설정에 사용됩니다.',
        icon: 'TDV',
        category:'hydro',
        Name:'TV000',
        ports: {
            // inputs: [
            //     { id: "from", label: "From" }
            // ],
            outputs: [
                { id: "to", label: "To" }
            ]
        },
        properties: {
            tabs: [
                {
                    id: "geometry",
                    label: "기하학적 데이터",
                    cards: [
                        {
                            id: "CCC0101-0109",
                            label: "체적 기하학적 데이터",
                            description: "체적의 기하학적 특성을 정의합니다.",
                            fields: [
                                {
                                    id: "area",
                                    label: "면적",
                                    type: "number",
                                    unit: "m², ft²",
                                    placeholder: "0.0",
                                    description: "체적의 단면적",
                                    helpText: "압력 경계 조건으로 사용될 때는 연결된 정상 접합부보다 큰 면적 권장",
                                    required: true,
                                    relatedFields: ["length", "volume"],
                                    validation: {
                                        min: 0
                                    }
                                },
                                {
                                    id: "length",
                                    label: "길이",
                                    type: "number",
                                    unit: "m, ft",
                                    placeholder: "0.0",
                                    description: "체적의 길이",
                                    helpText: "초기화 후 0으로 설정됨",
                                    required: true,
                                    relatedFields: ["area", "volume"],
                                    validation: {
                                        min: 0
                                    }
                                },
                                {
                                    id: "volume",
                                    label: "체적",
                                    type: "number",
                                    unit: "m³, ft³",
                                    placeholder: "0.0",
                                    description: "체적의 부피",
                                    helpText: "면적 × 길이와 일치해야 함. 초기화 후 0으로 설정됨",
                                    required: false,
                                    relatedFields: ["area", "length"],
                                    validation: {
                                        min: 0,
                                        custom: "validateVolume"
                                    }
                                },
                                {
                                    id: "azimuthal",
                                    label: "방위각",
                                    type: "number",
                                    unit: "도",
                                    placeholder: "0.0",
                                    description: "방위각 (도면 작성용)",
                                    helpText: "절대값 < 360°",
                                    required: false,
                                    validation: {
                                        min: -360,
                                        max: 360
                                    }
                                },
                                {
                                    id: "inclination",
                                    label: "경사각",
                                    type: "number",
                                    unit: "도",
                                    placeholder: "0.0",
                                    description: "경사각 (계면 항력 계산에 사용)",
                                    helpText: "0°는 수평, 양수는 상향 경사, 절대값 < 90°",
                                    required: false,
                                    validation: {
                                        min: -90,
                                        max: 90
                                    }
                                },
                                {
                                    id: "elevation",
                                    label: "고도 변화",
                                    type: "number",
                                    unit: "m, ft",
                                    placeholder: "0.0",
                                    description: "입구에서 출구까지의 고도 변화",
                                    helpText: "양수는 고도 증가. 절대값 ≤ 길이. 수직각과 부호가 일치해야 함. 초기화 후 0으로 설정됨",
                                    required: false,
                                    validation: {
                                        custom: "validateElevation"
                                    }
                                },
                                {
                                    id: "roughness",
                                    label: "벽 거칠기",
                                    type: "number",
                                    unit: "m, ft",
                                    placeholder: "0.0",
                                    description: "벽면 거칠기",
                                    required: false,
                                    validation: {
                                        min: 0,
                                        custom: "validateRoughness"
                                    }
                                },
                                {
                                    id: "hydraulic",
                                    label: "수력학적 직경",
                                    type: "number",
                                    unit: "m, ft",
                                    placeholder: "0.0",
                                    description: "수력학적 직경",
                                    helpText: "0 입력 시 면적으로부터 자동 계산됨",
                                    required: false,
                                    validation: {
                                        min: 0
                                    }
                                },
                                {
                                    id: "volumeFlags",
                                    label: "체적 제어 플래그",
                                    type: "text",
                                    placeholder: "0000000",
                                    description: "체적 제어 플래그 (tlpvbfe 형식)",
                                    helpText: "TMDPVOL에서는 0000000만 허용됨",
                                    required: true,
                                    default: "0000000",
                                    validation: {
                                        custom: "validateTmdpvolFlags"
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: "dataControl",
                    label: "데이터 제어",
                    cards: [
                        {
                            id: "CCC0200",
                            label: "시간 종속 체적 데이터 제어 단어",
                            description: "열역학적 상태를 정의하는 방법을 설정합니다.",
                            fields: [
                                {
                                    id: "fluidType",
                                    label: "유체 유형 (e-flag)",
                                    type: "select",
                                    description: "사용할 유체 종류",
                                    required: true,
                                    default: "0",
                                    options: [
                                        { value: "0", label: "기본 유체 (H2O)" },
                                        { value: "1", label: "H₂O" },
                                        { value: "2", label: "D₂O" },
                                        { value: "3", label: "기타 유체" }
                                    ]
                                },
                                {
                                    id: "boronPresent",
                                    label: "붕소 존재 여부 (b-flag)",
                                    type: "select",
                                    description: "붕소 농도 입력 여부",
                                    required: true,
                                    default: "0",
                                    options: [
                                        { value: "0", label: "붕소 없음" },
                                        { value: "1", label: "붕소 농도 입력 필요" }
                                    ]
                                },
                                {
                                    id: "thermoState",
                                    label: "열역학적 상태 정의 방법 (t-flag)",
                                    type: "select",
                                    description: "열역학적 상태를 정의하는 방법",
                                    required: true,
                                    default: "3",
                                    options: [
                                        { value: "0", label: "[P, Uf, Ug, αg] - 압력, 액체/증기 내부 에너지, 증기 체적 분율 (비평형/평형)" },
                                        { value: "1", label: "[T, xs] - 온도, 정적 품질 (평형)" },
                                        { value: "2", label: "[P, xs] - 압력, 정적 품질 (평형)" },
                                        { value: "3", label: "[P, T] - 압력, 온도 (평형)" },
                                        { value: "4", label: "[P, T, xs] - 압력, 온도, 정적 품질 (비응축성 가스)" },
                                        { value: "5", label: "[T, xs, xn] - 온도, 정적 품질, 비응축성 품질" },
                                        { value: "6", label: "[P, Uf, Ug, αg, xn] - 압력, 액체/증기 내부 에너지, 체적 분율, 비응축성 품질" }
                                    ]
                                },
                                {
                                    id: "tableTrip",
                                    label: "테이블 트립 번호",
                                    type: "number",
                                    placeholder: "0",
                                    description: "테이블 트립 번호 (시간 인자 결정)",
                                    helpText: "0 또는 미입력 시 트립을 사용하지 않음",
                                    required: false
                                },
                                {
                                    id: "varNamePart",
                                    label: "변수 요청 코드 (알파벳 부분)",
                                    type: "text",
                                    placeholder: "TIME",
                                    description: "검색 인자 지정을 위한 변수 요청 코드의 알파벳 부분",
                                    helpText: "미입력 시 시간이 검색 인자로 사용됨",
                                    required: false
                                },
                                {
                                    id: "varNumPart",
                                    label: "변수 요청 코드 (숫자 부분)",
                                    type: "number",
                                    placeholder: "0",
                                    description: "검색 인자 지정을 위한 변수 요청 코드의 숫자 부분",
                                    helpText: "미입력 시 0으로 간주됨",
                                    required: false
                                }
                            ]
                        }
                    ]
                },
                {
                    id: "thermoState0",
                    label: "[P,Uf,Ug,αg] 데이터",
                    cards: [
                        {
                            id: "thermoData0",
                            label: "비평형/평형 상태 데이터",
                            description: "압력, 액체/증기 내부 에너지, 증기 체적 분율",
                            conditionalDisplay: {
                                field: "thermoState",
                                value: "0"
                            },
                            fields: [
                                {
                                    id: "pressure0",
                                    label: "압력",
                                    type: "number",
                                    unit: "Pa, lbf/in²",
                                    placeholder: "0.0",
                                    description: "시스템 압력",
                                    required: true,
                                    validation: {
                                        min: 0
                                    }
                                },
                                {
                                    id: "liquidEnergy0",
                                    label: "액체 비내부 에너지",
                                    type: "number",
                                    unit: "J/kg, Btu/lb",
                                    placeholder: "0.0",
                                    description: "액체 상의 비내부 에너지",
                                    required: true
                                },
                                {
                                    id: "vaporEnergy0",
                                    label: "증기 비내부 에너지",
                                    type: "number",
                                    unit: "J/kg, Btu/lb",
                                    placeholder: "0.0",
                                    description: "증기 상의 비내부 에너지",
                                    required: true
                                },
                                {
                                    id: "voidFraction0",
                                    label: "증기 체적 분율",
                                    type: "number",
                                    placeholder: "0.0",
                                    description: "증기가 차지하는 체적 비율",
                                    required: true,
                                    validation: {
                                        min: 0,
                                        max: 1
                                    }
                                },
                                {
                                    id: "boronConc0",
                                    label: "붕소 농도",
                                    type: "number",
                                    unit: "kg/kg",
                                    placeholder: "0.0",
                                    description: "액체 질량 대비 붕소 질량 비율",
                                    conditionalDisplay: {
                                        field: "boronPresent",
                                        value: "1"
                                    },
                                    required: true,
                                    validation: {
                                        min: 0
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: "thermoState1",
                    label: "[T,xs] 데이터",
                    cards: [
                        {
                            id: "thermoData1",
                            label: "평형 상태 데이터",
                            description: "온도, 정적 품질",
                            conditionalDisplay: {
                                field: "thermoState",
                                value: "1"
                            },
                            fields: [
                                {
                                    id: "temperature1",
                                    label: "온도",
                                    type: "number",
                                    unit: "K, °F",
                                    placeholder: "0.0",
                                    description: "시스템 온도",
                                    required: true,
                                    validation: {
                                        min: 0
                                    }
                                },
                                {
                                    id: "staticQuality1",
                                    label: "정적 품질",
                                    type: "number",
                                    placeholder: "0.0",
                                    description: "증기 질량 분율",
                                    required: true,
                                    validation: {
                                        min: 0,
                                        max: 1
                                    }
                                },
                                {
                                    id: "boronConc1",
                                    label: "붕소 농도",
                                    type: "number",
                                    unit: "kg/kg",
                                    placeholder: "0.0",
                                    description: "액체 질량 대비 붕소 질량 비율",
                                    conditionalDisplay: {
                                        field: "boronPresent",
                                        value: "1"
                                    },
                                    required: true,
                                    validation: {
                                        min: 0
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: "thermoState2",
                    label: "[P,xs] 데이터",
                    cards: [
                        {
                            id: "thermoData2",
                            label: "평형 상태 데이터",
                            description: "압력, 정적 품질",
                            conditionalDisplay: {
                                field: "thermoState",
                                value: "2"
                            },
                            fields: [
                                {
                                    id: "pressure2",
                                    label: "압력",
                                    type: "number",
                                    unit: "Pa, lbf/in²",
                                    placeholder: "0.0",
                                    description: "시스템 압력",
                                    required: true,
                                    validation: {
                                        min: 0
                                    }
                                },
                                {
                                    id: "staticQuality2",
                                    label: "정적 품질",
                                    type: "number",
                                    placeholder: "0.0",
                                    description: "증기 질량 분율",
                                    required: true,
                                    validation: {
                                        min: 0,
                                        max: 1
                                    }
                                },
                                {
                                    id: "boronConc2",
                                    label: "붕소 농도",
                                    type: "number",
                                    unit: "kg/kg",
                                    placeholder: "0.0",
                                    description: "액체 질량 대비 붕소 질량 비율",
                                    conditionalDisplay: {
                                        field: "boronPresent",
                                        value: "1"
                                    },
                                    required: true,
                                    validation: {
                                        min: 0
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: "thermoState3",
                    label: "[P,T] 데이터",
                    cards: [
                        {
                            id: "thermoData3",
                            label: "평형 상태 데이터",
                            description: "압력, 온도",
                            conditionalDisplay: {
                                field: "thermoState",
                                value: "3"
                            },
                            fields: [
                                {
                                    id: "pressure3",
                                    label: "압력",
                                    type: "number",
                                    unit: "Pa, lbf/in²",
                                    placeholder: "0.0",
                                    description: "시스템 압력",
                                    required: true,
                                    validation: {
                                        min: 0
                                    }
                                },
                                {
                                    id: "temperature3",
                                    label: "온도",
                                    type: "number",
                                    unit: "K, °F",
                                    placeholder: "0.0",
                                    description: "시스템 온도",
                                    required: true,
                                    validation: {
                                        min: 0
                                    }
                                },
                                {
                                    id: "boronConc3",
                                    label: "붕소 농도",
                                    type: "number",
                                    unit: "kg/kg",
                                    placeholder: "0.0",
                                    description: "액체 질량 대비 붕소 질량 비율",
                                    conditionalDisplay: {
                                        field: "boronPresent",
                                        value: "1"
                                    },
                                    required: true,
                                    validation: {
                                        min: 0
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: "thermoState4",
                    label: "[P,T,xs] 데이터",
                    cards: [
                        {
                            id: "thermoData4",
                            label: "비응축성 가스 상태 데이터",
                            description: "압력, 온도, 정적 품질",
                            conditionalDisplay: {
                                field: "thermoState",
                                value: "4"
                            },
                            fields: [
                                {
                                    id: "pressure4",
                                    label: "압력",
                                    type: "number",
                                    unit: "Pa, lbf/in²",
                                    placeholder: "0.0",
                                    description: "시스템 압력",
                                    required: true,
                                    validation: {
                                        min: 0
                                    }
                                },
                                {
                                    id: "temperature4",
                                    label: "온도",
                                    type: "number",
                                    unit: "K, °F",
                                    placeholder: "0.0",
                                    description: "시스템 온도 (포화 온도보다 낮아야 함)",
                                    helpText: "입력 압력에서의 포화 온도보다 낮아야 합니다",
                                    required: true,
                                    validation: {
                                        min: 0,
                                        custom: "validateTemperature4"
                                    }
                                },
                                {
                                    id: "staticQuality4",
                                    label: "정적 품질",
                                    type: "number",
                                    placeholder: "0.0",
                                    description: "정적 품질 (0.0 = 건조 비응축성 가스)",
                                    helpText: "0.0은 전체가 비응축성 가스임을 의미합니다",
                                    required: true,
                                    validation: {
                                        min: 0,
                                        max: 1
                                    }
                                },
                                {
                                    id: "boronConc4",
                                    label: "붕소 농도",
                                    type: "number",
                                    unit: "kg/kg",
                                    placeholder: "0.0",
                                    description: "액체 질량 대비 붕소 질량 비율",
                                    conditionalDisplay: {
                                        field: "boronPresent",
                                        value: "1"
                                    },
                                    required: true,
                                    validation: {
                                        min: 0
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: "thermoState5",
                    label: "[T,xs,xn] 데이터",
                    cards: [
                        {
                            id: "thermoData5",
                            label: "비응축성 가스 상태 데이터",
                            description: "온도, 정적 품질, 비응축성 품질",
                            conditionalDisplay: {
                                field: "thermoState",
                                value: "5"
                            },
                            fields: [
                                {
                                    id: "temperature5",
                                    label: "증기 포화 온도",
                                    type: "number",
                                    unit: "K, °F",
                                    placeholder: "0.0",
                                    description: "증기 포화 온도",
                                    required: true,
                                    validation: {
                                        min: 0
                                    }
                                },
                                {
                                    id: "staticQuality5",
                                    label: "정적 품질",
                                    type: "number",
                                    placeholder: "0.0",
                                    description: "정적 품질",
                                    required: true,
                                    validation: {
                                        min: 0.000000001,
                                        max: 0.99999999
                                    }
                                },
                                {
                                    id: "nonCondQuality5",
                                    label: "비응축성 품질",
                                    type: "number",
                                    placeholder: "0.0",
                                    description: "비응축성 가스 품질",
                                    required: true,
                                    validation: {
                                        min: 0.000000001,
                                        max: 0.99999999
                                    }
                                },
                                {
                                    id: "boronConc5",
                                    label: "붕소 농도",
                                    type: "number",
                                    unit: "kg/kg",
                                    placeholder: "0.0",
                                    description: "액체 질량 대비 붕소 질량 비율",
                                    conditionalDisplay: {
                                        field: "boronPresent",
                                        value: "1"
                                    },
                                    required: true,
                                    validation: {
                                        min: 0
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: "thermoState6",
                    label: "[P,Uf,Ug,αg,xn] 데이터",
                    cards: [
                        {
                            id: "thermoData6",
                            label: "비평형/평형 상태 데이터 (비응축성 가스)",
                            description: "압력, 액체/증기 내부 에너지, 체적 분율, 비응축성 품질",
                            conditionalDisplay: {
                                field: "thermoState",
                                value: "6"
                            },
                            fields: [
                                {
                                    id: "pressure6",
                                    label: "압력",
                                    type: "number",
                                    unit: "Pa, lbf/in²",
                                    placeholder: "0.0",
                                    description: "시스템 압력",
                                    required: true,
                                    validation: {
                                        min: 0
                                    }
                                },
                                {
                                    id: "liquidEnergy6",
                                    label: "액체 비내부 에너지",
                                    type: "number",
                                    unit: "J/kg, Btu/lb",
                                    placeholder: "0.0",
                                    description: "액체 상의 비내부 에너지",
                                    required: true
                                },
                                {
                                    id: "vaporEnergy6",
                                    label: "증기 비내부 에너지",
                                    type: "number",
                                    unit: "J/kg, Btu/lb",
                                    placeholder: "0.0",
                                    description: "증기 상의 비내부 에너지",
                                    required: true
                                },
                                {
                                    id: "voidFraction6",
                                    label: "증기 체적 분율",
                                    type: "number",
                                    placeholder: "0.0",
                                    description: "증기가 차지하는 체적 비율",
                                    required: true,
                                    validation: {
                                        min: 0,
                                        max: 1
                                    }
                                },
                                {
                                    id: "nonCondQuality6",
                                    label: "비응축성 품질",
                                    type: "number",
                                    placeholder: "0.0",
                                    description: "비응축성 가스 품질",
                                    helpText: "0 = 비응축성 가스 없음, 1 = 순수 비응축성 가스",
                                    required: true,
                                    validation: {
                                        min: 0,
                                        max: 1,
                                        custom: "validateNonCondConsistency6"
                                    }
                                },
                                {
                                    id: "boronConc6",
                                    label: "붕소 농도",
                                    type: "number",
                                    unit: "kg/kg",
                                    placeholder: "0.0",
                                    description: "액체 질량 대비 붕소 질량 비율",
                                    conditionalDisplay: {
                                        field: "boronPresent",
                                        value: "1"
                                    },
                                    required: true,
                                    validation: {
                                        min: 0
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: "timeTable",
                    label: "시간 테이블",
                    cards: [
                        {
                            id: "timeTableEditor",
                            label: "시간 종속 데이터 테이블",
                            description: "시간(또는 다른 검색 변수)에 따른 열역학적 상태 변화를 정의합니다.",
                            fields: [
                                {
                                    id: "timeTableData",
                                    label: "시간 종속 데이터",
                                    type: "timeTableEditor", // 사용자 지정 컴포넌트로 시간 테이블 에디터를 구현
                                    description: "검색 변수와 열역학적 상태 데이터 쌍을 입력합니다. (최대 5,000세트)",
                                    helpText: "세트 형식은 t-flag 값에 따라 달라집니다",
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
                return `* TMDPVOL 컴포넌트 입력\n*\n${component.number}0000  ${component.name}  TMDPVOL\n`;
            },
            formatGeometryCard: function(data) {
                // CCC0101-0109 카드 데이터 포맷팅
                let output = `${data.componentNumber}0101  ${data.area}  ${data.length}  ${data.volume || data.area * data.length}  `;
                output += `${data.azimuthal || 0.0}  ${data.inclination || 0.0}  ${data.elevation || 0.0}  `;
                output += `${data.roughness || 0.0}  ${data.hydraulic || 0.0}\n`;

                // CCC0001 체적 제어 플래그 추가
                output += `${data.componentNumber}0001  ${data.volumeFlags || "0000000"}\n`;

                return output;
            },
            formatControlWordCard: function(data) {
                // CCC0200 카드 데이터 포맷팅
                let controlWord = `${data.fluidType || "0"}${data.boronPresent || "0"}${data.thermoState || "3"}`;

                let output = `${data.componentNumber}0200  ${controlWord}`;

                if (data.tableTrip) {
                    output += `  ${data.tableTrip}`;

                    if (data.varNamePart) {
                        output += `  ${data.varNamePart}  ${data.varNumPart || 0}`;
                    }
                }

                return output + '\n';
            },
            formatTimeDataCard: function(data, timeEntry, index) {
                // CCC0201-0299 카드 포맷팅 (t-flag에 따라 다른 형식)
                const cardNumber = 201 + index;
                let output = `${data.componentNumber}0${cardNumber}  ${timeEntry.time}  `;

                switch(data.thermoState) {
                    case "0":
                        output += `${timeEntry.pressure0}  ${timeEntry.liquidEnergy0}  ${timeEntry.vaporEnergy0}  ${timeEntry.voidFraction0}`;
                        if (data.boronPresent === "1") output += `  ${timeEntry.boronConc0 || 0.0}`;
                        break;
                    case "1":
                        output += `${timeEntry.temperature1}  ${timeEntry.staticQuality1}`;
                        if (data.boronPresent === "1") output += `  ${timeEntry.boronConc1 || 0.0}`;
                        break;
                    case "2":
                        output += `${timeEntry.pressure2}  ${timeEntry.staticQuality2}`;
                        if (data.boronPresent === "1") output += `  ${timeEntry.boronConc2 || 0.0}`;
                        break;
                    case "3":
                        output += `${timeEntry.pressure3}  ${timeEntry.temperature3}`;
                        if (data.boronPresent === "1") output += `  ${timeEntry.boronConc3 || 0.0}`;
                        break;
                    case "4":
                        output += `${timeEntry.pressure4}  ${timeEntry.temperature4}  ${timeEntry.staticQuality4}`;
                        if (data.boronPresent === "1") output += `  ${timeEntry.boronConc4 || 0.0}`;
                        break;
                    case "5":
                        output += `${timeEntry.temperature5}  ${timeEntry.staticQuality5}  ${timeEntry.nonCondQuality5}`;
                        if (data.boronPresent === "1") output += `  ${timeEntry.boronConc5 || 0.0}`;
                        break;
                    case "6":
                        output += `${timeEntry.pressure6}  ${timeEntry.liquidEnergy6}  ${timeEntry.vaporEnergy6}  `;
                        output += `${timeEntry.voidFraction6}  ${timeEntry.nonCondQuality6}`;
                        if (data.boronPresent === "1") output += `  ${timeEntry.boronConc6 || 0.0}`;
                        break;
                    default:
                        // 기본값 (t=3)
                        output += `${timeEntry.pressure3 || 0.0}  ${timeEntry.temperature3 || 0.0}`;
                        if (data.boronPresent === "1") output += `  ${timeEntry.boronConc3 || 0.0}`;
                }

                return output + '\n';
            }
        },
        validators: {
            validateVolume: function(value, data) {
                if(data.area && data.length && value) {
                    const calculatedVolume = data.area * data.length;
                    const error = Math.abs((value - calculatedVolume) / calculatedVolume);
                    return error <= 0.000001;
                }
                return true;
            },
            validateElevation: function(value, data) {
                if (value === undefined || value === null) return true;

                // 수직각이 0이면 고도 변화도 0이어야 함
                if (data.inclination === 0 && value !== 0) {
                    return false;
                }

                // 고도 변화의 절대값은 길이보다 작거나 같아야 함
                if (Math.abs(value) > data.length) {
                    return false;
                }

                // 수직각과 고도 변화의 부호가 일치해야 함
                if (data.inclination > 0 && value < 0 || data.inclination < 0 && value > 0) {
                    return false;
                }

                return true;
            },
            validateRoughness: function(value, data) {
                if (value === undefined || value === null || value === 0) return true;

                // 거칠기는 수력학적 직경의 절반보다 작아야 함
                if (data.hydraulic && value >= data.hydraulic / 2) {
                    return false;
                }

                return true;
            },
            validateTmdpvolFlags: function(value) {
                // TMDPVOL에서는 0000000만 허용됨
                return value === "0000000";
            },
            validateTemperature4: function(value, data) {
                // 여기서는 간단한 검증만 수행 (실제로는 포화 온도 계산이 필요)
                return value > 0;
            },
            validateNonCondConsistency6: function(nonCondQuality, data) {
                // 비응축성 품질이 0보다 큰 경우, 체적 분율도 0보다 커야 함
                if (nonCondQuality > 0 && data.voidFraction6 <= 0) {
                    return false;
                }

                // 비응축성 품질이 1인 경우, 체적 분율도 1이어야 함
                if (nonCondQuality === 1 && data.voidFraction6 !== 1) {
                    return false;
                }

                return true;
            }
        }
    },

    SNGLJUN: {
        type: 'SNGLJUN',
        label: 'SGJ',
        description: '단일 접합부 컴포넌트는 두 체적을 연결하는 유체 흐름 경로를 나타냅니다.',
        category:'hydro',
        icon: 'SGJ',
        ports: {
            inputs: [
                { id: "from", label: "From" }
            ],
            outputs: [
                { id: "to", label: "To" }
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
    },

    TMDPJUN: metaTMDPJUN,

    PIPE: {
        type: 'PIPE',
        label: 'PIPE',
        icon: 'PIPE',
        description: '파이프 컴포넌트는 여러 체적으로 구성된 1차원 유체 흐름 경로를 나타냅니다.',
        category: 'hydro',
        ports: {
            inputs: [{ id: 'from', label: 'From' }],
            outputs: [{ id: 'to', label: 'To' }]
        },
        properties: {
            tabs: [
                {
                    id: "basic",
                    label: "기본 데이터",
                    cards: [
                        {
                            id: "CCC0001",
                            label: "파이프 정보",
                            description: "파이프의 기본 정보를 정의합니다.",
                            fields: [
                                {
                                    id: "numberOfVolumes",
                                    label: "체적 수 (nv)",
                                    type: "number",
                                    placeholder: "1",
                                    description: "파이프를 구성하는 체적의 수",
                                    helpText: "1 이상 99 이하의 정수여야 합니다. 내부 접합부 수는 nv-1입니다.",
                                    required: true,
                                    validation: {
                                        min: 1,
                                        max: 99,
                                        integer: true
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: "geometry",
                    label: "기하학적 데이터",
                    cards: [
                        {
                            id: "CCC0101-0199",
                            label: "파이프 X-좌표 면적 데이터",
                            description: "파이프 각 체적의 X-좌표 방향 단면적을 정의합니다.",
                            fields: [
                                {
                                    id: "xAreaTable",
                                    label: "X-좌표 면적 테이블",
                                    type: "table",
                                    description: "체적별 X-좌표 방향 단면적",
                                    required: true,
                                    columns: [
                                        {
                                            id: "volumeNumber",
                                            label: "체적 번호",
                                            type: "number",
                                            placeholder: "1",
                                            validation: {
                                                min: 1,
                                                max: 99,
                                                integer: true
                                            }
                                        },
                                        {
                                            id: "area",
                                            label: "면적 (m², ft²)",
                                            type: "number",
                                            placeholder: "0.0",
                                            validation: {
                                                min: 0
                                            }
                                        }
                                    ],
                                    dynamicRows: {
                                        dependsOn: "numberOfVolumes"
                                    }
                                }
                            ]
                        },
                        {
                            id: "CCC0201-0299",
                            label: "파이프 접합부 면적 데이터",
                            description: "파이프 내부 접합부의 유동 면적을 정의합니다. (선택 사항)",
                            fields: [
                                {
                                    id: "junctionAreaTable",
                                    label: "접합부 면적 테이블",
                                    type: "table",
                                    description: "접합부별 유동 면적",
                                    required: false,
                                    columns: [
                                        {
                                            id: "junctionNumber",
                                            label: "접합부 번호",
                                            type: "number",
                                            placeholder: "1",
                                            validation: {
                                                min: 1,
                                                max: 98,
                                                integer: true
                                            }
                                        },
                                        {
                                            id: "junctionArea",
                                            label: "접합부 면적 (m², ft²)",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "0 입력 또는 미입력 시 인접 체적의 최소 면적 사용",
                                            validation: {
                                                min: 0
                                            }
                                        }
                                    ],
                                    dynamicRows: {
                                        dependsOn: "numberOfVolumes",
                                        formula: "n - 1" // nv - 1
                                    }
                                }
                            ]
                        },
                        {
                            id: "CCC0301-0399",
                            label: "파이프 X-좌표 길이 데이터",
                            description: "파이프 각 체적의 X-좌표 방향 길이를 정의합니다.",
                            fields: [
                                {
                                    id: "xLengthTable",
                                    label: "X-좌표 길이 테이블",
                                    type: "table",
                                    description: "체적별 X-좌표 방향 길이",
                                    required: true,
                                    columns: [
                                        {
                                            id: "volumeNumber",
                                            label: "체적 번호",
                                            type: "number",
                                            placeholder: "1",
                                            validation: {
                                                min: 1,
                                                max: 99,
                                                integer: true
                                            }
                                        },
                                        {
                                            id: "length",
                                            label: "길이 (m, ft)",
                                            type: "number",
                                            placeholder: "0.0",
                                            validation: {
                                                min: 0
                                            }
                                        }
                                    ],
                                    dynamicRows: {
                                        dependsOn: "numberOfVolumes"
                                    }
                                }
                            ]
                        },
                        {
                            id: "CCC0401-0499",
                            label: "파이프 체적 데이터",
                            description: "파이프 각 체적의 부피를 정의합니다. (선택 사항)",
                            fields: [
                                {
                                    id: "volumeTable",
                                    label: "체적 테이블",
                                    type: "table",
                                    description: "체적별 부피 데이터",
                                    required: false,
                                    columns: [
                                        {
                                            id: "volumeNumber",
                                            label: "체적 번호",
                                            type: "number",
                                            placeholder: "1",
                                            validation: {
                                                min: 1,
                                                max: 99,
                                                integer: true
                                            }
                                        },
                                        {
                                            id: "volume",
                                            label: "부피 (m³, ft³)",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "미입력 시 0으로 설정됨. 체적 = 면적 × 길이와 일치해야 함",
                                            validation: {
                                                min: 0,
                                                custom: "validateVolume"
                                            }
                                        }
                                    ],
                                    dynamicRows: {
                                        dependsOn: "numberOfVolumes"
                                    }
                                }
                            ]
                        },
                        {
                            id: "CCC0501-0599",
                            label: "파이프 체적 방위각 데이터",
                            description: "파이프 각 체적의 방위각을 정의합니다. (선택 사항)",
                            fields: [
                                {
                                    id: "azimuthalAngleTable",
                                    label: "방위각 테이블",
                                    type: "table",
                                    description: "체적별 방위각 데이터",
                                    required: false,
                                    columns: [
                                        {
                                            id: "volumeNumber",
                                            label: "체적 번호",
                                            type: "number",
                                            placeholder: "1",
                                            validation: {
                                                min: 1,
                                                max: 99,
                                                integer: true
                                            }
                                        },
                                        {
                                            id: "azimuthalAngle",
                                            label: "방위각 (도)",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "3D 그리기 프로그램에서 사용됨",
                                            validation: {
                                                min: -360,
                                                max: 360
                                            }
                                        }
                                    ],
                                    dynamicRows: {
                                        dependsOn: "numberOfVolumes"
                                    }
                                }
                            ]
                        },
                        {
                            id: "CCC0601-0699",
                            label: "파이프 체적 수직각 데이터",
                            description: "파이프 각 체적의 수직각을 정의합니다.",
                            fields: [
                                {
                                    id: "verticalAngleTable",
                                    label: "수직각 테이블",
                                    type: "table",
                                    description: "체적별 수직각 데이터",
                                    required: true,
                                    columns: [
                                        {
                                            id: "volumeNumber",
                                            label: "체적 번호",
                                            type: "number",
                                            placeholder: "1",
                                            validation: {
                                                min: 1,
                                                max: 99,
                                                integer: true
                                            }
                                        },
                                        {
                                            id: "verticalAngle",
                                            label: "수직각 (도)",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "계면 항력 계산에 사용됨",
                                            helpText: "절대값은 90도 이하여야 함",
                                            validation: {
                                                min: -90,
                                                max: 90
                                            }
                                        }
                                    ],
                                    dynamicRows: {
                                        dependsOn: "numberOfVolumes"
                                    }
                                }
                            ]
                        },
                        {
                            id: "CCC0701-0799",
                            label: "파이프 X-좌표 (고도) 변화 데이터",
                            description: "파이프 각 체적의 X-좌표 방향 고도 변화를 정의합니다. (선택 사항)",
                            fields: [
                                {
                                    id: "elevationChangeMode",
                                    label: "좌표 변화 입력 모드",
                                    type: "select",
                                    description: "좌표 변화 입력 방식 선택",
                                    required: false,
                                    default: "1",
                                    options: [
                                        { value: "1", label: "1개 좌표 변화 (고도만)" },
                                        { value: "3", label: "3개 좌표 변화 (x, y, z)" }
                                    ]
                                },
                                {
                                    id: "elevationChangeTable1",
                                    label: "고도 변화 테이블",
                                    type: "table",
                                    description: "체적별 고도 변화 데이터",
                                    conditionalDisplay: {
                                        field: "elevationChangeMode",
                                        value: "1"
                                    },
                                    columns: [
                                        {
                                            id: "volumeNumber",
                                            label: "체적 번호",
                                            type: "number",
                                            placeholder: "1",
                                            validation: {
                                                min: 1,
                                                max: 99,
                                                integer: true
                                            }
                                        },
                                        {
                                            id: "elevationChange",
                                            label: "고도 변화 (m, ft)",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "입구에서 출구까지의 고도 변화(Δzx)",
                                            helpText: "절대값은 체적 길이 이하여야 함",
                                            validation: {
                                                custom: "validateElevationChange"
                                            }
                                        }
                                    ],
                                    dynamicRows: {
                                        dependsOn: "numberOfVolumes"
                                    }
                                },
                                {
                                    id: "elevationChangeTable3",
                                    label: "3차원 좌표 변화 테이블",
                                    type: "table",
                                    description: "체적별 x, y, z 좌표 변화 데이터",
                                    conditionalDisplay: {
                                        field: "elevationChangeMode",
                                        value: "3"
                                    },
                                    columns: [
                                        {
                                            id: "volumeNumber",
                                            label: "체적 번호",
                                            type: "number",
                                            placeholder: "1",
                                            validation: {
                                                min: 1,
                                                max: 99,
                                                integer: true
                                            }
                                        },
                                        {
                                            id: "deltaX",
                                            label: "X-방향 변화 (m, ft)",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "입구에서 출구까지의 고정 x축 방향 변화(Δxx)"
                                        },
                                        {
                                            id: "deltaY",
                                            label: "Y-방향 변화 (m, ft)",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "입구에서 출구까지의 고정 y축 방향 변화(Δyx)"
                                        },
                                        {
                                            id: "deltaZ",
                                            label: "Z-방향 변화 (m, ft)",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "입구에서 출구까지의 고정 z축 방향 변화(Δzx)"
                                        }
                                    ],
                                    dynamicRows: {
                                        dependsOn: "numberOfVolumes"
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: "friction",
                    label: "마찰 데이터",
                    cards: [
                        {
                            id: "CCC0801-0899",
                            label: "파이프 체적 X-좌표 마찰 데이터",
                            description: "파이프 각 체적의 벽면 거칠기와 수력학적 직경을 정의합니다.",
                            fields: [
                                {
                                    id: "frictionTable",
                                    label: "마찰 데이터 테이블",
                                    type: "table",
                                    description: "체적별 벽면 거칠기 및 수력학적 직경",
                                    required: true,
                                    columns: [
                                        {
                                            id: "volumeNumber",
                                            label: "체적 번호",
                                            type: "number",
                                            placeholder: "1",
                                            validation: {
                                                min: 1,
                                                max: 99,
                                                integer: true
                                            }
                                        },
                                        {
                                            id: "roughness",
                                            label: "벽면 거칠기 (m, ft)",
                                            type: "number",
                                            placeholder: "0.0",
                                            validation: {
                                                min: 0
                                            }
                                        },
                                        {
                                            id: "hydraulicDiameter",
                                            label: "수력학적 직경 (m, ft)",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "0 입력 시 면적에서 자동 계산됨",
                                            helpText: "4*면적/젖은둘레 또는 2*√(면적/π)",
                                            validation: {
                                                min: 0,
                                                custom: "validateHydraulicDiameter"
                                            }
                                        }
                                    ],
                                    dynamicRows: {
                                        dependsOn: "numberOfVolumes"
                                    }
                                }
                            ]
                        },
                        {
                            id: "CCC0901-0999",
                            label: "파이프 접합부 손실 계수",
                            description: "파이프 내부 접합부의 에너지 손실 계수를 정의합니다. (선택 사항)",
                            fields: [
                                {
                                    id: "lossCoeffTable",
                                    label: "손실 계수 테이블",
                                    type: "table",
                                    description: "접합부별 손실 계수",
                                    required: false,
                                    columns: [
                                        {
                                            id: "junctionNumber",
                                            label: "접합부 번호",
                                            type: "number",
                                            placeholder: "1",
                                            validation: {
                                                min: 1,
                                                max: 98,
                                                integer: true
                                            }
                                        },
                                        {
                                            id: "forwardLossCoef",
                                            label: "순방향 손실 계수 (AF)",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "레이놀즈 수 독립적 순방향 에너지 손실 계수",
                                            validation: {
                                                min: 0
                                            }
                                        },
                                        {
                                            id: "reverseLossCoef",
                                            label: "역방향 손실 계수 (AR)",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "레이놀즈 수 독립적 역방향 에너지 손실 계수",
                                            validation: {
                                                min: 0
                                            }
                                        }
                                    ],
                                    dynamicRows: {
                                        dependsOn: "numberOfVolumes",
                                        formula: "n - 1" // nv - 1
                                    }
                                }
                            ]
                        },
                        {
                            id: "CCC2501-2599",
                            label: "파이프 체적 추가 벽면 마찰 데이터",
                            description: "파이프 각 체적의 추가 벽면 마찰 계수를 정의합니다. (선택 사항)",
                            fields: [
                                {
                                    id: "additionalFrictionTable",
                                    label: "추가 마찰 데이터 테이블",
                                    type: "table",
                                    description: "체적별 추가 마찰 계수",
                                    required: false,
                                    columns: [
                                        {
                                            id: "volumeNumber",
                                            label: "체적 번호",
                                            type: "number",
                                            placeholder: "1",
                                            validation: {
                                                min: 1,
                                                max: 99,
                                                integer: true
                                            }
                                        },
                                        {
                                            id: "xShapeFactor",
                                            label: "X-좌표 형상 인자",
                                            type: "number",
                                            placeholder: "1.0",
                                            description: "X-좌표 방향 층류 형상 인자",
                                            default: 1.0
                                        },
                                        {
                                            id: "xViscRatioExp",
                                            label: "X-좌표 점도비 지수",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "X-좌표 방향 점도비 지수",
                                            default: 0.0
                                        },
                                        {
                                            id: "yShapeFactor",
                                            label: "Y-좌표 형상 인자",
                                            type: "number",
                                            placeholder: "1.0",
                                            description: "Y-좌표 방향 층류 형상 인자",
                                            default: 1.0
                                        },
                                        {
                                            id: "yViscRatioExp",
                                            label: "Y-좌표 점도비 지수",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "Y-좌표 방향 점도비 지수",
                                            default: 0.0
                                        },
                                        {
                                            id: "zShapeFactor",
                                            label: "Z-좌표 형상 인자",
                                            type: "number",
                                            placeholder: "1.0",
                                            description: "Z-좌표 방향 층류 형상 인자",
                                            default: 1.0
                                        },
                                        {
                                            id: "zViscRatioExp",
                                            label: "Z-좌표 점도비 지수",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "Z-좌표 방향 점도비 지수",
                                            default: 0.0
                                        }
                                    ],
                                    dynamicRows: {
                                        dependsOn: "numberOfVolumes"
                                    }
                                }
                            ]
                        },
                        {
                            id: "CCC3001-3099",
                            label: "파이프 접합부 형상 손실 데이터",
                            description: "파이프 내부 접합부의 형상 손실 계수를 정의합니다. (선택 사항)",
                            fields: [
                                {
                                    id: "formLossTable",
                                    label: "형상 손실 데이터 테이블",
                                    type: "table",
                                    description: "접합부별 형상 손실 계수",
                                    required: false,
                                    columns: [
                                        {
                                            id: "junctionNumber",
                                            label: "접합부 번호",
                                            type: "number",
                                            placeholder: "1",
                                            validation: {
                                                min: 1,
                                                max: 98,
                                                integer: true
                                            }
                                        },
                                        {
                                            id: "BF",
                                            label: "BF",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "순방향 레이놀즈 수 의존 계수",
                                            helpText: "KF = AF + BF*Re^(-CF)",
                                            validation: {
                                                min: 0
                                            }
                                        },
                                        {
                                            id: "CF",
                                            label: "CF",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "순방향 레이놀즈 수 지수",
                                            validation: {
                                                min: 0
                                            }
                                        },
                                        {
                                            id: "BR",
                                            label: "BR",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "역방향 레이놀즈 수 의존 계수",
                                            helpText: "KR = AR + BR*Re^(-CR)",
                                            validation: {
                                                min: 0
                                            }
                                        },
                                        {
                                            id: "CR",
                                            label: "CR",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "역방향 레이놀즈 수 지수",
                                            validation: {
                                                min: 0
                                            }
                                        }
                                    ],
                                    dynamicRows: {
                                        dependsOn: "numberOfVolumes",
                                        formula: "n - 1" // nv - 1
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: "flags",
                    label: "제어 플래그",
                    cards: [
                        {
                            id: "CCC1001-1099",
                            label: "파이프 체적 X-좌표 제어 플래그",
                            description: "파이프 각 체적의 물리적 모델 제어 플래그를 정의합니다.",
                            fields: [
                                {
                                    id: "volumeFlagsTable",
                                    label: "체적 제어 플래그 테이블",
                                    type: "table",
                                    description: "체적별 제어 플래그",
                                    required: true,
                                    columns: [
                                        {
                                            id: "volumeNumber",
                                            label: "체적 번호",
                                            type: "number",
                                            placeholder: "1",
                                            validation: {
                                                min: 1,
                                                max: 99,
                                                integer: true
                                            }
                                        },
                                        {
                                            id: "volumeFlags",
                                            label: "체적 제어 플래그",
                                            type: "flags",
                                            description: "형식: tlpvbfe",
                                            subfields: [
                                                {
                                                    id: "tFlag",
                                                    label: "열 전단 추적 모델 (t)",
                                                    type: "select",
                                                    options: [
                                                        { value: "0", label: "미사용" },
                                                        { value: "1", label: "사용" }
                                                    ],
                                                    description: "열 전단 추적 모델 사용 여부",
                                                    helpText: "수직 방향 컴포넌트에만 적용 가능",
                                                    default: "0"
                                                },
                                                {
                                                    id: "lFlag",
                                                    label: "혼합 수위 추적 모델 (l)",
                                                    type: "select",
                                                    options: [
                                                        { value: "0", label: "미사용" },
                                                        { value: "1", label: "사용" }
                                                    ],
                                                    description: "혼합 수위 추적 모델 사용 여부",
                                                    helpText: "수직 방향 컴포넌트에만 적용 가능",
                                                    default: "0"
                                                },
                                                {
                                                    id: "pFlag",
                                                    label: "물 압축 방식 (p)",
                                                    type: "select",
                                                    options: [
                                                        { value: "0", label: "사용" },
                                                        { value: "1", label: "미사용" }
                                                    ],
                                                    description: "물 압축 방식 사용 여부",
                                                    default: "0"
                                                },
                                                {
                                                    id: "vFlag",
                                                    label: "수직 층화 모델 (v)",
                                                    type: "select",
                                                    options: [
                                                        { value: "0", label: "사용" },
                                                        { value: "1", label: "미사용" }
                                                    ],
                                                    description: "수직 층화 모델 사용 여부",
                                                    default: "0"
                                                },
                                                {
                                                    id: "bFlag",
                                                    label: "계면 마찰 모델 (b)",
                                                    type: "select",
                                                    options: [
                                                        { value: "0", label: "파이프 모델" },
                                                        { value: "1", label: "봉다발 모델" },
                                                        { value: "2", label: "ORNL ANS 모델" }
                                                    ],
                                                    description: "사용할 계면 마찰 모델",
                                                    default: "0"
                                                },
                                                {
                                                    id: "fFlag",
                                                    label: "벽 마찰 계산 (f)",
                                                    type: "select",
                                                    options: [
                                                        { value: "0", label: "계산함" },
                                                        { value: "1", label: "계산 안함" }
                                                    ],
                                                    description: "X-좌표 방향으로 벽 마찰 계산 여부",
                                                    default: "0"
                                                },
                                                {
                                                    id: "eFlag",
                                                    label: "열평형 계산 (e)",
                                                    type: "select",
                                                    options: [
                                                        { value: "0", label: "비평형(온도 불균형)" },
                                                        { value: "1", label: "평형(온도 균형)" }
                                                    ],
                                                    description: "열평형/비평형 계산 여부",
                                                    helpText: "평형 체적과 비평형 체적은 연결하지 않는 것이 좋음",
                                                    default: "0"
                                                }
                                            ]
                                        }
                                    ],
                                    dynamicRows: {
                                        dependsOn: "numberOfVolumes"
                                    }
                                }
                            ]
                        },
                        {
                            id: "CCC1101-1199",
                            label: "파이프 접합부 제어 플래그",
                            description: "파이프 내부 접합부의 물리적 모델 제어 플래그를 정의합니다.",
                            fields: [
                                {
                                    id: "junctionFlagsTable",
                                    label: "접합부 제어 플래그 테이블",
                                    type: "table",
                                    description: "접합부별 제어 플래그",
                                    required: true,
                                    columns: [
                                        {
                                            id: "junctionNumber",
                                            label: "접합부 번호",
                                            type: "number",
                                            placeholder: "1",
                                            validation: {
                                                min: 1,
                                                max: 98,
                                                integer: true
                                            }
                                        },
                                        {
                                            id: "junctionFlags",
                                            label: "접합부 제어 플래그",
                                            type: "flags",
                                            description: "형식: 0ef0cahs (파이프 컴포넌트용)",
                                            subfields: [
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
                                                    id: "cFlag",
                                                    label: "초킹 옵션 (c)",
                                                    type: "select",
                                                    options: [
                                                        { value: "0", label: "초킹 모델 적용" },
                                                        { value: "1", label: "초킹 모델 적용 안함" }
                                                    ],
                                                    description: "유동 초킹 모델 적용 여부",
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
                                        }
                                    ],
                                    dynamicRows: {
                                        dependsOn: "numberOfVolumes",
                                        formula: "n - 1" // nv - 1
                                    }
                                }
                            ]
                        },
                        {
                            id: "CCC3101-3199",
                            label: "ORNL ANS 계면 모델 값",
                            description: "ORNL ANS 계면 마찰 모델에 사용되는 값을 정의합니다.",
                            conditionalDisplay: {
                                field: "volumeFlagsTable",
                                condition: "hasAnyBFlag2"
                            },
                            fields: [
                                {
                                    id: "ornlAnsTable",
                                    label: "ORNL ANS 모델 값 테이블",
                                    type: "table",
                                    description: "체적별 ORNL ANS 모델 값",
                                    required: true,
                                    columns: [
                                        {
                                            id: "volumeNumber",
                                            label: "체적 번호",
                                            type: "number",
                                            placeholder: "1",
                                            validation: {
                                                min: 1,
                                                max: 99,
                                                integer: true
                                            }
                                        },
                                        {
                                            id: "gap",
                                            label: "Gap (m, ft)",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "측면 벽 사이 거리, 짧은 길이, 피치, 채널 폭",
                                            validation: {
                                                min: 0
                                            }
                                        },
                                        {
                                            id: "span",
                                            label: "Span (m, ft)",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "한쪽 끝에서 다른 쪽 끝까지의 거리, 긴 길이",
                                            validation: {
                                                min: 0
                                            }
                                        }
                                    ],
                                    dynamicRows: {
                                        dependsOn: "volumeFlagsTable",
                                        filter: "bFlag=2"
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
                            id: "CCC1201-1299",
                            label: "파이프 체적 초기 조건",
                            description: "파이프 각 체적의 초기 열역학적 상태를 정의합니다.",
                            fields: [
                                {
                                    id: "initialCondTable",
                                    label: "초기 조건 테이블",
                                    type: "table",
                                    description: "체적별 초기 열역학적 상태",
                                    required: true,
                                    columns: [
                                        {
                                            id: "volumeNumber",
                                            label: "체적 번호",
                                            type: "number",
                                            placeholder: "1",
                                            validation: {
                                                min: 1,
                                                max: 99,
                                                integer: true
                                            }
                                        },
                                        {
                                            id: "fluidType",
                                            label: "유체 유형 (ε)",
                                            type: "select",
                                            options: [
                                                { value: "0", label: "기본 유체" },
                                                { value: "1", label: "H₂O" },
                                                { value: "2", label: "D₂O" },
                                                { value: "3", label: "기타 유체" }
                                            ],
                                            description: "사용할 유체 종류",
                                            default: "0"
                                        },
                                        {
                                            id: "boronPresent",
                                            label: "붕소 존재 여부 (b)",
                                            type: "select",
                                            options: [
                                                { value: "0", label: "붕소 없음" },
                                                { value: "1", label: "붕소 농도 입력 필요" }
                                            ],
                                            description: "붕소 농도 입력 여부",
                                            default: "0"
                                        },
                                        {
                                            id: "thermoState",
                                            label: "열역학적 상태 정의 방법 (t)",
                                            type: "select",
                                            options: [
                                                { value: "0", label: "[P, Uf, Ug, αg] - 비평형/평형" },
                                                { value: "1", label: "[T, xs] - 평형" },
                                                { value: "2", label: "[P, xs] - 평형" },
                                                { value: "3", label: "[P, T] - 평형" },
                                                { value: "4", label: "[P, T, xs] - 비응축성 가스" },
                                                { value: "5", label: "[T, xs, xn] - 비응축성 가스" },
                                                { value: "6", label: "[P, Uf, Ug, αg, xn] - 비응축성 가스" }
                                            ],
                                            description: "열역학적 상태를 정의하는 방법",
                                            default: "3"
                                        },
                                        {
                                            id: "initialValue1",
                                            label: "초기값 1",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "t=0: 압력(Pa, lbf/in²), t=1: 온도(K, °F), t=2: 압력(Pa, lbf/in²), t=3: 압력(Pa, lbf/in²), t=4: 압력(Pa, lbf/in²), t=5: 온도(K, °F), t=6: 압력(Pa, lbf/in²)",
                                            required: true
                                        },
                                        {
                                            id: "initialValue2",
                                            label: "초기값 2",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "t=0: 액체 내부 에너지(J/kg, Btu/lb), t=1: 정적 품질, t=2: 정적 품질, t=3: 온도(K, °F), t=4: 온도(K, °F), t=5: 정적 품질, t=6: 액체 내부 에너지(J/kg, Btu/lb)",
                                            required: true
                                        },
                                        {
                                            id: "initialValue3",
                                            label: "초기값 3",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "t=0: 증기 내부 에너지(J/kg, Btu/lb), t=4: 정적 품질, t=5: 비응축성 품질, t=6: 증기 내부 에너지(J/kg, Btu/lb)",
                                            conditionalDisplay: {
                                                field: "thermoState",
                                                values: ["0", "4", "5", "6"]
                                            }
                                        },
                                        {
                                            id: "initialValue4",
                                            label: "초기값 4",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "t=0: 증기 체적 분율, t=6: 증기 체적 분율",
                                            conditionalDisplay: {
                                                field: "thermoState",
                                                values: ["0", "6"]
                                            }
                                        },
                                        {
                                            id: "initialValue5",
                                            label: "초기값 5",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "t=6: 비응축성 품질",
                                            conditionalDisplay: {
                                                field: "thermoState",
                                                values: ["6"]
                                            }
                                        }
                                    ],
                                    dynamicRows: {
                                        dependsOn: "numberOfVolumes"
                                    }
                                }
                            ]
                        },
                        {
                            id: "CCC1300",
                            label: "파이프 접합부 조건 제어 단어",
                            description: "접합부 초기 조건의 입력 방식을 정의합니다. (선택 사항)",
                            fields: [
                                {
                                    id: "junctionCondWord",
                                    label: "접합부 조건 제어 단어",
                                    type: "select",
                                    options: [
                                        { value: "0", label: "속도 입력" },
                                        { value: "1", label: "질량 유량 입력" }
                                    ],
                                    description: "접합부 초기 조건 입력 방식",
                                    default: "0",
                                    required: false
                                }
                            ]
                        },
                        {
                            id: "CCC1301-1399",
                            label: "파이프 접합부 초기 조건",
                            description: "파이프 내부 접합부의 초기 유동 상태를 정의합니다.",
                            fields: [
                                {
                                    id: "junctionInitCondTable",
                                    label: "접합부 초기 조건 테이블",
                                    type: "table",
                                    description: "접합부별 초기 유동 상태",
                                    required: true,
                                    columns: [
                                        {
                                            id: "junctionNumber",
                                            label: "접합부 번호",
                                            type: "number",
                                            placeholder: "1",
                                            validation: {
                                                min: 1,
                                                max: 98,
                                                integer: true
                                            }
                                        },
                                        {
                                            id: "liquidValue",
                                            label: "액체 속도/질량 유량",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "액체 속도(m/s, ft/s) 또는 질량 유량(kg/s, lb/s)",
                                            helpText: "제어 단어에 따라 속도 또는 질량 유량 입력"
                                        },
                                        {
                                            id: "vaporValue",
                                            label: "증기 속도/질량 유량",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "증기 속도(m/s, ft/s) 또는 질량 유량(kg/s, lb/s)",
                                            helpText: "제어 단어에 따라 속도 또는 질량 유량 입력"
                                        },
                                        {
                                            id: "interfaceVelocity",
                                            label: "계면 속도",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "계면 속도(m/s, ft/s)",
                                            helpText: "현재 구현되지 않았으므로 0 입력",
                                            default: 0.0
                                        }
                                    ],
                                    dynamicRows: {
                                        dependsOn: "numberOfVolumes",
                                        formula: "n - 1" // nv - 1
                                    }
                                }
                            ]
                        },
                        {
                            id: "CCC1401-1499",
                            label: "파이프 접합부 직경 및 CCFL 데이터",
                            description: "파이프 내부 접합부의 수력학적 직경과 CCFL 모델 매개변수를 정의합니다. (선택 사항)",
                            fields: [
                                {
                                    id: "junctionDiamCcflTable",
                                    label: "접합부 직경 및 CCFL 데이터 테이블",
                                    type: "table",
                                    description: "접합부별 직경 및 CCFL 데이터",
                                    required: false,
                                    columns: [
                                        {
                                            id: "junctionNumber",
                                            label: "접합부 번호",
                                            type: "number",
                                            placeholder: "1",
                                            validation: {
                                                min: 1,
                                                max: 98,
                                                integer: true
                                            }
                                        },
                                        {
                                            id: "junctionDiameter",
                                            label: "접합부 수력학적 직경",
                                            type: "number",
                                            unit: "m, ft",
                                            placeholder: "0.0",
                                            description: "접합부 수력학적 직경",
                                            helpText: "0 입력 시 자동 계산됨: 2*√(면적/π)",
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
                                                field: "junctionFlagsTable",
                                                condition: "hasFFlag1"
                                            },
                                            default: 0.0,
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
                                                field: "junctionFlagsTable",
                                                condition: "hasFFlag1"
                                            },
                                            default: 1.0,
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
                                                field: "junctionFlagsTable",
                                                condition: "hasFFlag1"
                                            },
                                            default: 1.0,
                                            validation: {
                                                min: 0
                                            }
                                        }
                                    ],
                                    dynamicRows: {
                                        dependsOn: "numberOfVolumes",
                                        formula: "n - 1" // nv - 1
                                    }
                                }
                            ]
                        },
                        {
                            id: "CCC2001-2099",
                            label: "파이프 초기 붕소 농도",
                            description: "파이프 각 체적의 초기 붕소 농도를 정의합니다.",
                            conditionalDisplay: {
                                field: "initialCondTable",
                                condition: "hasAnyBoronPresent1"
                            },
                            fields: [
                                {
                                    id: "boronConcTable",
                                    label: "붕소 농도 테이블",
                                    type: "table",
                                    description: "체적별 초기 붕소 농도",
                                    required: true,
                                    columns: [
                                        {
                                            id: "volumeNumber",
                                            label: "체적 번호",
                                            type: "number",
                                            placeholder: "1",
                                            validation: {
                                                min: 1,
                                                max: 99,
                                                integer: true
                                            }
                                        },
                                        {
                                            id: "boronConcentration",
                                            label: "붕소 농도",
                                            type: "number",
                                            placeholder: "0.0",
                                            description: "액체 질량 대비 붕소 질량 비율",
                                            validation: {
                                                min: 0
                                            }
                                        }
                                    ],
                                    dynamicRows: {
                                        dependsOn: "initialCondTable",
                                        filter: "boronPresent=1"
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        formatters: {
            generateHeader: function(component) {
                return `* PIPE 컴포넌트 입력\n*\n${component.number}0000  ${component.name}  PIPE\n`;
            },
            formatCard0001: function(data) {
                return `${data.componentNumber}0001  ${data.numberOfVolumes}\n`;
            },
            formatCardRange0101to0199: function(data) {
                let output = "";

                // X-좌표 면적 데이터 포맷팅
                for (let i = 0; i < data.xAreaTable.length; i++) {
                    const row = data.xAreaTable[i];
                    output += `${data.componentNumber}01${String(i+1).padStart(2, '0')}  ${row.area}  ${row.volumeNumber}\n`;
                }

                return output;
            },
            formatCardRange0201to0299: function(data) {
                if (!data.junctionAreaTable || data.junctionAreaTable.length === 0) return "";

                let output = "";

                // 접합부 면적 데이터 포맷팅
                for (let i = 0; i < data.junctionAreaTable.length; i++) {
                    const row = data.junctionAreaTable[i];
                    output += `${data.componentNumber}02${String(i+1).padStart(2, '0')}  ${row.junctionArea || '0.0'}  ${row.junctionNumber}\n`;
                }

                return output;
            },
            // 나머지 카드 포맷팅 함수들...
            generateVolumeFlags: function(flags) {
                return `${flags.tFlag || '0'}${flags.lFlag || '0'}${flags.pFlag || '0'}${flags.vFlag || '0'}${flags.bFlag || '0'}${flags.fFlag || '0'}${flags.eFlag || '0'}`;
            },
            generateJunctionFlags: function(flags) {
                return `0${flags.eFlag || '0'}${flags.fFlag || '0'}0${flags.cFlag || '0'}${flags.aFlag || '0'}${flags.hFlag || '0'}${flags.sFlag || '0'}`;
            }
        },
        validators: {
            validateVolume: function(value, data) {
                if(data.area && data.length && value) {
                    const calculatedVolume = data.area * data.length;
                    const error = Math.abs((value - calculatedVolume) / calculatedVolume);
                    return error <= 0.000001;
                }
                return true;
            },
            validateElevationChange: function(value, data) {
                if(value === undefined || value === null) return true;

                // 고도 변화의 절대값은 길이보다 작거나 같아야 함
                const volumeIndex = data.volumeNumber - 1;
                const length = data.xLengthTable[volumeIndex].length;
                return Math.abs(value) <= length;
            },
            validateHydraulicDiameter: function(value, data, roughness) {
                if(value === undefined || value === null || value === 0) return true;

                // 거칠기는 수력학적 직경의 절반보다 작아야 함
                if(roughness && roughness >= value / 2) {
                    return false;
                }

                return true;
            },
            hasAnyBFlag2: function(volumeFlagsTable) {
                if (!volumeFlagsTable) return false;

                for (const row of volumeFlagsTable) {
                    if (row.volumeFlags && row.volumeFlags.bFlag === "2") {
                        return true;
                    }
                }

                return false;
            },
            hasAnyBoronPresent1: function(initialCondTable) {
                if (!initialCondTable) return false;

                for (const row of initialCondTable) {
                    if (row.boronPresent === "1") {
                        return true;
                    }
                }

                return false;
            },
            hasFFlag1: function(junctionFlagsTable, junctionNumber) {
                if (!junctionFlagsTable) return false;

                for (const row of junctionFlagsTable) {
                    if (row.junctionNumber === junctionNumber && row.junctionFlags && row.junctionFlags.fFlag === "1") {
                        return true;
                    }
                }

                return false;
            }
        }
    },

    HEATSTR: {
        type: 'HEATSTR',
        label: 'HS',
        description: '열구조체는 고체 재료 내부의 1차원 열전달을 모델링합니다.',
        category: 'thermal',
        icon: 'HS',
        ports: {
            // ... 포트 정의 ...
        },
        properties: {
            tabs: [
                // 메시 데이터 탭
                {
                    id: "mesh",
                    label: "메시 데이터",
                    cards: [
                        {
                            id: "meshData",
                            label: "메시 간격 정의",
                            fields: [
                                {
                                    id: "meshVisualizer",
                                    label: "메시 시각화",
                                    type: "meshVisualizer", // 특수 필드 타입
                                    description: "반경 방향 메시 간격과 구성을 시각적으로 정의합니다",
                                    required: true,
                                    compositions: [
                                        { id: "1", name: "지르코늄 (Zircaloy)" },
                                        { id: "2", name: "갭 (Gas Gap)" },
                                        { id: "3", name: "UO2 (Uranium Dioxide)" },
                                        { id: "4", name: "S-STEEL (Stainless Steel)" },
                                        { id: "5", name: "C-STEEL (Carbon Steel)" }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                // 열물성 데이터 탭
                {
                    id: "thermal",
                    label: "열물성 데이터",
                    cards: [
                        {
                            id: "thermalConductivity",
                            label: "열전도도 테이블",
                            fields: [
                                {
                                    id: "conductivityTable",
                                    label: "온도-열전도도 테이블",
                                    type: "tableEditor", // 특수 필드 타입
                                    description: "온도에 따른 열전도도 값을 정의합니다",
                                    required: true,
                                    config: {
                                        xAxisLabel: "온도",
                                        yAxisLabel: "열전도도",
                                        xAxisUnit: "K",
                                        yAxisUnit: "W/m·K",
                                        minRows: 2,
                                        maxRows: 50,
                                        sortByX: true,
                                        xMin: 273
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        // ... 포맷터와 검증기 ...
        formatters: {
            // 기존 포맷터...
            formatMeshData: function(data) {
                let output = '';

                // 메시 플래그 카드
                output += `${data.number}0100  0      ${data.meshFormat}\n`;

                // 메시 간격 데이터
                if (data.meshFormat === '1') {
                    // 형식 1: 영역 수 + 우측 경계
                    data.meshData.forEach((region, index) => {
                        output += `${data.number}0${101 + index}  ${region.intervals || 1}    ${region.rightCoord}\n`;
                    });
                } else {
                    // 형식 2: 메시 간격
                    data.meshData.forEach((region, index) => {
                        output += `${data.number}0${101 + index}  ${region.interval}    ${index + 1}\n`;
                    });
                }

                // 구성 데이터
                let intervalCount = 0;
                data.meshData.forEach((region, index) => {
                    const intervals = parseInt(region.intervals) || 1;
                    for (let i = 0; i < intervals; i++) {
                        intervalCount++;
                        output += `${data.number}0${201 + intervalCount - 1}  ${region.composition}    ${intervalCount}\n`;
                    }
                });

                return output;
            },

            formatThermalProperty: function(data) {
                let output = '';

                // 열물성 헤더 카드
                output += `2010${data.composition}00   ${data.materialType}\n`;

                if (data.materialType === 'TBL/FCTN') {
                    // 열전도도 테이블 포맷팅
                    output += `* 온도-열전도도 테이블\n`;
                    data.conductivityTable.forEach((row, index) => {
                        output += `2010${data.composition}${String(index + 1).padStart(2, '0')}    ${row.x}    ${row.y}\n`;
                    });

                    // 체적 열용량 테이블 포맷팅
                    output += `* 온도-체적 열용량 테이블\n`;
                    data.heatCapacityTable.forEach((row, index) => {
                        output += `2010${data.composition}${String(index + 51).padStart(2, '0')}    ${row.x}    ${row.y}\n`;
                    });
                }

                return output;
            }
        },
    },

    PUMP: {
        type: 'PUMP',
        label: 'Pump',
        icon: '⚙️',
        category: 'hydro',
        ports: {
            inputs: [{ id: 'from', label: 'In' }],
            outputs: [{ id: 'to', label: 'Out' }]
        },
        defaultData: {
            flowRate: 10.0, // in kg/s
            head: 100.0,    // in meters
            efficiency: 0.8 // efficiency ratio
        },
        properties: [
            { id: 'flowRate', label: 'Flow Rate (kg/s)', type: 'number', min: 0.1, max: 1000.0, step: 0.1 },
            { id: 'head', label: 'Head (m)', type: 'number', min: 1.0, max: 1000.0, step: 1.0 },
            { id: 'efficiency', label: 'Efficiency', type: 'number', min: 0.1, max: 1.0, step: 0.01 }
        ]
    },
    BRANCH: {
        type: 'BRANCH',
        label: 'BRANCH',
        icon: '⚙️',
        category: 'hydro',
        ports: {
            inputs: [{ id: 'from', label: 'In' }],
            outputs: [{ id: 'to', label: 'Out' }]
        },
        defaultData: {
            flowRate: 10.0, // in kg/s
            head: 100.0,    // in meters
            efficiency: 0.8 // efficiency ratio
        },
        properties: [
            { id: 'flowRate', label: 'Flow Rate (kg/s)', type: 'number', min: 0.1, max: 1000.0, step: 0.1 },
            { id: 'head', label: 'Head (m)', type: 'number', min: 1.0, max: 1000.0, step: 1.0 },
            { id: 'efficiency', label: 'Efficiency', type: 'number', min: 0.1, max: 1.0, step: 0.01 }
        ]
    },
    ANNULUS: {
        type: 'ANNULUS',
        label: 'ANNULUS',
        icon: '⚙️',
        category: 'hydro',
        ports: {
            inputs: [{ id: 'from', label: 'In' }],
            outputs: [{ id: 'to', label: 'Out' }]
        },
        defaultData: {
            flowRate: 10.0, // in kg/s
            head: 100.0,    // in meters
            efficiency: 0.8 // efficiency ratio
        },
        properties: [
            { id: 'flowRate', label: 'Flow Rate (kg/s)', type: 'number', min: 0.1, max: 1000.0, step: 0.1 },
            { id: 'head', label: 'Head (m)', type: 'number', min: 1.0, max: 1000.0, step: 1.0 },
            { id: 'efficiency', label: 'Efficiency', type: 'number', min: 0.1, max: 1.0, step: 0.01 }
        ]
    },
    PRIZER: {
        type: 'PRIZER',
        label: 'PRIZER',
        icon: '⚙️',
        category: 'hydro',
        ports: {
            inputs: [{ id: 'from', label: 'In' }],
            outputs: [{ id: 'to', label: 'Out' }]
        },
        defaultData: {
            flowRate: 10.0, // in kg/s
            head: 100.0,    // in meters
            efficiency: 0.8 // efficiency ratio
        },
        properties: [
            { id: 'flowRate', label: 'Flow Rate (kg/s)', type: 'number', min: 0.1, max: 1000.0, step: 0.1 },
            { id: 'head', label: 'Head (m)', type: 'number', min: 1.0, max: 1000.0, step: 1.0 },
            { id: 'efficiency', label: 'Efficiency', type: 'number', min: 0.1, max: 1.0, step: 0.01 }
        ]
    },


    // 다른 컴포넌트들...
};


// Group components by category
export const componentCategories = {
    flow: 'Flow Components',
    source: 'Sources',
    thermal: 'Thermal Components',
    control: 'Control Components',
    structure: 'Structural Components',
    hydro: 'Hydrodynamic Components',
};
