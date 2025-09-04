const SRVVLV = {
    type: 'SRVVLV',
    label: 'SERVO VALVE',
    icon: 'SRVVLV',
    description: '서보 밸브는 제어 시스템에 의해 정밀하게 제어되는 밸브 컴포넌트입니다.',
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
                        id: "CCC0341",
                        label: "서보 밸브 정보",
                        description: "서보 밸브의 기본 정보를 정의합니다.",
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
                id: "control",
                label: "제어 설정",
                cards: [
                    {
                        id: "CCC0342",
                        label: "서보 밸브 제어",
                        description: "서보 밸브의 제어 시스템 설정을 정의합니다.",
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
                                id: "controlVariable",
                                label: "제어 변수 번호",
                                type: "number",
                                placeholder: "1",
                                description: "제어 시스템 변수 번호 (필수)",
                                required: true,
                                validation: {
                                    min: 1,
                                    integer: true
                                }
                            },
                            {
                                id: "responseTime",
                                label: "응답 시간 (τ)",
                                type: "number",
                                placeholder: "0.0",
                                unit: "s",
                                description: "서보 밸브의 응답 시간 상수",
                                default: 0.0,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "deadband",
                                label: "데드밴드 (δ)",
                                type: "number",
                                placeholder: "0.0",
                                description: "제어 신호 데드밴드",
                                default: 0.0,
                                validation: {
                                    min: 0,
                                    max: 1
                                }
                            },
                            {
                                id: "hysteresis",
                                label: "히스테리시스 (h)",
                                type: "number",
                                placeholder: "0.0",
                                description: "제어 신호 히스테리시스",
                                default: 0.0,
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
                id: "characteristics",
                label: "특성 곡선",
                cards: [
                    {
                        id: "CCC0343",
                        label: "서보 밸브 특성 테이블 (CSUBV)",
                        description: "서보 밸브의 제어 신호에 따른 유동 특성을 정의합니다.",
                        fields: [
                            {
                                id: "useCustomTable",
                                label: "사용자 정의 테이블 사용",
                                type: "select",
                                options: [
                                    { value: "0", label: "기본 선형 관계 사용" },
                                    { value: "1", label: "사용자 정의 테이블 사용" }
                                ],
                                description: "유동 특성 결정 방식",
                                default: "0"
                            },
                            {
                                id: "characteristicTable",
                                label: "특성 테이블",
                                type: "table",
                                description: "제어 신호별 밸브 특성",
                                conditionalDisplay: {
                                    field: "useCustomTable",
                                    value: "1"
                                },
                                columns: [
                                    {
                                        id: "controlSignal",
                                        label: "제어 신호",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "정규화된 제어 신호 (-1.0 ~ 1.0)",
                                        validation: {
                                            min: -1,
                                            max: 1
                                        }
                                    },
                                    {
                                        id: "openingFraction",
                                        label: "개방도",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "해당 제어 신호에서의 개방도 (0.0 ~ 1.0)",
                                        validation: {
                                            min: 0,
                                            max: 1
                                        }
                                    },
                                    {
                                        id: "flowCoefficient",
                                        label: "유동 계수",
                                        type: "number",
                                        placeholder: "1.0",
                                        description: "해당 개방도에서의 유동 계수",
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
            {
                id: "initialConditions",
                label: "초기 조건",
                cards: [
                    {
                        id: "CCC0344",
                        label: "서보 밸브 초기 조건",
                        description: "서보 밸브의 초기 유동 상태를 정의합니다.",
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
                                id: "initialControlSignal",
                                label: "초기 제어 신호",
                                type: "number",
                                placeholder: "0.0",
                                description: "시뮬레이션 시작 시 제어 신호 (-1.0 ~ 1.0)",
                                default: 0.0,
                                validation: {
                                    min: -1,
                                    max: 1
                                }
                            },
                            {
                                id: "initialOpeningFraction",
                                label: "초기 개방도",
                                type: "number",
                                placeholder: "0.5",
                                description: "시뮬레이션 시작 시 밸브 개방도 (0.0 ~ 1.0)",
                                default: 0.5,
                                validation: {
                                    min: 0,
                                    max: 1
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    formatters: {
        generateHeader: function(component) {
            return `* SERVO VALVE 컴포넌트 입력\n*\n${component.number}0000  ${component.name}  VALVE\n`;
        },
        formatCard0341: function(data) {
            return `${data.componentNumber}0341  ${data.fromConnection}  ${data.toConnection}  ${data.area}  ${data.forwardLossCoeff}  ${data.reverseLossCoeff}  ${this.generateJunctionFlags(data.junctionFlags)}\n`;
        },
        formatCard0342: function(data) {
            return `${data.componentNumber}0342  ${data.controlVariable}  ${data.responseTime || 0.0}  ${data.deadband || 0.0}  ${data.hysteresis || 0.0}\n`;
        },
        formatCard0343: function(data) {
            if (!data.useCustomTable || data.useCustomTable === "0" || !data.characteristicTable) return "";
            
            let output = "";
            for (let i = 0; i < data.characteristicTable.length; i++) {
                const row = data.characteristicTable[i];
                output += `${data.componentNumber}034${String(i+3).padStart(1, '0')}  ${row.controlSignal}  ${row.openingFraction}  ${row.flowCoefficient}\n`;
            }
            return output;
        },
        formatCard0344: function(data) {
            return `${data.componentNumber}0344  ${data.initialVelocityLiquid || 0.0}  ${data.initialVelocityVapor || 0.0}  ${data.initialControlSignal || 0.0}  ${data.initialOpeningFraction || 0.5}\n`;
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
        validateControlVariable: function(controlVariable) {
            return controlVariable && controlVariable > 0;
        },
        validateCharacteristicTable: function(characteristicTable) {
            if (!characteristicTable || characteristicTable.length === 0) return true;
            
            // 제어 신호는 오름차순이어야 함
            for (let i = 1; i < characteristicTable.length; i++) {
                if (characteristicTable[i].controlSignal <= characteristicTable[i-1].controlSignal) {
                    return false;
                }
            }
            return true;
        },
        validateDeadband: function(deadband, hysteresis) {
            return deadband >= 0 && hysteresis >= 0 && (deadband + hysteresis) <= 1;
        }
    }
};

export default SRVVLV;