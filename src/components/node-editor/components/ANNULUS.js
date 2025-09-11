const ANNULUS = {
    type: 'ANNULUS',
    label: 'Annular Volume',
    icon: '⭕',
    description: '환형 체적은 동심원 형태의 유체 영역을 나타내는 컴포넌트입니다.',
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
                        id: "CCC0101",
                        label: "환형 체적 기하학 데이터",
                        description: "환형 체적의 기하학적 데이터를 정의합니다.",
                        fields: [
                            {
                                id: "innerRadius",
                                label: "내부 반지름",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "환형 체적의 내부 반지름",
                                required: true,
                                validation: {
                                    min: 0.000001,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "outerRadius",
                                label: "외부 반지름",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "환형 체적의 외부 반지름",
                                required: true,
                                validation: {
                                    min: 0.000001,
                                    custom: "validateOuterRadius"
                                }
                            },
                            {
                                id: "height",
                                label: "높이",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "환형 체적의 높이",
                                required: true,
                                validation: {
                                    min: 0.000001,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "area",
                                label: "단면적",
                                type: "number",
                                unit: "m², ft²",
                                placeholder: "0.0",
                                description: "환형 단면적 (자동 계산 또는 수동 입력)",
                                required: false,
                                validation: {
                                    min: 0,
                                    custom: "validateAnnularArea"
                                }
                            },
                            {
                                id: "volume",
                                label: "부피",
                                type: "number",
                                unit: "m³, ft³",
                                placeholder: "0.0",
                                description: "환형 체적의 부피 (자동 계산 또는 수동 입력)",
                                required: false,
                                validation: {
                                    min: 0,
                                    custom: "validateAnnularVolume"
                                }
                            },
                            {
                                id: "hydraulicDiameter",
                                label: "수력학적 직경",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "수력학적 직경 (0 입력 시 자동 계산)",
                                helpText: "환형의 경우: 4 × (외부반지름² - 내부반지름²) × π / (2 × π × (외부반지름 + 내부반지름))",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0102",
                        label: "방향 및 위치 데이터",
                        description: "환형 체적의 방향과 위치 정보를 설정합니다.",
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
                        label: "벽면 조건",
                        description: "환형 체적의 내부 및 외부 벽면 조건을 설정합니다.",
                        fields: [
                            {
                                id: "innerWallRoughness",
                                label: "내벽 거칠기",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "내부 벽면 거칠기",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "outerWallRoughness",
                                label: "외벽 거칠기",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "외부 벽면 거칠기",
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
                id: "thermalHydraulics",
                label: "열수력 특성",
                cards: [
                    {
                        id: "CCC0111",
                        label: "열전달 특성",
                        description: "환형 체적의 열전달 특성을 설정합니다.",
                        fields: [
                            {
                                id: "innerWallHeatTransfer",
                                label: "내벽 열전달 계수",
                                type: "number",
                                unit: "W/m²K, Btu/hr-ft²-°F",
                                placeholder: "0.0",
                                description: "내부 벽면의 열전달 계수",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "outerWallHeatTransfer",
                                label: "외벽 열전달 계수",
                                type: "number",
                                unit: "W/m²K, Btu/hr-ft²-°F",
                                placeholder: "0.0",
                                description: "외부 벽면의 열전달 계수",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "heatSource",
                                label: "체적 열원",
                                type: "number",
                                unit: "W/m³, Btu/hr-ft³",
                                placeholder: "0.0",
                                description: "체적 내부 열원 (0 = 열원 없음)",
                                required: false,
                                default: 0.0
                            }
                        ]
                    },
                    {
                        id: "CCC0131",
                        label: "유동 특성",
                        description: "환형 체적 내의 유동 특성을 설정합니다.",
                        fields: [
                            {
                                id: "flowPattern",
                                label: "유동 패턴",
                                type: "select",
                                description: "환형 유동의 패턴 모델",
                                required: false,
                                default: "0",
                                options: [
                                    { value: "0", label: "균등 분산 유동" },
                                    { value: "1", label: "중력 분리 유동" },
                                    { value: "2", label: "와류 유동" }
                                ]
                            },
                            {
                                id: "mixingFactor",
                                label: "혼합 계수",
                                type: "number",
                                placeholder: "1.0",
                                description: "환형 내부의 혼합 정도 (0.0 ~ 1.0)",
                                required: false,
                                default: 1.0,
                                validation: {
                                    min: 0.0,
                                    max: 1.0
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
                        description: "환형 체적의 초기 열역학적 상태를 정의합니다.",
                        fields: [
                            {
                                id: "thermoState",
                                label: "열역학적 상태 정의 방법",
                                type: "select",
                                description: "열역학적 상태를 정의하는 방법",
                                required: true,
                                default: "3",
                                options: [
                                    { value: "1", label: "[온도, 정적 품질] (평형)" },
                                    { value: "2", label: "[압력, 정적 품질] (평형)" },
                                    { value: "3", label: "[압력, 온도] (평형)" },
                                    { value: "4", label: "[압력, 온도, 정적 품질] (비응축성 가스)" }
                                ]
                            },
                            {
                                id: "pressure",
                                label: "초기 압력",
                                type: "number",
                                unit: "Pa, lbf/in²",
                                placeholder: "0.0",
                                description: "환형 체적의 초기 압력",
                                required: true,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "temperature",
                                label: "초기 온도",
                                type: "number",
                                unit: "K, °F",
                                placeholder: "0.0",
                                description: "환형 체적의 초기 온도",
                                required: true,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "quality",
                                label: "정적 품질",
                                type: "number",
                                placeholder: "0.0",
                                description: "초기 정적 품질 (증기 질량 분율)",
                                helpText: "비응축성 가스가 있는 경우에만 사용",
                                conditionalDisplay: {
                                    field: "thermoState",
                                    value: "4"
                                },
                                required: false,
                                validation: {
                                    min: 0,
                                    max: 1
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0201",
                        label: "유동 초기 조건",
                        description: "환형 체적 내의 초기 유동 조건을 설정합니다.",
                        fields: [
                            {
                                id: "initialVelocity",
                                label: "초기 유속",
                                type: "number",
                                unit: "m/s, ft/s",
                                placeholder: "0.0",
                                description: "환형 내부의 초기 축방향 유속",
                                required: false,
                                default: 0.0
                            },
                            {
                                id: "initialAngularVelocity",
                                label: "초기 각속도",
                                type: "number",
                                unit: "rad/s",
                                placeholder: "0.0",
                                description: "환형 내부의 초기 회전 속도",
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
        validatePositiveNonZero: function(value) {
            if (value === undefined || value === null || value === '') return false;
            const numValue = parseFloat(value);
            return !isNaN(numValue) && numValue > 0;
        },
        validateOuterRadius: function(value, data) {
            if (value === undefined || value === null || value === '') return false;
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue <= 0) return false;
            
            // 외부 반지름은 내부 반지름보다 커야 함
            if (data.innerRadius && parseFloat(data.innerRadius) >= numValue) {
                return false;
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
        validateAnnularArea: function(area, data) {
            if (!area || area === 0) return true; // 자동 계산되는 경우
            if (!data.innerRadius || !data.outerRadius) return true;
            
            const innerR = parseFloat(data.innerRadius);
            const outerR = parseFloat(data.outerRadius);
            const calculatedArea = Math.PI * (outerR * outerR - innerR * innerR);
            const tolerance = 0.01;
            const error = Math.abs((area - calculatedArea) / calculatedArea);
            
            return error <= tolerance;
        },
        validateAnnularVolume: function(volume, data) {
            if (!volume || volume === 0) return true; // 자동 계산되는 경우
            if (!data.innerRadius || !data.outerRadius || !data.height) return true;
            
            const innerR = parseFloat(data.innerRadius);
            const outerR = parseFloat(data.outerRadius);
            const height = parseFloat(data.height);
            const calculatedVolume = Math.PI * (outerR * outerR - innerR * innerR) * height;
            const tolerance = 0.01;
            const error = Math.abs((volume - calculatedVolume) / calculatedVolume);
            
            return error <= tolerance;
        },
        validateControlFlags: function(value) {
            if (!value) return true;
            return /^[01]{7}$/.test(value);
        }
    },
    calculators: {
        autoCalculateAnnularArea: function(data) {
            if ((!data.area || data.area === 0) && data.innerRadius && data.outerRadius) {
                const innerR = parseFloat(data.innerRadius);
                const outerR = parseFloat(data.outerRadius);
                return Math.PI * (outerR * outerR - innerR * innerR);
            }
            return data.area;
        },
        autoCalculateAnnularVolume: function(data) {
            if ((!data.volume || data.volume === 0) && data.innerRadius && data.outerRadius && data.height) {
                const innerR = parseFloat(data.innerRadius);
                const outerR = parseFloat(data.outerRadius);
                const height = parseFloat(data.height);
                return Math.PI * (outerR * outerR - innerR * innerR) * height;
            }
            return data.volume;
        },
        autoCalculateHydraulicDiameter: function(data) {
            if ((!data.hydraulicDiameter || data.hydraulicDiameter === 0) && data.innerRadius && data.outerRadius) {
                const innerR = parseFloat(data.innerRadius);
                const outerR = parseFloat(data.outerRadius);
                // 환형의 수력학적 직경: 2 * (외부반지름 - 내부반지름)
                return 2 * (outerR - innerR);
            }
            return data.hydraulicDiameter;
        }
    }
};

export default ANNULUS;