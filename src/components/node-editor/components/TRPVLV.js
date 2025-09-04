const TRPVLV = {
    type: 'TRPVLV',
    label: 'TRIP VALVE',
    icon: 'TRPVLV',
    description: '트립 밸브는 조건에 따라 자동으로 개폐되는 밸브 컴포넌트입니다.',
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
                        id: "CCC0311",
                        label: "트립 밸브 정보",
                        description: "트립 밸브의 기본 정보를 정의합니다.",
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
                id: "trip",
                label: "트립 설정",
                cards: [
                    {
                        id: "CCC0312",
                        label: "트립 조건",
                        description: "트립 밸브의 개폐 조건을 정의합니다.",
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
                                        default: "1"
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
                                id: "tripNumber",
                                label: "트립 번호",
                                type: "number",
                                placeholder: "1",
                                description: "트립 신호 번호 (1-999)",
                                required: true,
                                validation: {
                                    min: 1,
                                    max: 999,
                                    integer: true
                                }
                            },
                            {
                                id: "valveType",
                                label: "밸브 타입",
                                type: "select",
                                options: [
                                    { value: "0", label: "트립 시 닫힘" },
                                    { value: "1", label: "트립 시 열림" }
                                ],
                                description: "트립 신호 발생 시 밸브 동작",
                                default: "0"
                            },
                            {
                                id: "openingTime",
                                label: "개방 시간 (t_open)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "s",
                                description: "밸브가 완전히 열리는 데 걸리는 시간",
                                default: 0.0,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "closingTime",
                                label: "폐쇄 시간 (t_close)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "s",
                                description: "밸브가 완전히 닫히는 데 걸리는 시간",
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
                        id: "CCC0313",
                        label: "트립 밸브 초기 조건",
                        description: "트립 밸브의 초기 유동 상태를 정의합니다.",
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
                                default: "1"
                            }
                        ]
                    }
                ]
            }
        ]
    },
    formatters: {
        generateHeader: function(component) {
            return `* TRIP VALVE 컴포넌트 입력\n*\n${component.number}0000  ${component.name}  VALVE\n`;
        },
        formatCard0311: function(data) {
            return `${data.componentNumber}0311  ${data.fromConnection}  ${data.toConnection}  ${data.area}  ${data.forwardLossCoeff}  ${data.reverseLossCoeff}  ${this.generateJunctionFlags(data.junctionFlags)}\n`;
        },
        formatCard0312: function(data) {
            return `${data.componentNumber}0312  ${data.tripNumber}  ${data.valveType}  ${data.openingTime || 0.0}  ${data.closingTime || 0.0}\n`;
        },
        formatCard0313: function(data) {
            return `${data.componentNumber}0313  ${data.initialVelocityLiquid || 0.0}  ${data.initialVelocityVapor || 0.0}\n`;
        },
        generateJunctionFlags: function(flags) {
            if (!flags) return "10000";
            return `${flags.vFlag || '1'}${flags.cFlag || '0'}${flags.aFlag || '0'}${flags.hFlag || '0'}${flags.sFlag || '0'}`;
        }
    },
    validators: {
        validateConnections: function(fromConnection, toConnection) {
            return fromConnection !== toConnection;
        },
        validateTripNumber: function(tripNumber) {
            return tripNumber >= 1 && tripNumber <= 999;
        },
        validateTimings: function(openingTime, closingTime) {
            return openingTime >= 0 && closingTime >= 0;
        }
    }
};

export default TRPVLV;