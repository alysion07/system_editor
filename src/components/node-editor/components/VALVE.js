const VALVE = {
    type: 'VALVE',
    label: 'Control Valve',
    icon: '⚙️',
    description: '제어 밸브는 유체의 흐름과 압력을 제어하는 핵심 구성 요소입니다.',
    category: 'hydro',
    ports: {
        inputs: [{ id: 'inlet', label: 'Inlet' }],
        outputs: [{ id: 'outlet', label: 'Outlet' }]
    },
    properties: {
        tabs: [
            {
                id: "basic",
                label: "기본 데이터",
                cards: [
                    {
                        id: "CCC0101",
                        label: "밸브 기하학 데이터",
                        description: "밸브의 기하학적 특성과 크기를 정의합니다.",
                        fields: [
                            {
                                id: "valveType",
                                label: "밸브 타입",
                                type: "select",
                                description: "밸브의 종류와 구조",
                                required: true,
                                default: "globe",
                                options: [
                                    { value: "globe", label: "글로브 밸브 (Globe)" },
                                    { value: "gate", label: "게이트 밸브 (Gate)" },
                                    { value: "ball", label: "볼 밸브 (Ball)" },
                                    { value: "butterfly", label: "버터플라이 밸브 (Butterfly)" },
                                    { value: "needle", label: "니들 밸브 (Needle)" },
                                    { value: "check", label: "체크 밸브 (Check)" }
                                ]
                            },
                            {
                                id: "nominalDiameter",
                                label: "공칭 직경",
                                type: "number",
                                unit: "mm, inch",
                                placeholder: "0.0",
                                description: "밸브의 공칭 직경",
                                required: true,
                                validation: {
                                    min: 1,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "seatDiameter",
                                label: "시트 직경",
                                type: "number",
                                unit: "mm, inch",
                                placeholder: "0.0",
                                description: "밸브 시트의 실제 직경",
                                required: true,
                                validation: {
                                    min: 1,
                                    custom: "validateSeatDiameter"
                                }
                            },
                            {
                                id: "flowArea",
                                label: "유효 유동 면적",
                                type: "number",
                                unit: "m², ft²",
                                placeholder: "0.0",
                                description: "완전 개방 시 유효 유동 면적 (자동 계산 가능)",
                                required: false,
                                validation: {
                                    min: 0,
                                    custom: "validateFlowArea"
                                }
                            },
                            {
                                id: "strokeLength",
                                label: "스트로크 길이",
                                type: "number",
                                unit: "mm, inch",
                                placeholder: "0.0",
                                description: "완전 개방까지의 스트로크 거리",
                                required: true,
                                validation: {
                                    min: 0.1,
                                    custom: "validatePositiveNonZero"
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0102",
                        label: "유동 특성",
                        description: "밸브의 유동 특성과 손실 계수를 설정합니다.",
                        fields: [
                            {
                                id: "flowCharacteristic",
                                label: "유량 특성",
                                type: "select",
                                description: "밸브 개도에 따른 유량 특성 곡선",
                                required: true,
                                default: "linear",
                                options: [
                                    { value: "linear", label: "선형 특성 (Linear)" },
                                    { value: "equal", label: "등백분비 특성 (Equal Percentage)" },
                                    { value: "quick", label: "퀵 오픈 (Quick Opening)" },
                                    { value: "custom", label: "사용자 정의" }
                                ]
                            },
                            {
                                id: "cvValue",
                                label: "Cv 값",
                                type: "number",
                                placeholder: "0.0",
                                description: "완전 개방 시 유량 계수 (Cv)",
                                helpText: "1 psi 압력강하로 물 1 GPM이 흐를 때의 개도",
                                required: true,
                                validation: {
                                    min: 0.001,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "minCvRatio",
                                label: "최소 Cv 비율",
                                type: "number",
                                placeholder: "0.05",
                                description: "최소 개도에서의 Cv 비율 (0.0 ~ 1.0)",
                                required: false,
                                default: 0.05,
                                validation: {
                                    min: 0.001,
                                    max: 1.0
                                }
                            },
                            {
                                id: "pressureRecovery",
                                label: "압력 회복 계수",
                                type: "number",
                                placeholder: "0.9",
                                description: "밸브 하류 압력 회복 계수 (FL)",
                                required: false,
                                default: 0.9,
                                validation: {
                                    min: 0.1,
                                    max: 1.0
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0103",
                        label: "제어 시스템",
                        description: "밸브 제어 시스템과 액추에이터 특성을 설정합니다.",
                        fields: [
                            {
                                id: "actuatorType",
                                label: "액추에이터 타입",
                                type: "select",
                                description: "밸브 구동 액추에이터의 종류",
                                required: true,
                                default: "pneumatic",
                                options: [
                                    { value: "manual", label: "수동 조작" },
                                    { value: "pneumatic", label: "공압 액추에이터" },
                                    { value: "electric", label: "전동 액추에이터" },
                                    { value: "hydraulic", label: "유압 액추에이터" },
                                    { value: "solenoid", label: "솔레노이드 밸브" }
                                ]
                            },
                            {
                                id: "actionType",
                                label: "동작 타입",
                                type: "select",
                                description: "공급원 차단 시 밸브 동작",
                                required: true,
                                default: "fail_close",
                                options: [
                                    { value: "fail_close", label: "Fail-to-Close" },
                                    { value: "fail_open", label: "Fail-to-Open" },
                                    { value: "fail_last", label: "Fail-in-Last-Position" }
                                ]
                            },
                            {
                                id: "responseTime",
                                label: "응답 시간",
                                type: "number",
                                unit: "s",
                                placeholder: "1.0",
                                description: "0%에서 100% 또는 100%에서 0%까지의 응답 시간",
                                required: false,
                                default: 1.0,
                                validation: {
                                    min: 0.1,
                                    max: 600
                                }
                            },
                            {
                                id: "controlSignal",
                                label: "제어 신호",
                                type: "select",
                                description: "밸브 제어 입력 신호 타입",
                                required: true,
                                default: "4-20ma",
                                options: [
                                    { value: "4-20ma", label: "4-20 mA" },
                                    { value: "0-10v", label: "0-10 V" },
                                    { value: "digital", label: "디지털 제어" },
                                    { value: "trip", label: "트립 신호" }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: "performance",
                label: "성능 특성",
                cards: [
                    {
                        id: "CCC0111",
                        label: "유동 계수",
                        description: "밸브의 유동 성능과 손실 특성을 정의합니다.",
                        fields: [
                            {
                                id: "forwardFlowCoeff",
                                label: "순방향 유동 계수",
                                type: "number",
                                placeholder: "1.0",
                                description: "순방향 유동 시 손실 계수",
                                required: true,
                                default: 1.0,
                                validation: {
                                    min: 0.1
                                }
                            },
                            {
                                id: "reverseFlowCoeff",
                                label: "역방향 유동 계수",
                                type: "number",
                                placeholder: "1.0",
                                description: "역방향 유동 시 손실 계수",
                                required: true,
                                default: 1.0,
                                validation: {
                                    min: 0.1
                                }
                            },
                            {
                                id: "cavitationIndex",
                                label: "캐비테이션 지수",
                                type: "number",
                                placeholder: "0.8",
                                description: "캐비테이션 시작 압력 비율",
                                required: false,
                                default: 0.8,
                                validation: {
                                    min: 0.1,
                                    max: 1.0
                                }
                            },
                            {
                                id: "chokedFlowCoeff",
                                label: "초킹 유동 계수",
                                type: "number",
                                placeholder: "0.85",
                                description: "초킹 유동 발생 시 유량 계수",
                                required: false,
                                default: 0.85,
                                validation: {
                                    min: 0.5,
                                    max: 1.0
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0112",
                        label: "밸브 성능 곡선",
                        description: "밸브 개도에 따른 성능 특성을 정의합니다.",
                        fields: [
                            {
                                id: "cvTable",
                                label: "Cv 테이블",
                                type: "textarea",
                                placeholder: "0.0, 0.0\n25.0, 0.05\n50.0, 0.25\n75.0, 0.65\n100.0, 1.0",
                                description: "개도(%)와 Cv 비율 쌍의 테이블 데이터",
                                helpText: "형식: 개도(%), Cv비율 (줄바꿈으로 구분)",
                                conditionalDisplay: {
                                    field: "flowCharacteristic",
                                    value: "custom"
                                },
                                required: false,
                                validation: {
                                    custom: "validateCvTable"
                                }
                            },
                            {
                                id: "hysteresis",
                                label: "히스테리시스",
                                type: "number",
                                unit: "%",
                                placeholder: "0.5",
                                description: "밸브 개도의 히스테리시스 (%)",
                                required: false,
                                default: 0.5,
                                validation: {
                                    min: 0,
                                    max: 10
                                }
                            },
                            {
                                id: "deadband",
                                label: "데드밴드",
                                type: "number",
                                unit: "%",
                                placeholder: "0.2",
                                description: "제어 신호의 데드밴드 (%)",
                                required: false,
                                default: 0.2,
                                validation: {
                                    min: 0,
                                    max: 5
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: "safety",
                label: "안전 기능",
                cards: [
                    {
                        id: "CCC0121",
                        label: "안전 인터록",
                        description: "밸브 안전 기능과 인터록을 설정합니다.",
                        fields: [
                            {
                                id: "safetyTrip",
                                label: "안전 트립 번호",
                                type: "number",
                                placeholder: "0",
                                description: "안전 트립 번호 (0 = 트립 없음)",
                                required: false,
                                default: 0,
                                validation: {
                                    min: 0,
                                    max: 9999
                                }
                            },
                            {
                                id: "isolationTrip",
                                label: "격리 트립 번호",
                                type: "number",
                                placeholder: "0",
                                description: "격리 트립 번호 (0 = 트립 없음)",
                                required: false,
                                default: 0,
                                validation: {
                                    min: 0,
                                    max: 9999
                                }
                            },
                            {
                                id: "maxDifferentialPressure",
                                label: "최대 차압",
                                type: "number",
                                unit: "Pa, psi",
                                placeholder: "0.0",
                                description: "밸브의 최대 허용 차압",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "temperatureLimit",
                                label: "온도 제한",
                                type: "number",
                                unit: "K, °F",
                                placeholder: "0.0",
                                description: "밸브의 최대 허용 온도",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0122",
                        label: "밸브 보호 기능",
                        description: "밸브 보호를 위한 기능들을 설정합니다.",
                        fields: [
                            {
                                id: "positionFeedback",
                                label: "위치 피드백",
                                type: "boolean",
                                description: "밸브 위치 피드백 신호 사용 여부",
                                required: false,
                                default: true
                            },
                            {
                                id: "overtravelProtection",
                                label: "과행정 보호",
                                type: "boolean",
                                description: "과행정 보호 기능 사용 여부",
                                required: false,
                                default: true
                            },
                            {
                                id: "stallProtection",
                                label: "정체 보호",
                                type: "boolean",
                                description: "액추에이터 정체 보호 기능",
                                required: false,
                                default: false
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
                        label: "밸브 초기 조건",
                        description: "밸브의 초기 상태와 위치를 설정합니다.",
                        fields: [
                            {
                                id: "initialPosition",
                                label: "초기 개도",
                                type: "number",
                                unit: "%",
                                placeholder: "0.0",
                                description: "밸브의 초기 개도 (0-100%)",
                                required: true,
                                default: 0.0,
                                validation: {
                                    min: 0,
                                    max: 100
                                }
                            },
                            {
                                id: "initialState",
                                label: "초기 상태",
                                type: "select",
                                description: "밸브의 초기 운전 상태",
                                required: true,
                                default: "normal",
                                options: [
                                    { value: "closed", label: "완전 차단" },
                                    { value: "open", label: "완전 개방" },
                                    { value: "normal", label: "정상 제어" },
                                    { value: "maintenance", label: "정비 모드" }
                                ]
                            },
                            {
                                id: "initialControlSignal",
                                label: "초기 제어 신호",
                                type: "number",
                                unit: "mA, V, %",
                                placeholder: "4.0",
                                description: "초기 제어 입력 신호 값",
                                required: false,
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
        validatePositiveNonZero: function(value) {
            if (value === undefined || value === null || value === '') return false;
            const numValue = parseFloat(value);
            return !isNaN(numValue) && numValue > 0;
        },
        validateSeatDiameter: function(value, data) {
            if (value === undefined || value === null || value === '') return false;
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue <= 0) return false;
            
            // 시트 직경은 공칭 직경보다 작거나 같아야 함
            if (data.nominalDiameter && numValue > parseFloat(data.nominalDiameter)) {
                return false;
            }
            return true;
        },
        validateFlowArea: function(area, data) {
            if (!area || area === 0) return true; // 자동 계산되는 경우
            if (!data.seatDiameter) return true;
            
            const seatD = parseFloat(data.seatDiameter) / 1000; // mm to m
            const calculatedArea = Math.PI * (seatD / 2) * (seatD / 2);
            const tolerance = 0.1;
            
            // 유효 면적은 시트 면적보다 작아야 함
            return area <= calculatedArea * (1 + tolerance);
        },
        validateCvTable: function(value) {
            if (!value) return true;
            
            const lines = value.trim().split('\n');
            for (const line of lines) {
                const parts = line.trim().split(',');
                if (parts.length !== 2) return false;
                
                const position = parseFloat(parts[0].trim());
                const cvRatio = parseFloat(parts[1].trim());
                
                if (isNaN(position) || isNaN(cvRatio)) return false;
                if (position < 0 || position > 100) return false;
                if (cvRatio < 0 || cvRatio > 1) return false;
            }
            return true;
        }
    },
    calculators: {
        autoCalculateFlowArea: function(data) {
            if ((!data.flowArea || data.flowArea === 0) && data.seatDiameter) {
                const diameter = parseFloat(data.seatDiameter) / 1000; // mm to m
                return Math.PI * (diameter / 2) * (diameter / 2);
            }
            return data.flowArea;
        },
        calculateCvFromArea: function(data) {
            // Cv = 29.84 * A (A in square inches)
            // Cv = 1156 * A (A in square meters)
            if (data.flowArea) {
                return 1156 * data.flowArea; // m² to Cv
            }
            return 0;
        },
        calculateFlowRate: function(data, deltaP) {
            // Q = Cv * sqrt(deltaP / SG) (where SG = 1 for water)
            if (data.cvValue && deltaP) {
                return data.cvValue * Math.sqrt(deltaP); // GPM
            }
            return 0;
        }
    }
};

export default VALVE;