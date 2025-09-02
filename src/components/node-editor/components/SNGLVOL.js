import metaTMDPJUN from "../controls/TmdpJunComponent.jsx";

const SNGLVOL = {
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
                                helpText: "반드시 0보다 큰 값이어야 합니다",
                                required: true,
                                relatedFields: ["length", "volume"],
                                validation: {
                                    min: 0.000001,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "length",
                                label: "길이",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "체적의 길이",
                                helpText: "반드시 0보다 큰 값이어야 합니다",
                                required: true,
                                relatedFields: ["area", "volume"],
                                validation: {
                                    min: 0.000001,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "volume",
                                label: "부피",
                                type: "number",
                                unit: "m³, ft³",
                                placeholder: "0.0",
                                description: "체적의 부피",
                                helpText: "면적 × 길이와 일치해야 함. 자동 계산 또는 수동 입력",
                                required: false,
                                relatedFields: ["area", "length"],
                                validation: {
                                    min: 0,
                                    custom: "validateVolumeConsistency",
                                    required: "validateVolumeRequired"
                                },
                                conditionalRequired: function(data) {
                                    // 면적과 길이가 모두 없으면 체적은 필수
                                    return !data.area && !data.length;
                                }
                            },
                            {
                                id: "azimuthal",
                                label: "방위각",
                                type: "number",
                                unit: "도",
                                placeholder: "0.0",
                                description: "방위각 (절댓값 ≤ 360도)",
                                helpText: "절댓값이 360도 이하여야 함. 위치량으로 정의됨",
                                required: false,
                                validation: {
                                    custom: "validateAzimuthal"
                                }
                            },
                            {
                                id: "inclination",
                                label: "경사각",
                                type: "number",
                                unit: "도",
                                placeholder: "0.0",
                                description: "경사각 (절댓값 ≤ 90도)",
                                helpText: "절댓값이 90도 이하여야 함. 0°는 수평, 양수는 상향 경사",
                                required: false,
                                validation: {
                                    custom: "validateInclination"
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
                            },
                            {
                                id: "volumeNumber",
                                label: "체적 번호",
                                type: "number",
                                placeholder: "1",
                                description: "ORNL ANS 인터페이스 모델의 체적 번호 (W3(I))",
                                helpText: "ORNL ANS 인터페이스 모델 사용 시 필요한 체적 번호",
                                required: true,
                                validation: {
                                    min: 1,
                                    custom: "validateInteger"
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
                            // 옵션 0: [P, Uf, Ug, αg] 필드들
                            {
                                id: "pressure0",
                                label: "압력",
                                type: "number",
                                unit: "Pa, lbf/in²",
                                placeholder: "0.0",
                                description: "시스템 압력",
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "0"
                                },
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
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "0"
                                },
                                required: true
                            },
                            {
                                id: "vaporEnergy0",
                                label: "증기 비내부 에너지",
                                type: "number",
                                unit: "J/kg, Btu/lb",
                                placeholder: "0.0",
                                description: "증기 상의 비내부 에너지",
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "0"
                                },
                                required: true
                            },
                            {
                                id: "voidFraction0",
                                label: "증기 체적 분율",
                                type: "number",
                                placeholder: "0.0",
                                description: "증기가 차지하는 체적 비율",
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "0"
                                },
                                required: true,
                                validation: {
                                    min: 0,
                                    max: 1
                                }
                            },
                            // 옵션 1: [T, xs] 필드들
                            {
                                id: "temperature1",
                                label: "온도",
                                type: "number",
                                unit: "K, °F",
                                placeholder: "0.0",
                                description: "시스템 온도",
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "1"
                                },
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
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "1"
                                },
                                required: true,
                                validation: {
                                    min: 0,
                                    max: 1
                                }
                            },
                            // 옵션 2: [P, xs] 필드들
                            {
                                id: "pressure2",
                                label: "압력",
                                type: "number",
                                unit: "Pa, lbf/in²",
                                placeholder: "0.0",
                                description: "시스템 압력",
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "2"
                                },
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
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "2"
                                },
                                required: true,
                                validation: {
                                    min: 0,
                                    max: 1
                                }
                            },
                            // 옵션 3: [P, T] 필드들 (기본값)
                            {
                                id: "pressure3",
                                label: "압력",
                                type: "number",
                                unit: "Pa, lbf/in²",
                                placeholder: "0.0",
                                description: "시스템 압력",
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "3"
                                },
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
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "3"
                                },
                                required: true,
                                validation: {
                                    min: 0
                                }
                            },
                            // 옵션 4: [P, T, xs] 필드들 (비응축성 가스)
                            {
                                id: "pressure4",
                                label: "압력",
                                type: "number",
                                unit: "Pa, lbf/in²",
                                placeholder: "0.0",
                                description: "시스템 압력",
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "4"
                                },
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
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "4"
                                },
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
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "4"
                                },
                                required: true,
                                validation: {
                                    min: 0,
                                    max: 1
                                }
                            },
                            // 옵션 5: [T, xs, xn] 필드들 (비응축성 가스)
                            {
                                id: "temperature5",
                                label: "증기 포화 온도",
                                type: "number",
                                unit: "K, °F",
                                placeholder: "0.0",
                                description: "증기 포화 온도",
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "5"
                                },
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
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "5"
                                },
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
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "5"
                                },
                                required: true,
                                validation: {
                                    min: 0.000000001,
                                    max: 0.99999999
                                }
                            },
                            // 옵션 6: [P, Uf, Ug, αg, xn] 필드들 (비응축성 가스)
                            {
                                id: "pressure6",
                                label: "압력",
                                type: "number",
                                unit: "Pa, lbf/in²",
                                placeholder: "0.0",
                                description: "시스템 압력",
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "6"
                                },
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
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "6"
                                },
                                required: true
                            },
                            {
                                id: "vaporEnergy6",
                                label: "증기 비내부 에너지",
                                type: "number",
                                unit: "J/kg, Btu/lb",
                                placeholder: "0.0",
                                description: "증기 상의 비내부 에너지",
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "6"
                                },
                                required: true
                            },
                            {
                                id: "voidFraction6",
                                label: "증기 체적 분율",
                                type: "number",
                                placeholder: "0.0",
                                description: "증기가 차지하는 체적 비율",
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "6"
                                },
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
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "6"
                                },
                                required: true,
                                validation: {
                                    min: 0,
                                    max: 1,
                                    custom: "validateNonCondConsistency6"
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
        },
        validateAzimuthal: function(value) {
            if (value === undefined || value === null || value === '') return true;
            const numValue = parseFloat(value);
            return !isNaN(numValue) && Math.abs(numValue) <= 360;
        },
        validateInclination: function(value) {
            if (value === undefined || value === null || value === '') return true;
            const numValue = parseFloat(value);
            return !isNaN(numValue) && Math.abs(numValue) <= 90;
        },
        validateInteger: function(value) {
            if (value === undefined || value === null || value === '') return true;
            const numValue = parseFloat(value);
            return !isNaN(numValue) && Number.isInteger(numValue) && numValue >= 1;
        },
        validatePositiveNonZero: function(value) {
            if (value === undefined || value === null || value === '') return false;
            const numValue = parseFloat(value);
            return !isNaN(numValue) && numValue > 0;
        },
        validateVolumeConsistency: function(volume, data) {
            if (!volume || volume === 0) return true; // 자동 계산되는 경우
            if (!data.area || !data.length) return true; // 필요한 데이터가 없으면 통과
            
            const calculatedVolume = data.area * data.length;
            const tolerance = 0.01; // 1% 허용 오차
            const error = Math.abs((volume - calculatedVolume) / calculatedVolume);
            
            return error <= tolerance;
        },
        validateVolumeRequired: function(volume, data) {
            // 체적 필수 입력 검증 강화
            // Case 1: 면적과 길이가 모두 없으면 체적은 필수
            if (!data.area && !data.length) {
                return volume && volume > 0;
            }
            
            // Case 2: 면적 또는 길이 중 하나만 있으면 체적 또는 나머지 하나가 필수
            if ((data.area && !data.length) || (!data.area && data.length)) {
                return volume && volume > 0;
            }
            
            // Case 3: 면적과 길이가 모두 있으면 체적은 선택사항 (자동 계산)
            return true;
        },
        calculateHydraulicDiameter: function(area, length) {
            // 수력학적 직경 자동 계산
            // 원형 단면 가정: Dh = 2 * sqrt(Area / π)
            // 추가적으로 길이와의 일관성 검증 포함
            if (!area || area <= 0) return 0;
            
            const hydraulicDiameter = 2 * Math.sqrt(area / Math.PI);
            
            // 수력학적 직경이 비현실적으로 크지 않은지 검증
            // (길이의 10배를 초과하면 경고하지만 계산은 수행)
            if (length && hydraulicDiameter > length * 10) {
                console.warn(`수력학적 직경(${hydraulicDiameter.toFixed(3)})이 길이(${length})에 비해 매우 큼. 면적값을 확인하세요.`);
            }
            
            return hydraulicDiameter;
        },
        validateTemperature4: function(value, data) {
            // 간단한 검증: 실제로는 포화 온도 계산이 필요
            if (value === undefined || value === null || value === '') return true;
            const numValue = parseFloat(value);
            return !isNaN(numValue) && numValue > 0;
        },
        validateNonCondConsistency6: function(nonCondQuality, data) {
            if (nonCondQuality === undefined || nonCondQuality === null || nonCondQuality === '') return true;
            
            const numValue = parseFloat(nonCondQuality);
            if (isNaN(numValue)) return false;
            
            // 비응축성 품질이 0보다 큰 경우, 체적 분율도 0보다 커야 함
            if (numValue > 0 && data.voidFraction6 <= 0) {
                return false;
            }
            
            // 비응축성 품질이 1인 경우, 체적 분율도 1이어야 함
            if (numValue === 1 && data.voidFraction6 !== 1) {
                return false;
            }
            
            return numValue >= 0 && numValue <= 1;
        }
    },
    calculators: {
        autoCalculateHydraulicDiameter: function(data) {
            // hydraulic 필드가 0이거나 비어있을 때 자동 계산
            if ((!data.hydraulic || data.hydraulic === 0) && data.area && data.area > 0) {
                return this.validators.calculateHydraulicDiameter(data.area, data.length);
            }
            return data.hydraulic;
        },
        autoCalculateVolume: function(data) {
            // volume 필드가 비어있을 때 자동 계산
            if ((!data.volume || data.volume === 0) && data.area && data.length) {
                return data.area * data.length;
            }
            return data.volume;
        }
    }
};

export default SNGLVOL;