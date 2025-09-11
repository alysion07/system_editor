const PRIZER = {
    type: 'PRIZER',
    label: 'Pressurizer',
    icon: '🔹',
    description: '가압기는 1차 루프의 압력을 제어하고 냉각재의 체적 변화를 보상하는 컴포넌트입니다.',
    category: 'hydro',
    ports: {
        inputs: [{ id: 'surge', label: 'Surge' }],
        outputs: [{ id: 'relief', label: 'Relief' }, { id: 'spray', label: 'Spray' }]
    },
    properties: {
        tabs: [
            {
                id: "basic",
                label: "기본 데이터",
                cards: [
                    {
                        id: "CCC0101",
                        label: "가압기 기하학 데이터",
                        description: "가압기의 기하학적 특성을 정의합니다.",
                        fields: [
                            {
                                id: "totalVolume",
                                label: "전체 체적",
                                type: "number",
                                unit: "m³, ft³",
                                placeholder: "0.0",
                                description: "가압기의 전체 내부 체적",
                                required: true,
                                validation: {
                                    min: 0.000001,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "height",
                                label: "전체 높이",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "가압기의 전체 높이",
                                required: true,
                                validation: {
                                    min: 0.000001,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "crossSectionArea",
                                label: "단면적",
                                type: "number",
                                unit: "m², ft²",
                                placeholder: "0.0",
                                description: "가압기의 수평 단면적 (자동 계산 또는 수동 입력)",
                                required: false,
                                validation: {
                                    min: 0,
                                    custom: "validateCrossSectionArea"
                                }
                            },
                            {
                                id: "surgeLineArea",
                                label: "서지 라인 면적",
                                type: "number",
                                unit: "m², ft²",
                                placeholder: "0.0",
                                description: "서지 라인 연결 면적",
                                required: true,
                                validation: {
                                    min: 0.000001,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "surgeLineHeight",
                                label: "서지 라인 높이",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "바닥에서 서지 라인까지의 높이",
                                required: true,
                                validation: {
                                    min: 0,
                                    custom: "validateSurgeLineHeight"
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0102",
                        label: "가압기 구조 데이터",
                        description: "가압기 내부 구조물과 레벨 정보를 설정합니다.",
                        fields: [
                            {
                                id: "initialWaterLevel",
                                label: "초기 수위",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "바닥에서부터의 초기 수위",
                                required: true,
                                validation: {
                                    min: 0,
                                    custom: "validateWaterLevel"
                                }
                            },
                            {
                                id: "normalWaterLevel",
                                label: "정상 운전 수위",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "정상 운전 시 목표 수위",
                                required: true,
                                validation: {
                                    min: 0,
                                    custom: "validateWaterLevel"
                                }
                            },
                            {
                                id: "sprayNozzleHeight",
                                label: "스프레이 노즐 높이",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "바닥에서 스프레이 노즐까지의 높이",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "reliefValveHeight",
                                label: "안전밸브 높이",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "바닥에서 안전밸브까지의 높이",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0103",
                        label: "제어 시스템 데이터",
                        description: "가압기 제어 시스템과 관련된 플래그를 설정합니다.",
                        fields: [
                            {
                                id: "levelControlEnabled",
                                label: "수위 제어",
                                type: "boolean",
                                description: "자동 수위 제어 사용 여부",
                                required: false,
                                default: true
                            },
                            {
                                id: "pressureControlEnabled",
                                label: "압력 제어",
                                type: "boolean",
                                description: "자동 압력 제어 사용 여부",
                                required: false,
                                default: true
                            },
                            {
                                id: "flags",
                                label: "제어 플래그",
                                type: "text",
                                placeholder: "0000000",
                                description: "7자리 제어 플래그 (tlpvbfe)",
                                helpText: "t:열전단추적, l:혼합레벨추적, p:물압축, v:수직층화, b:계면마찰모델, f:벽마찰, e:열평형",
                                required: false,
                                default: "0000000",
                                validation: {
                                    custom: "validateControlFlags"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: "heaters",
                label: "히터 시스템",
                cards: [
                    {
                        id: "CCC0111",
                        label: "전기 히터 데이터",
                        description: "가압기 전기 히터의 특성을 설정합니다.",
                        fields: [
                            {
                                id: "totalHeaterPower",
                                label: "전체 히터 용량",
                                type: "number",
                                unit: "kW, MW",
                                placeholder: "0.0",
                                description: "전기 히터의 총 용량",
                                required: false,
                                default: 0.0,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "heaterBankCount",
                                label: "히터 뱅크 개수",
                                type: "number",
                                placeholder: "0",
                                description: "히터 뱅크의 개수",
                                required: false,
                                default: 0,
                                validation: {
                                    min: 0,
                                    max: 10,
                                    custom: "validateInteger"
                                }
                            },
                            {
                                id: "heaterHeight",
                                label: "히터 설치 높이",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "바닥에서 히터 중심까지의 높이",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "heaterControlLogic",
                                label: "히터 제어 논리",
                                type: "select",
                                description: "히터 작동 제어 방식",
                                required: false,
                                default: "0",
                                options: [
                                    { value: "0", label: "압력 기반 제어" },
                                    { value: "1", label: "수위 기반 제어" },
                                    { value: "2", label: "압력+수위 조합 제어" },
                                    { value: "3", label: "외부 신호 제어" }
                                ]
                            }
                        ]
                    },
                    {
                        id: "CCC0112",
                        label: "히터 운전 조건",
                        description: "히터 작동 조건과 논리를 설정합니다.",
                        fields: [
                            {
                                id: "heaterOnPressure",
                                label: "히터 작동 압력",
                                type: "number",
                                unit: "Pa, psia",
                                placeholder: "0.0",
                                description: "히터가 작동하는 최소 압력",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "heaterOffPressure",
                                label: "히터 정지 압력",
                                type: "number",
                                unit: "Pa, psia",
                                placeholder: "0.0",
                                description: "히터가 정지하는 최대 압력",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "minimumWaterLevel",
                                label: "히터 보호 수위",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "히터 보호를 위한 최소 수위",
                                helpText: "이 수위 아래에서는 히터가 정지됩니다",
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
                id: "spray",
                label: "스프레이 시스템",
                cards: [
                    {
                        id: "CCC0121",
                        label: "스프레이 데이터",
                        description: "가압기 스프레이 시스템의 특성을 설정합니다.",
                        fields: [
                            {
                                id: "sprayFlowArea",
                                label: "스프레이 유량 면적",
                                type: "number",
                                unit: "m², ft²",
                                placeholder: "0.0",
                                description: "스프레이 노즐의 유효 면적",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "sprayFlowCoefficient",
                                label: "스프레이 유량 계수",
                                type: "number",
                                placeholder: "0.6",
                                description: "스프레이 노즐의 유량 계수",
                                required: false,
                                default: 0.6,
                                validation: {
                                    min: 0.1,
                                    max: 1.0
                                }
                            },
                            {
                                id: "sprayTemperature",
                                label: "스프레이 온도",
                                type: "number",
                                unit: "K, °F",
                                placeholder: "0.0",
                                description: "스프레이 냉각수 온도",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "sprayControlLogic",
                                label: "스프레이 제어 논리",
                                type: "select",
                                description: "스프레이 작동 제어 방식",
                                required: false,
                                default: "0",
                                options: [
                                    { value: "0", label: "압력 기반 제어" },
                                    { value: "1", label: "온도 기반 제어" },
                                    { value: "2", label: "압력+온도 조합 제어" },
                                    { value: "3", label: "외부 신호 제어" }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: "relief",
                label: "안전 시스템",
                cards: [
                    {
                        id: "CCC0131",
                        label: "안전밸브/방출밸브",
                        description: "가압기 안전밸브와 방출밸브의 특성을 설정합니다.",
                        fields: [
                            {
                                id: "reliefValveCount",
                                label: "안전밸브 개수",
                                type: "number",
                                placeholder: "2",
                                description: "설치된 안전밸브의 개수",
                                required: false,
                                default: 2,
                                validation: {
                                    min: 1,
                                    max: 10,
                                    custom: "validateInteger"
                                }
                            },
                            {
                                id: "reliefSetPressure",
                                label: "안전밸브 설정압력",
                                type: "number",
                                unit: "Pa, psia",
                                placeholder: "0.0",
                                description: "안전밸브 작동 설정 압력",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "reliefCapacity",
                                label: "안전밸브 용량",
                                type: "number",
                                unit: "kg/s, lb/hr",
                                placeholder: "0.0",
                                description: "안전밸브의 최대 방출 용량",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "powerOperatedReliefValve",
                                label: "동력조작 방출밸브 (PORV)",
                                type: "boolean",
                                description: "PORV 설치 여부",
                                required: false,
                                default: true
                            },
                            {
                                id: "porvSetPressure",
                                label: "PORV 설정압력",
                                type: "number",
                                unit: "Pa, psia",
                                placeholder: "0.0",
                                description: "PORV 작동 설정 압력",
                                conditionalDisplay: {
                                    field: "powerOperatedReliefValve",
                                    value: true
                                },
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
                        id: "CCC0200",
                        label: "열역학적 초기 조건",
                        description: "가압기의 초기 열역학적 상태를 정의합니다.",
                        fields: [
                            {
                                id: "thermoState",
                                label: "열역학적 상태 정의 방법",
                                type: "select",
                                description: "열역학적 상태를 정의하는 방법",
                                required: true,
                                default: "3",
                                options: [
                                    { value: "2", label: "[압력, 정적 품질] (평형)" },
                                    { value: "3", label: "[압력, 온도] (평형)" }
                                ]
                            },
                            {
                                id: "initialPressure",
                                label: "초기 압력",
                                type: "number",
                                unit: "Pa, psia",
                                placeholder: "0.0",
                                description: "가압기의 초기 압력",
                                required: true,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "steamTemperature",
                                label: "증기 온도",
                                type: "number",
                                unit: "K, °F",
                                placeholder: "0.0",
                                description: "가압기 상부 증기 온도",
                                required: true,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "waterTemperature",
                                label: "물 온도",
                                type: "number",
                                unit: "K, °F",
                                placeholder: "0.0",
                                description: "가압기 하부 물 온도",
                                required: true,
                                validation: {
                                    min: 0
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    validators: {
        validateInteger: function(value) {
            if (value === undefined || value === null || value === '') return true;
            const numValue = parseFloat(value);
            return !isNaN(numValue) && Number.isInteger(numValue) && numValue >= 0;
        },
        validatePositiveNonZero: function(value) {
            if (value === undefined || value === null || value === '') return false;
            const numValue = parseFloat(value);
            return !isNaN(numValue) && numValue > 0;
        },
        validateCrossSectionArea: function(area, data) {
            if (!area || area === 0) return true; // 자동 계산되는 경우
            if (!data.totalVolume || !data.height) return true;
            
            const calculatedArea = data.totalVolume / data.height;
            const tolerance = 0.01;
            const error = Math.abs((area - calculatedArea) / calculatedArea);
            
            return error <= tolerance;
        },
        validateSurgeLineHeight: function(value, data) {
            if (value === undefined || value === null || value === '') return false;
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue < 0) return false;
            
            // 서지 라인 높이는 전체 높이보다 작아야 함
            if (data.height && numValue >= parseFloat(data.height)) {
                return false;
            }
            return true;
        },
        validateWaterLevel: function(value, data) {
            if (value === undefined || value === null || value === '') return false;
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue < 0) return false;
            
            // 수위는 전체 높이보다 작아야 함
            if (data.height && numValue >= parseFloat(data.height)) {
                return false;
            }
            return true;
        },
        validateControlFlags: function(value) {
            if (!value) return true;
            return /^[01]{7}$/.test(value);
        }
    },
    calculators: {
        autoCalculateCrossSectionArea: function(data) {
            if ((!data.crossSectionArea || data.crossSectionArea === 0) && data.totalVolume && data.height) {
                return data.totalVolume / data.height;
            }
            return data.crossSectionArea;
        }
    }
};

export default PRIZER;