const INRVLV = {
    type: 'INRVLV',
    label: 'INERTIAL VALVE',
    icon: 'INRVLV',
    description: '관성 밸브는 플래퍼의 관성력에 의해 작동되는 밸브 컴포넌트입니다.',
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
                        id: "CCC0321",
                        label: "관성 밸브 정보",
                        description: "관성 밸브의 기본 정보를 정의합니다.",
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
                                placeholder: "0.0",
                                description: "역방향 유동 시 손실 계수",
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
                id: "dynamics",
                label: "동역학 설정",
                cards: [
                    {
                        id: "CCC0322",
                        label: "플래퍼 동역학",
                        description: "관성 밸브 플래퍼의 동역학적 특성을 정의합니다.",
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
                                id: "flapperMoment",
                                label: "플래퍼 관성 모멘트 (I)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "kg⋅m², lb⋅ft²",
                                description: "플래퍼의 관성 모멘트",
                                required: true,
                                validation: {
                                    min: 0,
                                    exclusiveMin: true
                                }
                            },
                            {
                                id: "flapperWeight",
                                label: "플래퍼 무게 (W)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "N, lbf",
                                description: "플래퍼의 무게",
                                required: true,
                                validation: {
                                    min: 0,
                                    exclusiveMin: true
                                }
                            },
                            {
                                id: "centroidDistance",
                                label: "무게중심 거리 (L_cg)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "m, ft",
                                description: "회전축에서 무게중심까지의 거리",
                                required: true,
                                validation: {
                                    min: 0,
                                    exclusiveMin: true
                                }
                            },
                            {
                                id: "dampingCoeff",
                                label: "감쇠 계수 (C_d)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "N⋅m⋅s, lbf⋅ft⋅s",
                                description: "플래퍼 회전 감쇠 계수",
                                default: 0.0,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "springConstant",
                                label: "스프링 상수 (K_s)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "N⋅m/rad, lbf⋅ft/rad",
                                description: "복원 스프링 상수",
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
                id: "geometry",
                label: "기하학적 데이터",
                cards: [
                    {
                        id: "CCC0323",
                        label: "플래퍼 기하학",
                        description: "관성 밸브 플래퍼의 기하학적 특성을 정의합니다.",
                        fields: [
                            {
                                id: "flapperLength",
                                label: "플래퍼 길이 (L_f)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "m, ft",
                                description: "회전축에서 플래퍼 끝까지의 길이",
                                required: true,
                                validation: {
                                    min: 0,
                                    exclusiveMin: true
                                }
                            },
                            {
                                id: "flapperWidth",
                                label: "플래퍼 폭 (W_f)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "m, ft",
                                description: "플래퍼의 폭",
                                required: true,
                                validation: {
                                    min: 0,
                                    exclusiveMin: true
                                }
                            },
                            {
                                id: "initialAngle",
                                label: "초기 플래퍼 각도 (θ₀)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "rad",
                                description: "초기 플래퍼 각도 (수평면 기준)",
                                default: 0.0,
                                validation: {
                                    min: -1.57, // -π/2
                                    max: 1.57   // π/2
                                }
                            },
                            {
                                id: "fullOpenAngle",
                                label: "완전 개방 각도 (θ_open)",
                                type: "number",
                                placeholder: "1.57",
                                unit: "rad",
                                description: "플래퍼 완전 개방 시 각도",
                                default: 1.57, // π/2
                                validation: {
                                    min: 0,
                                    max: 1.57
                                }
                            },
                            {
                                id: "fullCloseAngle",
                                label: "완전 폐쇄 각도 (θ_close)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "rad",
                                description: "플래퍼 완전 폐쇄 시 각도",
                                default: 0.0,
                                validation: {
                                    min: -1.57,
                                    max: 1.57
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
                        id: "CCC0324",
                        label: "관성 밸브 초기 조건",
                        description: "관성 밸브의 초기 유동 상태를 정의합니다.",
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
                                id: "initialAngularVelocity",
                                label: "초기 각속도",
                                type: "number",
                                placeholder: "0.0",
                                unit: "rad/s",
                                description: "플래퍼의 초기 각속도",
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
            return `* INERTIAL VALVE 컴포넌트 입력\n*\n${component.number}0000  ${component.name}  VALVE\n`;
        },
        formatCard0321: function(data) {
            return `${data.componentNumber}0321  ${data.fromConnection}  ${data.toConnection}  ${data.area}  ${data.forwardLossCoeff}  ${data.reverseLossCoeff}  ${this.generateJunctionFlags(data.junctionFlags)}\n`;
        },
        formatCard0322: function(data) {
            return `${data.componentNumber}0322  ${data.flapperMoment}  ${data.flapperWeight}  ${data.centroidDistance}  ${data.dampingCoeff || 0.0}  ${data.springConstant || 0.0}\n`;
        },
        formatCard0323: function(data) {
            return `${data.componentNumber}0323  ${data.flapperLength}  ${data.flapperWidth}  ${data.initialAngle || 0.0}  ${data.fullOpenAngle || 1.57}  ${data.fullCloseAngle || 0.0}\n`;
        },
        formatCard0324: function(data) {
            return `${data.componentNumber}0324  ${data.initialVelocityLiquid || 0.0}  ${data.initialVelocityVapor || 0.0}  ${data.initialAngularVelocity || 0.0}\n`;
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
        validateFlapperGeometry: function(data) {
            return data.flapperLength > 0 && 
                   data.flapperWidth > 0 && 
                   data.centroidDistance <= data.flapperLength;
        },
        validateAngles: function(data) {
            return data.fullCloseAngle <= data.fullOpenAngle;
        }
    }
};

export default INRVLV;