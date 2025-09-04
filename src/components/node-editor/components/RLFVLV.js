const RLFVLV = {
    type: 'RLFVLV',
    label: 'RELIEF VALVE',
    icon: 'RLFVLV',
    description: '릴리프 밸브는 설정 압력을 초과할 때 자동으로 개방되는 안전 밸브 컴포넌트입니다.',
    category: 'hydro',
    ports: {
        inputs: [
            { 
                id: 'inlet', 
                label: 'Inlet (Face 1)', 
                position: 'left', 
                marsCode: 1, 
                connectionType: 'fluid',
                description: '밸브 입구 (강제 입구)'
            }
        ],
        outputs: [
            { 
                id: 'outlet', 
                label: 'Outlet (Face 2)', 
                position: 'right', 
                marsCode: 2, 
                connectionType: 'fluid',
                description: '밸브 출구 (강제 출구)'
            }
        ]
    },
    properties: {
        tabs: [
            {
                id: "basic",
                label: "기본 데이터",
                cards: [
                    {
                        id: "CCC0351",
                        label: "릴리프 밸브 정보",
                        description: "릴리프 밸브의 기본 정보를 정의합니다.",
                        fields: [
                            {
                                id: "fromConnection",
                                label: "From 연결",
                                type: "text",
                                placeholder: "cccnnnn",
                                description: "밸브 입구 연결 (컴포넌트 번호 + 면 번호)",
                                required: true,
                                validation: {
                                    pattern: "^[0-9]{7}$",
                                    message: "7자리 숫자 형식이어야 합니다 (cccnnnn)"
                                }
                            },
                            {
                                id: "toConnection",
                                label: "To 연결",
                                type: "text",
                                placeholder: "cccnnnn",
                                description: "밸브 출구 연결 (컴포넌트 번호 + 면 번호)",
                                required: true,
                                validation: {
                                    pattern: "^[0-9]{7}$",
                                    message: "7자리 숫자 형식이어야 합니다 (cccnnnn)"
                                }
                            },
                            {
                                id: "area",
                                label: "밸브 면적 (A)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "m², ft²",
                                description: "밸브의 유동 단면적",
                                required: true,
                                validation: {
                                    min: 0,
                                    exclusiveMin: true
                                }
                            },
                            {
                                id: "forwardLossCoeff",
                                label: "순방향 손실 계수 (K_fwd)",
                                type: "number",
                                placeholder: "0.0",
                                description: "순방향 유동 시 손실 계수",
                                default: 0.0,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "reverseLossCoeff",
                                label: "역방향 손실 계수 (K_rev)",
                                type: "number",
                                placeholder: "1.0E+08",
                                description: "역방향 유동 시 손실 계수 (큰 값으로 역류 방지)",
                                default: 1.0E+08,
                                validation: {
                                    min: 0
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: "pressure",
                label: "압력 설정",
                cards: [
                    {
                        id: "CCC0352",
                        label: "릴리프 밸브 압력 설정",
                        description: "릴리프 밸브의 작동 압력 조건을 정의합니다.",
                        fields: [
                            {
                                id: "junctionFlags",
                                label: "접합부 제어 플래그",
                                type: "flags",
                                description: "형식: vcahs",
                                subfields: [
                                    {
                                        id: "vFlag",
                                        label: "밸브 모델 옵션 (v)",
                                        type: "select",
                                        options: [
                                            { value: "0", label: "차압에 기반한 밸브" },
                                            { value: "1", label: "시간에 기반한 밸브" }
                                        ],
                                        description: "밸브 작동 모델 선택",
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
                                            { value: "1", label: "완전 급격 면적 변화" }
                                        ],
                                        description: "면적 변화 모델링 방식",
                                        default: "0"
                                    },
                                    {
                                        id: "hFlag",
                                        label: "동질/비동질 옵션 (h)",
                                        type: "select",
                                        options: [
                                            { value: "0", label: "비동질" },
                                            { value: "1", label: "동질" }
                                        ],
                                        description: "유체 혼합물의 동질성 가정",
                                        default: "0"
                                    },
                                    {
                                        id: "sFlag",
                                        label: "운동량 플럭스 옵션 (s)",
                                        type: "select",
                                        options: [
                                            { value: "0", label: "양쪽 체적 사용" },
                                            { value: "1", label: "시작 체적만 사용" },
                                            { value: "2", label: "종료 체적만 사용" },
                                            { value: "3", label: "사용 안함" }
                                        ],
                                        description: "운동량 플럭스 적용 방식",
                                        default: "0"
                                    }
                                ]
                            },
                            {
                                id: "setPoint",
                                label: "설정 압력 (P_set)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "Pa, psi",
                                description: "릴리프 밸브가 개방되는 설정 압력",
                                required: true,
                                validation: {
                                    min: 0,
                                    exclusiveMin: true
                                }
                            },
                            {
                                id: "hysteresisDP",
                                label: "히스테리시스 차압 (ΔP_hys)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "Pa, psi",
                                description: "밸브 개폐 시 히스테리시스 차압",
                                default: 0.0,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "blowdownRatio",
                                label: "블로우다운 비율 (r_bd)",
                                type: "number",
                                placeholder: "0.1",
                                description: "재폐쇄 압력 비율 (P_close = P_set × (1 - r_bd))",
                                default: 0.1,
                                validation: {
                                    min: 0,
                                    max: 1
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: "dynamics",
                label: "동역학 설정",
                cards: [
                    {
                        id: "CCC0353",
                        label: "릴리프 밸브 동역학",
                        description: "릴리프 밸브의 스프링-디스크 동역학을 정의합니다.",
                        fields: [
                            {
                                id: "discMass",
                                label: "디스크 질량 (m)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "kg, lb",
                                description: "릴리프 밸브 디스크의 질량",
                                required: true,
                                validation: {
                                    min: 0,
                                    exclusiveMin: true
                                }
                            },
                            {
                                id: "springConstant",
                                label: "스프링 상수 (k)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "N/m, lbf/ft",
                                description: "스프링의 탄성 상수",
                                required: true,
                                validation: {
                                    min: 0,
                                    exclusiveMin: true
                                }
                            },
                            {
                                id: "preload",
                                label: "스프링 예압 (F_pre)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "N, lbf",
                                description: "스프링의 초기 예압력",
                                required: true,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "dampingCoeff",
                                label: "감쇠 계수 (c)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "N⋅s/m, lbf⋅s/ft",
                                description: "디스크 운동의 감쇠 계수",
                                default: 0.0,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "discArea",
                                label: "디스크 면적 (A_disc)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "m², ft²",
                                description: "압력을 받는 디스크의 유효 면적",
                                required: true,
                                validation: {
                                    min: 0,
                                    exclusiveMin: true
                                }
                            },
                            {
                                id: "maxLift",
                                label: "최대 리프트 (L_max)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "m, ft",
                                description: "디스크의 최대 리프트 거리",
                                required: true,
                                validation: {
                                    min: 0,
                                    exclusiveMin: true
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: "bellows",
                label: "벨로우즈 설정",
                cards: [
                    {
                        id: "CCC0354",
                        label: "벨로우즈 매개변수 (선택사항)",
                        description: "백압 보상용 벨로우즈 매개변수를 정의합니다.",
                        fields: [
                            {
                                id: "useBellows",
                                label: "벨로우즈 사용",
                                type: "select",
                                options: [
                                    { value: "0", label: "벨로우즈 없음" },
                                    { value: "1", label: "벨로우즈 사용" }
                                ],
                                description: "백압 보상용 벨로우즈 사용 여부",
                                default: "0"
                            },
                            {
                                id: "bellowsArea",
                                label: "벨로우즈 면적 (A_bel)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "m², ft²",
                                description: "벨로우즈의 유효 면적",
                                conditionalDisplay: {
                                    field: "useBellows",
                                    value: "1"
                                },
                                validation: {
                                    min: 0,
                                    exclusiveMin: true
                                }
                            },
                            {
                                id: "bellowsSpring",
                                label: "벨로우즈 스프링 상수 (k_bel)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "N/m, lbf/ft",
                                description: "벨로우즈 자체의 스프링 상수",
                                conditionalDisplay: {
                                    field: "useBellows",
                                    value: "1"
                                },
                                default: 0.0,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "bellowsPreload",
                                label: "벨로우즈 예압 (F_bel)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "N, lbf",
                                description: "벨로우즈의 초기 예압력",
                                conditionalDisplay: {
                                    field: "useBellows",
                                    value: "1"
                                },
                                default: 0.0,
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
                        id: "CCC0355",
                        label: "릴리프 밸브 초기 조건",
                        description: "릴리프 밸브의 초기 유동 상태를 정의합니다.",
                        fields: [
                            {
                                id: "initialVelocityLiquid",
                                label: "초기 액체 속도",
                                type: "number",
                                placeholder: "0.0",
                                unit: "m/s, ft/s",
                                description: "초기 액체 속도",
                                default: 0.0
                            },
                            {
                                id: "initialVelocityVapor",
                                label: "초기 증기 속도",
                                type: "number",
                                placeholder: "0.0",
                                unit: "m/s, ft/s",
                                description: "초기 증기 속도",
                                default: 0.0
                            },
                            {
                                id: "initialDiscPosition",
                                label: "초기 디스크 위치",
                                type: "number",
                                placeholder: "0.0",
                                unit: "m, ft",
                                description: "초기 디스크 리프트 위치",
                                default: 0.0,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "initialDiscVelocity",
                                label: "초기 디스크 속도",
                                type: "number",
                                placeholder: "0.0",
                                unit: "m/s, ft/s",
                                description: "초기 디스크 속도",
                                default: 0.0
                            }
                        ]
                    }
                ]
            }
        ]
    },
    formatters: {
        generateHeader: function(component) {
            return `* RELIEF VALVE 컴포넌트 입력\n*\n${component.number}0000  ${component.name}  VALVE\n`;
        },
        formatCard0351: function(data) {
            return `${data.componentNumber}0351  ${data.fromConnection}  ${data.toConnection}  ${data.area}  ${data.forwardLossCoeff}  ${data.reverseLossCoeff}  ${this.generateJunctionFlags(data.junctionFlags)}\n`;
        },
        formatCard0352: function(data) {
            return `${data.componentNumber}0352  ${data.setPoint}  ${data.hysteresisDP || 0.0}  ${data.blowdownRatio || 0.1}\n`;
        },
        formatCard0353: function(data) {
            return `${data.componentNumber}0353  ${data.discMass}  ${data.springConstant}  ${data.preload}  ${data.dampingCoeff || 0.0}  ${data.discArea}  ${data.maxLift}\n`;
        },
        formatCard0354: function(data) {
            if (!data.useBellows || data.useBellows === "0") return "";
            return `${data.componentNumber}0354  ${data.bellowsArea}  ${data.bellowsSpring || 0.0}  ${data.bellowsPreload || 0.0}\n`;
        },
        formatCard0355: function(data) {
            return `${data.componentNumber}0355  ${data.initialVelocityLiquid || 0.0}  ${data.initialVelocityVapor || 0.0}  ${data.initialDiscPosition || 0.0}  ${data.initialDiscVelocity || 0.0}\n`;
        },
        generateJunctionFlags: function(flags) {
            if (!flags) return "00000";
            return `${flags.vFlag || '0'}${flags.cFlag || '0'}${flags.aFlag || '0'}${flags.hFlag || '0'}${flags.sFlag || '0'}`;
        }
    },
    validators: {
        validateConnections: function(fromConnection, toConnection) {
            return fromConnection !== toConnection;
        },
        validatePressureSettings: function(setPoint, hysteresisDP, blowdownRatio) {
            const closePoint = setPoint * (1 - blowdownRatio);
            return setPoint > 0 && hysteresisDP >= 0 && closePoint > hysteresisDP;
        },
        validateSpringSystem: function(data) {
            // 스프링 예압이 설정 압력과 일치하는지 확인
            const requiredForce = data.setPoint * data.discArea;
            const springForce = data.preload;
            const tolerance = 0.05; // 5% 허용 오차
            
            return Math.abs(springForce - requiredForce) / requiredForce <= tolerance;
        },
        validateDiscGeometry: function(discArea, maxLift) {
            return discArea > 0 && maxLift > 0;
        },
        validateBellows: function(data) {
            if (!data.useBellows || data.useBellows === "0") return true;
            return data.bellowsArea > 0;
        }
    }
};

export default RLFVLV;