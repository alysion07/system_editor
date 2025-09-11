const TURBINE = {
    type: 'TURBINE',
    label: 'Steam Turbine',
    icon: '🌪️',
    description: '증기 터빈은 증기의 열에너지를 기계적 회전 에너지로 변환하는 터보기계입니다.',
    category: 'hydro',
    ports: {
        inputs: [{ id: 'steam_inlet', label: 'Steam Inlet' }],
        outputs: [{ id: 'steam_outlet', label: 'Steam Outlet' }, { id: 'power_output', label: 'Power' }]
    },
    properties: {
        tabs: [
            {
                id: "basic",
                label: "기본 데이터",
                cards: [
                    {
                        id: "CCC0101",
                        label: "터빈 기하학 데이터",
                        description: "터빈의 기하학적 특성과 설계 정보를 정의합니다.",
                        fields: [
                            {
                                id: "turbineType",
                                label: "터빈 타입",
                                type: "select",
                                description: "터빈의 종류와 구조",
                                required: true,
                                default: "impulse",
                                options: [
                                    { value: "impulse", label: "임펄스 터빈 (Impulse)" },
                                    { value: "reaction", label: "반동 터빈 (Reaction)" },
                                    { value: "mixed", label: "혼합형 터빈" },
                                    { value: "axial", label: "축류 터빈" },
                                    { value: "radial", label: "원심 터빈" }
                                ]
                            },
                            {
                                id: "stageCount",
                                label: "단계 수",
                                type: "number",
                                placeholder: "1",
                                description: "터빈의 단계(스테이지) 수",
                                required: true,
                                default: 1,
                                validation: {
                                    min: 1,
                                    max: 20,
                                    custom: "validateInteger"
                                }
                            },
                            {
                                id: "rotorDiameter",
                                label: "로터 직경",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "터빈 로터의 평균 직경",
                                required: true,
                                validation: {
                                    min: 0.1,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "bladeHeight",
                                label: "블레이드 높이",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "터빈 블레이드의 높이",
                                required: true,
                                validation: {
                                    min: 0.001,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "nozzleArea",
                                label: "노즐 면적",
                                type: "number",
                                unit: "m², ft²",
                                placeholder: "0.0",
                                description: "증기 입구 노즐의 유효 면적",
                                required: true,
                                validation: {
                                    min: 0.000001,
                                    custom: "validatePositiveNonZero"
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0102",
                        label: "터빈 성능 특성",
                        description: "터빈의 성능과 운전 특성을 설정합니다.",
                        fields: [
                            {
                                id: "ratedPower",
                                label: "정격 출력",
                                type: "number",
                                unit: "MW, kW",
                                placeholder: "0.0",
                                description: "터빈의 정격 전기 출력",
                                required: true,
                                validation: {
                                    min: 0.001,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "ratedSpeed",
                                label: "정격 회전수",
                                type: "number",
                                unit: "rpm",
                                placeholder: "3600",
                                description: "터빈의 정격 회전수",
                                required: true,
                                default: 3600,
                                validation: {
                                    min: 100,
                                    max: 10000
                                }
                            },
                            {
                                id: "ratedSteamFlow",
                                label: "정격 증기 유량",
                                type: "number",
                                unit: "kg/s, lb/hr",
                                placeholder: "0.0",
                                description: "정격 운전 시 증기 유량",
                                required: true,
                                validation: {
                                    min: 0.001,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "thermalEfficiency",
                                label: "열효율",
                                type: "number",
                                placeholder: "0.35",
                                description: "터빈의 열효율 (0.0 ~ 1.0)",
                                required: true,
                                default: 0.35,
                                validation: {
                                    min: 0.1,
                                    max: 0.8
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0103",
                        label: "제어 시스템",
                        description: "터빈 제어 시스템과 거버너 특성을 설정합니다.",
                        fields: [
                            {
                                id: "governorType",
                                label: "거버너 타입",
                                type: "select",
                                description: "터빈 거버너(속도 제어기)의 종류",
                                required: true,
                                default: "mechanical",
                                options: [
                                    { value: "mechanical", label: "기계식 거버너" },
                                    { value: "hydraulic", label: "유압식 거버너" },
                                    { value: "electronic", label: "전자식 거버너" },
                                    { value: "digital", label: "디지털 제어" }
                                ]
                            },
                            {
                                id: "speedDroop",
                                label: "속도 드룹",
                                type: "number",
                                unit: "%",
                                placeholder: "4.0",
                                description: "무부하에서 전부하까지의 속도 드룹 (%)",
                                required: true,
                                default: 4.0,
                                validation: {
                                    min: 0.5,
                                    max: 10.0
                                }
                            },
                            {
                                id: "responseTime",
                                label: "응답 시간",
                                type: "number",
                                unit: "s",
                                placeholder: "0.5",
                                description: "부하 변화에 대한 거버너 응답 시간",
                                required: false,
                                default: 0.5,
                                validation: {
                                    min: 0.1,
                                    max: 10.0
                                }
                            },
                            {
                                id: "tripValveArea",
                                label: "트립 밸브 면적",
                                type: "number",
                                unit: "m², ft²",
                                placeholder: "0.0",
                                description: "비상 정지 밸브의 유효 면적",
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
                id: "thermodynamics",
                label: "열역학 특성",
                cards: [
                    {
                        id: "CCC0111",
                        label: "증기 입구 조건",
                        description: "터빈 입구 증기의 설계 조건을 정의합니다.",
                        fields: [
                            {
                                id: "inletPressure",
                                label: "입구 압력",
                                type: "number",
                                unit: "MPa, psia",
                                placeholder: "0.0",
                                description: "터빈 입구 증기 압력",
                                required: true,
                                validation: {
                                    min: 0.1,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "inletTemperature",
                                label: "입구 온도",
                                type: "number",
                                unit: "K, °F",
                                placeholder: "0.0",
                                description: "터빈 입구 증기 온도",
                                required: true,
                                validation: {
                                    min: 373.15,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "superheat",
                                label: "과열도",
                                type: "number",
                                unit: "K, °F",
                                placeholder: "0.0",
                                description: "증기 과열도 (포화온도 대비)",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "throttleValveArea",
                                label: "스로틀 밸브 면적",
                                type: "number",
                                unit: "m², ft²",
                                placeholder: "0.0",
                                description: "증기 조절 밸브의 유효 면적",
                                required: true,
                                validation: {
                                    min: 0.000001,
                                    custom: "validatePositiveNonZero"
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0112",
                        label: "증기 출구 조건",
                        description: "터빈 출구(배기) 증기 조건을 설정합니다.",
                        fields: [
                            {
                                id: "exhaustPressure",
                                label: "배기 압력",
                                type: "number",
                                unit: "kPa, psia",
                                placeholder: "0.0",
                                description: "터빈 출구 증기 압력",
                                required: true,
                                validation: {
                                    min: 1.0,
                                    custom: "validateExhaustPressure"
                                }
                            },
                            {
                                id: "exhaustQuality",
                                label: "배기 건도",
                                type: "number",
                                placeholder: "0.9",
                                description: "터빈 출구 증기 건도 (0.0 ~ 1.0)",
                                required: false,
                                default: 0.9,
                                validation: {
                                    min: 0.7,
                                    max: 1.0
                                }
                            },
                            {
                                id: "condensateExtraction",
                                label: "추기 증기",
                                type: "boolean",
                                description: "중간 추기 증기 사용 여부",
                                required: false,
                                default: false
                            },
                            {
                                id: "extractionPressure",
                                label: "추기 압력",
                                type: "number",
                                unit: "MPa, psia",
                                placeholder: "0.0",
                                description: "추기 증기 압력",
                                conditionalDisplay: {
                                    field: "condensateExtraction",
                                    value: true
                                },
                                required: false,
                                validation: {
                                    min: 0.1
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: "mechanical",
                label: "기계적 특성",
                cards: [
                    {
                        id: "CCC0121",
                        label: "회전체 특성",
                        description: "터빈 회전체의 기계적 특성을 설정합니다.",
                        fields: [
                            {
                                id: "rotorInertia",
                                label: "로터 관성",
                                type: "number",
                                unit: "kg·m²",
                                placeholder: "0.0",
                                description: "터빈-발전기 시스템의 회전 관성",
                                required: true,
                                validation: {
                                    min: 1.0,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "bearingType",
                                label: "베어링 타입",
                                type: "select",
                                description: "터빈 베어링의 종류",
                                required: false,
                                default: "journal",
                                options: [
                                    { value: "journal", label: "저널 베어링" },
                                    { value: "thrust", label: "추력 베어링" },
                                    { value: "ball", label: "볼 베어링" },
                                    { value: "roller", label: "롤러 베어링" }
                                ]
                            },
                            {
                                id: "criticalSpeed",
                                label: "위험 속도",
                                type: "number",
                                unit: "rpm",
                                placeholder: "0.0",
                                description: "터빈의 1차 위험 속도",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "coastdownTime",
                                label: "관성 운전 시간",
                                type: "number",
                                unit: "s",
                                placeholder: "0.0",
                                description: "증기 차단 후 완전 정지까지 시간",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0122",
                        label: "터빈 보호 시스템",
                        description: "터빈 보호를 위한 안전 기능을 설정합니다.",
                        fields: [
                            {
                                id: "overspeedTrip",
                                label: "과속도 트립",
                                type: "number",
                                unit: "rpm",
                                placeholder: "3960",
                                description: "과속도 보호 트립 설정값 (110% 정격)",
                                required: false,
                                default: 3960,
                                validation: {
                                    min: 1000
                                }
                            },
                            {
                                id: "vibrationTrip",
                                label: "진동 트립",
                                type: "number",
                                unit: "mm/s, mil",
                                placeholder: "10.0",
                                description: "진동 보호 트립 설정값",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "temperatureTrip",
                                label: "온도 트립",
                                type: "number",
                                unit: "K, °F",
                                placeholder: "0.0",
                                description: "베어링 온도 트립 설정값",
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
                        label: "터빈 초기 조건",
                        description: "터빈의 초기 운전 상태를 설정합니다.",
                        fields: [
                            {
                                id: "initialLoad",
                                label: "초기 부하",
                                type: "number",
                                unit: "%",
                                placeholder: "100.0",
                                description: "터빈의 초기 부하율 (0-100%)",
                                required: true,
                                default: 100.0,
                                validation: {
                                    min: 0,
                                    max: 110
                                }
                            },
                            {
                                id: "initialSpeed",
                                label: "초기 회전수",
                                type: "number",
                                unit: "rpm",
                                placeholder: "3600",
                                description: "터빈의 초기 회전수",
                                required: true,
                                default: 3600,
                                validation: {
                                    min: 0,
                                    max: 10000
                                }
                            },
                            {
                                id: "operatingState",
                                label: "초기 운전 상태",
                                type: "select",
                                description: "터빈의 초기 운전 상태",
                                required: true,
                                default: "online",
                                options: [
                                    { value: "offline", label: "정지 상태" },
                                    { value: "starting", label: "기동 중" },
                                    { value: "online", label: "정상 운전" },
                                    { value: "synchronizing", label: "동기화 중" },
                                    { value: "tripped", label: "트립 상태" }
                                ]
                            },
                            {
                                id: "governorPosition",
                                label: "거버너 위치",
                                type: "number",
                                unit: "%",
                                placeholder: "100.0",
                                description: "거버너 밸브의 초기 개도 (%)",
                                required: false,
                                default: 100.0,
                                validation: {
                                    min: 0,
                                    max: 100
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
            return !isNaN(numValue) && Number.isInteger(numValue) && numValue >= 1;
        },
        validatePositiveNonZero: function(value) {
            if (value === undefined || value === null || value === '') return false;
            const numValue = parseFloat(value);
            return !isNaN(numValue) && numValue > 0;
        },
        validateExhaustPressure: function(value, data) {
            if (value === undefined || value === null || value === '') return false;
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue <= 0) return false;
            
            // 배기 압력은 입구 압력보다 작아야 함
            if (data.inletPressure) {
                const inletP = parseFloat(data.inletPressure) * 1000; // MPa to kPa
                if (numValue >= inletP) {
                    return false;
                }
            }
            return true;
        }
    },
    calculators: {
        autoCalculateTheoreticalWork: function(data) {
            // 이론적 일량 계산 (단순화된 식)
            if (data.inletPressure && data.exhaustPressure && data.inletTemperature) {
                const P1 = parseFloat(data.inletPressure) * 1000; // MPa to kPa
                const P2 = parseFloat(data.exhaustPressure); // kPa
                const T1 = parseFloat(data.inletTemperature); // K
                
                // 이상 가스 근사: w = cp * T1 * (1 - (P2/P1)^(γ-1)/γ)
                const gamma = 1.3; // 증기의 비열비
                const cp = 2.0; // kJ/kg·K (증기의 정압비열)
                
                const pressureRatio = P2 / P1;
                const theoreticalWork = cp * T1 * (1 - Math.pow(pressureRatio, (gamma - 1) / gamma));
                
                return theoreticalWork; // kJ/kg
            }
            return 0;
        },
        autoCalculateActualPower: function(data) {
            // 실제 출력 계산
            if (data.ratedSteamFlow && data.thermalEfficiency) {
                const theoreticalWork = this.autoCalculateTheoreticalWork(data);
                const steamFlow = parseFloat(data.ratedSteamFlow); // kg/s
                const efficiency = parseFloat(data.thermalEfficiency);
                
                const actualPower = (theoreticalWork * steamFlow * efficiency) / 1000; // MW
                return actualPower;
            }
            return 0;
        },
        calculateSpecificSteamConsumption: function(data) {
            // 비증기 소비율 계산 (kg/kWh)
            if (data.ratedSteamFlow && data.ratedPower) {
                const steamFlow = parseFloat(data.ratedSteamFlow); // kg/s
                const power = parseFloat(data.ratedPower) * 1000; // MW to kW
                
                return (steamFlow * 3600) / power; // kg/kWh
            }
            return 0;
        }
    }
};

export default TURBINE;