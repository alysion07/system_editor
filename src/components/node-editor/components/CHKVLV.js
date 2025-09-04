const CHKVLV = {
    type: 'CHKVLV',
    label: 'CHECK VALVE',
    icon: 'CHKVLV',
    description: '체크 밸브는 유체의 역류를 방지하는 밸브 컴포넌트입니다.',
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
                        id: "CCC0301",
                        label: "체크 밸브 정보",
                        description: "체크 밸브의 기본 정보를 정의합니다.",
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
                id: "advanced",
                label: "고급 설정",
                cards: [
                    {
                        id: "CCC0302",
                        label: "체크 밸브 고급 매개변수",
                        description: "체크 밸브의 히스테리시스 및 누설 설정을 정의합니다.",
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
                                id: "hysteresisDP",
                                label: "히스테리시스 차압 (ΔP_hys)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "Pa, psi",
                                description: "밸브 개폐 시 히스테리시스 차압",
                                default: 0.0,
                                helpText: "0이면 히스테리시스 없음",
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "leakageRatio",
                                label: "누설률 (r_leak)",
                                type: "number",
                                placeholder: "0.0",
                                description: "밸브 닫힘 시 누설 유동 비율",
                                default: 0.0,
                                helpText: "0.0 (완전 차단) ~ 1.0 (완전 개방)",
                                validation: {
                                    min: 0,
                                    max: 1
                                }
                            },
                            {
                                id: "openingDP",
                                label: "개방 차압 (ΔP_open)",
                                type: "number",
                                placeholder: "1.0",
                                unit: "Pa, psi",
                                description: "밸브가 개방되는 최소 차압",
                                default: 1.0,
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
                id: "initialConditions",
                label: "초기 조건",
                cards: [
                    {
                        id: "CCC0303",
                        label: "체크 밸브 초기 조건",
                        description: "체크 밸브의 초기 유동 상태를 정의합니다.",
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
                                id: "initialValveState",
                                label: "초기 밸브 상태",
                                type: "select",
                                options: [
                                    { value: "0", label: "닫힘" },
                                    { value: "1", label: "열림" }
                                ],
                                description: "시뮬레이션 시작 시 밸브 상태",
                                default: "0"
                            }
                        ]
                    }
                ]
            }
        ]
    },
    formatters: {
        generateHeader: function(component) {
            return `* CHECK VALVE 컴포넌트 입력\n*\n${component.number}0000  ${component.name}  VALVE\n`;
        },
        formatCard0301: function(data) {
            return `${data.componentNumber}0301  ${data.fromConnection}  ${data.toConnection}  ${data.area}  ${data.forwardLossCoeff}  ${data.reverseLossCoeff}  ${this.generateJunctionFlags(data.junctionFlags)}\n`;
        },
        formatCard0302: function(data) {
            if (!data.hysteresisDP && !data.leakageRatio && !data.openingDP) return "";
            return `${data.componentNumber}0302  ${data.hysteresisDP || 0.0}  ${data.leakageRatio || 0.0}  ${data.openingDP || 1.0}\n`;
        },
        formatCard0303: function(data) {
            return `${data.componentNumber}0303  ${data.initialVelocityLiquid || 0.0}  ${data.initialVelocityVapor || 0.0}\n`;
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
        validateValveDirection: function(data) {
            // 체크 밸브는 항상 순방향만 허용
            return data.forwardLossCoeff < data.reverseLossCoeff;
        }
    }
};

export default CHKVLV;