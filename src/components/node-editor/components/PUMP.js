const PUMP = {
    type: 'PUMP',
    label: 'Centrifugal Pump',
    icon: '🔄',
    description: '원심 펌프는 유체에 운동 에너지를 전달하여 압력을 증가시키는 회전 기계입니다.',
    category: 'hydro',
    ports: {
        inputs: [{ id: 'suction', label: 'Suction' }],
        outputs: [{ id: 'discharge', label: 'Discharge' }]
    },
    properties: {
        tabs: [
            {
                id: "basic",
                label: "기본 데이터",
                cards: [
                    {
                        id: "CCC0101",
                        label: "펌프 기하학 데이터",
                        description: "펌프의 기하학적 특성을 정의합니다.",
                        fields: [
                            {
                                id: "suctionArea",
                                label: "흡입 면적",
                                type: "number",
                                unit: "m², ft²",
                                placeholder: "0.0",
                                description: "펌프 흡입구의 유효 면적",
                                required: true,
                                validation: {
                                    min: 0.000001,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "dischargeArea",
                                label: "토출 면적",
                                type: "number",
                                unit: "m², ft²",
                                placeholder: "0.0",
                                description: "펌프 토출구의 유효 면적",
                                required: true,
                                validation: {
                                    min: 0.000001,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "impellerDiameter",
                                label: "임펠러 직경",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "펌프 임펠러의 직경",
                                required: true,
                                validation: {
                                    min: 0.000001,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "volute",
                                label: "볼류트 체적",
                                type: "number",
                                unit: "m³, ft³",
                                placeholder: "0.0",
                                description: "펌프 볼류트의 내부 체적",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "elevationChange",
                                label: "고도 변화",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "흡입구에서 토출구까지의 고도 변화",
                                required: false,
                                default: 0.0
                            }
                        ]
                    },
                    {
                        id: "CCC0102",
                        label: "펌프 운전 특성",
                        description: "펌프의 수력학적 운전 특성을 설정합니다.",
                        fields: [
                            {
                                id: "ratedSpeed",
                                label: "정격 회전수",
                                type: "number",
                                unit: "rpm",
                                placeholder: "0.0",
                                description: "펌프의 정격 운전 회전수",
                                required: true,
                                validation: {
                                    min: 1,
                                    max: 10000
                                }
                            },
                            {
                                id: "ratedHead",
                                label: "정격 양정",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "정격 운전 시 펌프 양정",
                                required: true,
                                validation: {
                                    min: 0.1,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "ratedFlow",
                                label: "정격 유량",
                                type: "number",
                                unit: "m³/s, ft³/s",
                                placeholder: "0.0",
                                description: "정격 운전 시 펌프 유량",
                                required: true,
                                validation: {
                                    min: 0.000001,
                                    custom: "validatePositiveNonZero"
                                }
                            },
                            {
                                id: "efficiency",
                                label: "펌프 효율",
                                type: "number",
                                placeholder: "0.8",
                                description: "펌프의 수력학적 효율 (0.0 ~ 1.0)",
                                required: true,
                                default: 0.8,
                                validation: {
                                    min: 0.1,
                                    max: 1.0
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0103",
                        label: "펌프 제어 시스템",
                        description: "펌프 제어 시스템과 관련된 설정을 정의합니다.",
                        fields: [
                            {
                                id: "controlType",
                                label: "제어 방식",
                                type: "select",
                                description: "펌프 운전 제어 방식",
                                required: true,
                                default: "0",
                                options: [
                                    { value: "0", label: "일정 속도 운전" },
                                    { value: "1", label: "변속 제어" },
                                    { value: "2", label: "토크 제어" },
                                    { value: "3", label: "외부 신호 제어" }
                                ]
                            },
                            {
                                id: "tripNumber",
                                label: "트립 번호",
                                type: "number",
                                placeholder: "0",
                                description: "펌프 정지 트립 번호 (0 = 트립 없음)",
                                required: false,
                                default: 0,
                                validation: {
                                    min: 0,
                                    max: 9999
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
                id: "performance",
                label: "성능 특성",
                cards: [
                    {
                        id: "CCC0111",
                        label: "펌프 특성 곡선",
                        description: "펌프의 수력학적 특성 곡선을 정의합니다.",
                        fields: [
                            {
                                id: "curveType",
                                label: "특성 곡선 유형",
                                type: "select",
                                description: "펌프 특성 곡선 정의 방법",
                                required: true,
                                default: "0",
                                options: [
                                    { value: "0", label: "단순 2차 곡선" },
                                    { value: "1", label: "다항식 곡선" },
                                    { value: "2", label: "테이블 데이터" },
                                    { value: "3", label: "제조사 곡선" }
                                ]
                            },
                            {
                                id: "headCoeff_a",
                                label: "양정 계수 a",
                                type: "number",
                                placeholder: "1.0",
                                description: "H = a - b*Q² 에서 a 계수",
                                conditionalDisplay: {
                                    field: "curveType",
                                    value: "0"
                                },
                                required: true,
                                default: 1.0
                            },
                            {
                                id: "headCoeff_b",
                                label: "양정 계수 b",
                                type: "number",
                                placeholder: "0.1",
                                description: "H = a - b*Q² 에서 b 계수",
                                conditionalDisplay: {
                                    field: "curveType",
                                    value: "0"
                                },
                                required: true,
                                default: 0.1
                            },
                            {
                                id: "torqueCoeff_c",
                                label: "토크 계수 c",
                                type: "number",
                                placeholder: "0.5",
                                description: "T = c + d*Q 에서 c 계수",
                                required: false,
                                default: 0.5
                            },
                            {
                                id: "torqueCoeff_d",
                                label: "토크 계수 d",
                                type: "number",
                                placeholder: "0.1",
                                description: "T = c + d*Q 에서 d 계수",
                                required: false,
                                default: 0.1
                            }
                        ]
                    },
                    {
                        id: "CCC0112",
                        label: "캐비테이션 특성",
                        description: "펌프 캐비테이션 관련 특성을 설정합니다.",
                        fields: [
                            {
                                id: "npshRequired",
                                label: "필요 NPSH",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "펌프 운전에 필요한 순 양의 흡입 헤드",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "cavitationModel",
                                label: "캐비테이션 모델",
                                type: "select",
                                description: "캐비테이션 발생 시 모델",
                                required: false,
                                default: "0",
                                options: [
                                    { value: "0", label: "캐비테이션 없음" },
                                    { value: "1", label: "단순 성능 저하" },
                                    { value: "2", label: "상세 캐비테이션 모델" }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: "motor",
                label: "구동 모터",
                cards: [
                    {
                        id: "CCC0121",
                        label: "모터 특성",
                        description: "펌프 구동 모터의 특성을 설정합니다.",
                        fields: [
                            {
                                id: "motorPower",
                                label: "모터 정격 출력",
                                type: "number",
                                unit: "kW, hp",
                                placeholder: "0.0",
                                description: "펌프 구동 모터의 정격 출력",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "motorEfficiency",
                                label: "모터 효율",
                                type: "number",
                                placeholder: "0.95",
                                description: "모터의 전기적 효율 (0.0 ~ 1.0)",
                                required: false,
                                default: 0.95,
                                validation: {
                                    min: 0.5,
                                    max: 1.0
                                }
                            },
                            {
                                id: "inertia",
                                label: "회전 관성",
                                type: "number",
                                unit: "kg·m²",
                                placeholder: "0.0",
                                description: "펌프-모터 시스템의 회전 관성",
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
                                description: "전원 차단 후 완전 정지까지 시간",
                                helpText: "관성에 의한 자유 감속 시간",
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
                        label: "펌프 초기 조건",
                        description: "펌프의 초기 운전 조건을 설정합니다.",
                        fields: [
                            {
                                id: "initialSpeed",
                                label: "초기 회전수",
                                type: "number",
                                unit: "rpm",
                                placeholder: "0.0",
                                description: "펌프의 초기 운전 회전수",
                                required: true,
                                validation: {
                                    min: 0,
                                    max: 10000
                                }
                            },
                            {
                                id: "initialFlow",
                                label: "초기 유량",
                                type: "number",
                                unit: "m³/s, ft³/s",
                                placeholder: "0.0",
                                description: "펌프의 초기 유량",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "operatingState",
                                label: "초기 운전 상태",
                                type: "select",
                                description: "펌프의 초기 운전 상태",
                                required: true,
                                default: "1",
                                options: [
                                    { value: "0", label: "정지 상태" },
                                    { value: "1", label: "정상 운전" },
                                    { value: "2", label: "기동 중" },
                                    { value: "3", label: "정지 중" }
                                ]
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
        validateControlFlags: function(value) {
            if (!value) return true;
            return /^[01]{7}$/.test(value);
        }
    },
    calculators: {
        autoCalculateSpecificSpeed: function(data) {
            // 비속도 자동 계산: Ns = N * sqrt(Q) / H^(3/4)
            if (data.ratedSpeed && data.ratedFlow && data.ratedHead) {
                const N = parseFloat(data.ratedSpeed);
                const Q = parseFloat(data.ratedFlow);
                const H = parseFloat(data.ratedHead);
                return N * Math.sqrt(Q) / Math.pow(H, 0.75);
            }
            return 0;
        },
        autoCalculatePumpPower: function(data) {
            // 펌프 소요 동력 자동 계산: P = ρ * g * Q * H / η
            if (data.ratedFlow && data.ratedHead && data.efficiency) {
                const rho = 1000; // kg/m³ (물의 밀도)
                const g = 9.81; // m/s²
                const Q = parseFloat(data.ratedFlow);
                const H = parseFloat(data.ratedHead);
                const eta = parseFloat(data.efficiency);
                return (rho * g * Q * H / eta) / 1000; // kW로 변환
            }
            return 0;
        }
    }
};

export default PUMP;