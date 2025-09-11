const BRANCH = {
    type: 'BRANCH',
    label: 'Branch Junction',
    icon: '⚙️',
    description: '분기 접합부는 하나의 입구에서 여러 출구로 유체가 분배되는 컴포넌트입니다.',
    category: 'hydro',
    ports: {
        inputs: [{ id: 'from', label: 'From' }],
        outputs: [{ id: 'to1', label: 'To 1' }, { id: 'to2', label: 'To 2' }]
    },
    properties: {
        tabs: [
            {
                id: "basic",
                label: "기본 데이터",
                cards: [
                    {
                        id: "CCC0000",
                        label: "컴포넌트 기본 정보",
                        description: "분기 접합부의 기본 정보를 설정합니다.",
                        fields: [
                            {
                                id: "componentName",
                                label: "컴포넌트 이름",
                                type: "text",
                                placeholder: "branch_01",
                                description: "분기 접합부의 이름",
                                required: true
                            }
                        ]
                    },
                    {
                        id: "CCC0001",
                        label: "접합부 개수",
                        description: "분기에서 연결되는 접합부의 개수를 설정합니다.",
                        fields: [
                            {
                                id: "njuns",
                                label: "접합부 개수",
                                type: "number",
                                placeholder: "2",
                                description: "분기에서 나가는 접합부의 개수",
                                required: true,
                                default: 2,
                                validation: {
                                    min: 2,
                                    max: 10,
                                    custom: "validateInteger"
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0101",
                        label: "체적 기하학 데이터",
                        description: "분기 체적의 기하학적 데이터를 정의합니다.",
                        fields: [
                            {
                                id: "area",
                                label: "단면적",
                                type: "number",
                                unit: "m², ft²",
                                placeholder: "0.0",
                                description: "분기 체적의 단면적",
                                required: true,
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
                                description: "분기 체적의 길이",
                                required: true,
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
                                description: "분기 체적의 부피 (면적 × 길이)",
                                required: false,
                                validation: {
                                    min: 0,
                                    custom: "validateVolumeConsistency"
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0102",
                        label: "체적 방향 데이터",
                        description: "분기 체적의 방향 정보를 설정합니다.",
                        fields: [
                            {
                                id: "azimuthal",
                                label: "방위각",
                                type: "number",
                                unit: "도",
                                placeholder: "0.0",
                                description: "방위각 (절댓값 ≤ 360도)",
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
                                required: false
                            }
                        ]
                    },
                    {
                        id: "CCC0103",
                        label: "벽면 마찰 데이터",
                        description: "벽면 마찰과 관련된 데이터를 설정합니다.",
                        fields: [
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
                                description: "수력학적 직경 (0 입력 시 자동 계산)",
                                required: false,
                                validation: {
                                    min: 0
                                }
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
                id: "junctions",
                label: "접합부 데이터",
                cards: [
                    {
                        id: "CCC1101",
                        label: "접합부 연결",
                        description: "분기 접합부의 연결 정보를 설정합니다.",
                        fields: [
                            {
                                id: "fromVolume",
                                label: "시작 체적",
                                type: "text",
                                placeholder: "CCCNN000X",
                                description: "시작 체적 번호 (형식: CCCNN000X)",
                                required: true,
                                validation: {
                                    custom: "validateVolumeNumber"
                                }
                            },
                            {
                                id: "toVolume1",
                                label: "연결 체적 1",
                                type: "text",
                                placeholder: "CCCNN000X",
                                description: "첫 번째 연결 체적 번호",
                                required: true,
                                validation: {
                                    custom: "validateVolumeNumber"
                                }
                            },
                            {
                                id: "toVolume2",
                                label: "연결 체적 2",
                                type: "text",
                                placeholder: "CCCNN000X",
                                description: "두 번째 연결 체적 번호",
                                required: true,
                                validation: {
                                    custom: "validateVolumeNumber"
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC1102",
                        label: "접합부 기하학",
                        description: "접합부의 기하학적 특성을 설정합니다.",
                        fields: [
                            {
                                id: "juncArea1",
                                label: "접합부 1 면적",
                                type: "number",
                                unit: "m², ft²",
                                placeholder: "0.0",
                                description: "첫 번째 접합부의 면적",
                                required: true,
                                validation: {
                                    min: 0.000001,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "juncArea2",
                                label: "접합부 2 면적",
                                type: "number",
                                unit: "m², ft²",
                                placeholder: "0.0",
                                description: "두 번째 접합부의 면적",
                                required: true,
                                validation: {
                                    min: 0.000001,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "juncFlags",
                                label: "접합부 플래그",
                                type: "text",
                                placeholder: "00000000",
                                description: "8자리 접합부 제어 플래그",
                                required: false,
                                default: "00000000"
                            }
                        ]
                    },
                    {
                        id: "CCC1103",
                        label: "손실 계수",
                        description: "접합부의 수력학적 손실 계수를 설정합니다.",
                        fields: [
                            {
                                id: "forwardLoss1",
                                label: "순방향 손실계수 1",
                                type: "number",
                                placeholder: "1.0",
                                description: "첫 번째 접합부의 순방향 손실계수",
                                required: false,
                                default: 1.0,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "reverseLoss1",
                                label: "역방향 손실계수 1",
                                type: "number",
                                placeholder: "1.0",
                                description: "첫 번째 접합부의 역방향 손실계수",
                                required: false,
                                default: 1.0,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "forwardLoss2",
                                label: "순방향 손실계수 2",
                                type: "number",
                                placeholder: "1.0",
                                description: "두 번째 접합부의 순방향 손실계수",
                                required: false,
                                default: 1.0,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "reverseLoss2",
                                label: "역방향 손실계수 2",
                                type: "number",
                                placeholder: "1.0",
                                description: "두 번째 접합부의 역방향 손실계수",
                                required: false,
                                default: 1.0,
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
                        label: "체적 초기 조건",
                        description: "분기 체적의 초기 열역학적 상태를 정의합니다.",
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
                                id: "pressure",
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
                                id: "temperature",
                                label: "온도",
                                type: "number",
                                unit: "K, °F",
                                placeholder: "0.0",
                                description: "시스템 온도",
                                required: true,
                                validation: {
                                    min: 0
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC1201",
                        label: "접합부 초기 조건",
                        description: "접합부의 초기 유동 조건을 설정합니다.",
                        fields: [
                            {
                                id: "flowState1",
                                label: "접합부 1 유동 상태",
                                type: "select",
                                description: "첫 번째 접합부의 초기 유동 상태",
                                required: false,
                                default: "0",
                                options: [
                                    { value: "0", label: "유속 지정" },
                                    { value: "1", label: "질량 유량 지정" }
                                ]
                            },
                            {
                                id: "flowValue1",
                                label: "접합부 1 유동값",
                                type: "number",
                                unit: "m/s 또는 kg/s",
                                placeholder: "0.0",
                                description: "첫 번째 접합부의 초기 유동값",
                                required: false,
                                default: 0.0
                            },
                            {
                                id: "flowState2",
                                label: "접합부 2 유동 상태",
                                type: "select",
                                description: "두 번째 접합부의 초기 유동 상태",
                                required: false,
                                default: "0",
                                options: [
                                    { value: "0", label: "유속 지정" },
                                    { value: "1", label: "질량 유량 지정" }
                                ]
                            },
                            {
                                id: "flowValue2",
                                label: "접합부 2 유동값",
                                type: "number",
                                unit: "m/s 또는 kg/s",
                                placeholder: "0.0",
                                description: "두 번째 접합부의 초기 유동값",
                                required: false,
                                default: 0.0
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
            return !isNaN(numValue) && Number.isInteger(numValue) && numValue >= 1;
        },
        validatePositiveNonZero: function(value) {
            if (value === undefined || value === null || value === '') return false;
            const numValue = parseFloat(value);
            return !isNaN(numValue) && numValue > 0;
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
        validateVolumeConsistency: function(volume, data) {
            if (!volume || volume === 0) return true;
            if (!data.area || !data.length) return true;
            
            const calculatedVolume = data.area * data.length;
            const tolerance = 0.01;
            const error = Math.abs((volume - calculatedVolume) / calculatedVolume);
            
            return error <= tolerance;
        },
        validateVolumeNumber: function(value) {
            if (!value) return false;
            // Simple validation for volume number format CCCNN000X
            return /^\d{3}\d{2}000[0-9]$/.test(value);
        },
        validateControlFlags: function(value) {
            if (!value) return true;
            return /^[01]{7}$/.test(value);
        }
    }
};

export default BRANCH;