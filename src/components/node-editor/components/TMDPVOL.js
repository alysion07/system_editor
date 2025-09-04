const TMDPVOL = {
    type: 'TMDPVOL',
    label: 'TDV',
    description: '시간 종속 체적 컴포넌트는 시간에 따라 변하는 열역학적 상태를 가진 체적을 나타냅니다. 주로 경계 조건 설정에 사용됩니다.',
    icon: 'TDV',
    category:'hydro',
    Name:'TV000',
    ports: {
        // TMDPVOL is source-only (boundary condition)
        outputs: [
            { 
                id: "outlet", 
                label: "Outlet",
                position: 'right',
                marsCode: 2,
                connectionType: 'fluid',
                description: 'Time-dependent boundary condition outlet'
            }
        ]
    },
    properties: {
        tabs: [
            {
                id: "geometry",
                label: "기하학적 데이터",
                cards: [
                    {
                        id: "CCC0101-0109",
                        label: "체적 기하학적 데이터",
                        description: "체적의 기하학적 특성을 정의합니다.",
                        fields: [
                            {
                                id: "area",
                                label: "면적",
                                type: "number",
                                unit: "m², ft²",
                                placeholder: "0.0",
                                description: "체적의 단면적",
                                helpText: "압력 경계 조건으로 사용될 때는 연결된 정상 접합부보다 큰 면적 권장",
                                required: true,
                                relatedFields: ["length", "volume"],
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "length",
                                label: "길이",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "체적의 길이",
                                helpText: "초기화 후 0으로 설정됨",
                                required: true,
                                relatedFields: ["area", "volume"],
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "volume",
                                label: "체적",
                                type: "number",
                                unit: "m³, ft³",
                                placeholder: "0.0",
                                description: "체적의 부피",
                                helpText: "면적 × 길이와 일치해야 함. 초기화 후 0으로 설정됨",
                                required: false,
                                relatedFields: ["area", "length"],
                                validation: {
                                    min: 0,
                                    custom: "validateVolume"
                                }
                            },
                            {
                                id: "azimuthal",
                                label: "방위각",
                                type: "number",
                                unit: "도",
                                placeholder: "0.0",
                                description: "방위각 (도면 작성용)",
                                helpText: "절대값 < 360°",
                                required: false,
                                validation: {
                                    min: -360,
                                    max: 360
                                }
                            },
                            {
                                id: "inclination",
                                label: "경사각",
                                type: "number",
                                unit: "도",
                                placeholder: "0.0",
                                description: "경사각 (계면 항력 계산에 사용)",
                                helpText: "0°는 수평, 양수는 상향 경사, 절대값 < 90°",
                                required: false,
                                validation: {
                                    min: -90,
                                    max: 90
                                }
                            },
                            {
                                id: "elevation",
                                label: "고도 변화",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "입구에서 출구까지의 고도 변화",
                                helpText: "양수는 고도 증가. 절대값 ≤ 길이. 수직각과 부호가 일치해야 함. 초기화 후 0으로 설정됨",
                                required: false,
                                validation: {
                                    custom: "validateElevation"
                                }
                            },
                            {
                                id: "roughness",
                                label: "벽 거칠기",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "벽면 거칠기",
                                required: false,
                                validation: {
                                    min: 0,
                                    custom: "validateRoughness"
                                }
                            },
                            {
                                id: "hydraulic",
                                label: "수력학적 직경",
                                type: "number",
                                unit: "m, ft",
                                placeholder: "0.0",
                                description: "수력학적 직경",
                                helpText: "0 입력 시 면적으로부터 자동 계산됨",
                                required: false,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "volumeFlags",
                                label: "체적 제어 플래그",
                                type: "text",
                                placeholder: "0000000",
                                description: "체적 제어 플래그 (tlpvbfe 형식)",
                                helpText: "TMDPVOL에서는 0000000만 허용됨",
                                required: true,
                                default: "0000000",
                                validation: {
                                    custom: "validateTmdpvolFlags"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: "dataControl",
                label: "데이터 제어",
                cards: [
                    {
                        id: "CCC0200",
                        label: "시간 종속 체적 데이터 제어 단어",
                        description: "열역학적 상태를 정의하는 방법을 설정합니다.",
                        fields: [
                            {
                                id: "fluidType",
                                label: "유체 유형 (e-flag)",
                                type: "select",
                                description: "사용할 유체 종류",
                                required: true,
                                default: "0",
                                options: [
                                    { value: "0", label: "기본 유체 (H2O)" },
                                    { value: "1", label: "H₂O" },
                                    { value: "2", label: "D₂O" },
                                    { value: "3", label: "기타 유체" }
                                ]
                            },
                            {
                                id: "boronPresent",
                                label: "붕소 존재 여부 (b-flag)",
                                type: "select",
                                description: "붕소 농도 입력 여부",
                                required: true,
                                default: "0",
                                options: [
                                    { value: "0", label: "붕소 없음" },
                                    { value: "1", label: "붕소 농도 입력 필요" }
                                ]
                            },
                            {
                                id: "thermoState",
                                label: "열역학적 상태 정의 방법 (t-flag)",
                                type: "select",
                                description: "열역학적 상태를 정의하는 방법",
                                required: true,
                                default: "3",
                                options: [
                                    { value: "0", label: "[P, Uf, Ug, αg] - 압력, 액체/증기 내부 에너지, 증기 체적 분율 (비평형/평형)" },
                                    { value: "1", label: "[T, xs] - 온도, 정적 품질 (평형)" },
                                    { value: "2", label: "[P, xs] - 압력, 정적 품질 (평형)" },
                                    { value: "3", label: "[P, T] - 압력, 온도 (평형)" },
                                    { value: "4", label: "[P, T, xs] - 압력, 온도, 정적 품질 (비응축성 가스)" },
                                    { value: "5", label: "[T, xs, xn] - 온도, 정적 품질, 비응축성 품질" },
                                    { value: "6", label: "[P, Uf, Ug, αg, xn] - 압력, 액체/증기 내부 에너지, 체적 분율, 비응축성 품질" }
                                ]
                            },
                            {
                                id: "tableTrip",
                                label: "테이블 트립 번호",
                                type: "number",
                                placeholder: "0",
                                description: "테이블 트립 번호 (시간 인자 결정)",
                                helpText: "0 또는 미입력 시 트립을 사용하지 않음",
                                required: false
                            },
                            {
                                id: "varNamePart",
                                label: "변수 요청 코드 (알파벳 부분)",
                                type: "text",
                                placeholder: "TIME",
                                description: "검색 인자 지정을 위한 변수 요청 코드의 알파벳 부분",
                                helpText: "미입력 시 시간이 검색 인자로 사용됨",
                                required: false
                            },
                            {
                                id: "varNumPart",
                                label: "변수 요청 코드 (숫자 부분)",
                                type: "number",
                                placeholder: "0",
                                description: "검색 인자 지정을 위한 변수 요청 코드의 숫자 부분",
                                helpText: "미입력 시 0으로 간주됨",
                                required: false
                            }
                        ]
                    }
                ]
            },
            {
                id: "thermoState0",
                label: "[P,Uf,Ug,αg] 데이터",
                cards: [
                    {
                        id: "thermoData0",
                        label: "비평형/평형 상태 데이터",
                        description: "압력, 액체/증기 내부 에너지, 증기 체적 분율",
                        conditionalDisplay: {
                            field: "thermoState",
                            value: "0"
                        },
                        fields: [
                            {
                                id: "pressure0",
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
                                id: "liquidEnergy0",
                                label: "액체 비내부 에너지",
                                type: "number",
                                unit: "J/kg, Btu/lb",
                                placeholder: "0.0",
                                description: "액체 상의 비내부 에너지",
                                required: true
                            },
                            {
                                id: "vaporEnergy0",
                                label: "증기 비내부 에너지",
                                type: "number",
                                unit: "J/kg, Btu/lb",
                                placeholder: "0.0",
                                description: "증기 상의 비내부 에너지",
                                required: true
                            },
                            {
                                id: "voidFraction0",
                                label: "증기 체적 분율",
                                type: "number",
                                placeholder: "0.0",
                                description: "증기가 차지하는 체적 비율",
                                required: true,
                                validation: {
                                    min: 0,
                                    max: 1
                                }
                            },
                            {
                                id: "boronConc0",
                                label: "붕소 농도",
                                type: "number",
                                unit: "kg/kg",
                                placeholder: "0.0",
                                description: "액체 질량 대비 붕소 질량 비율",
                                conditionalDisplay: {
                                    field: "boronPresent",
                                    value: "1"
                                },
                                required: true,
                                validation: {
                                    min: 0
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: "thermoState1",
                label: "[T,xs] 데이터",
                cards: [
                    {
                        id: "thermoData1",
                        label: "평형 상태 데이터",
                        description: "온도, 정적 품질",
                        conditionalDisplay: {
                            field: "thermoState",
                            value: "1"
                        },
                        fields: [
                            {
                                id: "temperature1",
                                label: "온도",
                                type: "number",
                                unit: "K, °F",
                                placeholder: "0.0",
                                description: "시스템 온도",
                                required: true,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "staticQuality1",
                                label: "정적 품질",
                                type: "number",
                                placeholder: "0.0",
                                description: "증기 질량 분율",
                                required: true,
                                validation: {
                                    min: 0,
                                    max: 1
                                }
                            },
                            {
                                id: "boronConc1",
                                label: "붕소 농도",
                                type: "number",
                                unit: "kg/kg",
                                placeholder: "0.0",
                                description: "액체 질량 대비 붕소 질량 비율",
                                conditionalDisplay: {
                                    field: "boronPresent",
                                    value: "1"
                                },
                                required: true,
                                validation: {
                                    min: 0
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: "thermoState2",
                label: "[P,xs] 데이터",
                cards: [
                    {
                        id: "thermoData2",
                        label: "평형 상태 데이터",
                        description: "압력, 정적 품질",
                        conditionalDisplay: {
                            field: "thermoState",
                            value: "2"
                        },
                        fields: [
                            {
                                id: "pressure2",
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
                                id: "staticQuality2",
                                label: "정적 품질",
                                type: "number",
                                placeholder: "0.0",
                                description: "증기 질량 분율",
                                required: true,
                                validation: {
                                    min: 0,
                                    max: 1
                                }
                            },
                            {
                                id: "boronConc2",
                                label: "붕소 농도",
                                type: "number",
                                unit: "kg/kg",
                                placeholder: "0.0",
                                description: "액체 질량 대비 붕소 질량 비율",
                                conditionalDisplay: {
                                    field: "boronPresent",
                                    value: "1"
                                },
                                required: true,
                                validation: {
                                    min: 0
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: "thermoState3",
                label: "[P,T] 데이터",
                cards: [
                    {
                        id: "thermoData3",
                        label: "평형 상태 데이터",
                        description: "압력, 온도",
                        conditionalDisplay: {
                            field: "thermoState",
                            value: "3"
                        },
                        fields: [
                            {
                                id: "pressure3",
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
                                id: "temperature3",
                                label: "온도",
                                type: "number",
                                unit: "K, °F",
                                placeholder: "0.0",
                                description: "시스템 온도",
                                required: true,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "boronConc3",
                                label: "붕소 농도",
                                type: "number",
                                unit: "kg/kg",
                                placeholder: "0.0",
                                description: "액체 질량 대비 붕소 질량 비율",
                                conditionalDisplay: {
                                    field: "boronPresent",
                                    value: "1"
                                },
                                required: true,
                                validation: {
                                    min: 0
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: "thermoState4",
                label: "[P,T,xs] 데이터",
                cards: [
                    {
                        id: "thermoData4",
                        label: "비응축성 가스 상태 데이터",
                        description: "압력, 온도, 정적 품질",
                        conditionalDisplay: {
                            field: "thermoState",
                            value: "4"
                        },
                        fields: [
                            {
                                id: "pressure4",
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
                                id: "temperature4",
                                label: "온도",
                                type: "number",
                                unit: "K, °F",
                                placeholder: "0.0",
                                description: "시스템 온도 (포화 온도보다 낮아야 함)",
                                helpText: "입력 압력에서의 포화 온도보다 낮아야 합니다",
                                required: true,
                                validation: {
                                    min: 0,
                                    custom: "validateTemperature4"
                                }
                            },
                            {
                                id: "staticQuality4",
                                label: "정적 품질",
                                type: "number",
                                placeholder: "0.0",
                                description: "정적 품질 (0.0 = 건조 비응축성 가스)",
                                helpText: "0.0은 전체가 비응축성 가스임을 의미합니다",
                                required: true,
                                validation: {
                                    min: 0,
                                    max: 1
                                }
                            },
                            {
                                id: "boronConc4",
                                label: "붕소 농도",
                                type: "number",
                                unit: "kg/kg",
                                placeholder: "0.0",
                                description: "액체 질량 대비 붕소 질량 비율",
                                conditionalDisplay: {
                                    field: "boronPresent",
                                    value: "1"
                                },
                                required: true,
                                validation: {
                                    min: 0
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: "thermoState5",
                label: "[T,xs,xn] 데이터",
                cards: [
                    {
                        id: "thermoData5",
                        label: "비응축성 가스 상태 데이터",
                        description: "온도, 정적 품질, 비응축성 품질",
                        conditionalDisplay: {
                            field: "thermoState",
                            value: "5"
                        },
                        fields: [
                            {
                                id: "temperature5",
                                label: "증기 포화 온도",
                                type: "number",
                                unit: "K, °F",
                                placeholder: "0.0",
                                description: "증기 포화 온도",
                                required: true,
                                validation: {
                                    min: 0
                                }
                            },
                            {
                                id: "staticQuality5",
                                label: "정적 품질",
                                type: "number",
                                placeholder: "0.0",
                                description: "정적 품질",
                                required: true,
                                validation: {
                                    min: 0.000000001,
                                    max: 0.99999999
                                }
                            },
                            {
                                id: "nonCondQuality5",
                                label: "비응축성 품질",
                                type: "number",
                                placeholder: "0.0",
                                description: "비응축성 가스 품질",
                                required: true,
                                validation: {
                                    min: 0.000000001,
                                    max: 0.99999999
                                }
                            },
                            {
                                id: "boronConc5",
                                label: "붕소 농도",
                                type: "number",
                                unit: "kg/kg",
                                placeholder: "0.0",
                                description: "액체 질량 대비 붕소 질량 비율",
                                conditionalDisplay: {
                                    field: "boronPresent",
                                    value: "1"
                                },
                                required: true,
                                validation: {
                                    min: 0
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: "thermoState6",
                label: "[P,Uf,Ug,αg,xn] 데이터",
                cards: [
                    {
                        id: "thermoData6",
                        label: "비평형/평형 상태 데이터 (비응축성 가스)",
                        description: "압력, 액체/증기 내부 에너지, 체적 분율, 비응축성 품질",
                        conditionalDisplay: {
                            field: "thermoState",
                            value: "6"
                        },
                        fields: [
                            {
                                id: "pressure6",
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
                                id: "liquidEnergy6",
                                label: "액체 비내부 에너지",
                                type: "number",
                                unit: "J/kg, Btu/lb",
                                placeholder: "0.0",
                                description: "액체 상의 비내부 에너지",
                                required: true
                            },
                            {
                                id: "vaporEnergy6",
                                label: "증기 비내부 에너지",
                                type: "number",
                                unit: "J/kg, Btu/lb",
                                placeholder: "0.0",
                                description: "증기 상의 비내부 에너지",
                                required: true
                            },
                            {
                                id: "voidFraction6",
                                label: "증기 체적 분율",
                                type: "number",
                                placeholder: "0.0",
                                description: "증기가 차지하는 체적 비율",
                                required: true,
                                validation: {
                                    min: 0,
                                    max: 1
                                }
                            },
                            {
                                id: "nonCondQuality6",
                                label: "비응축성 품질",
                                type: "number",
                                placeholder: "0.0",
                                description: "비응축성 가스 품질",
                                helpText: "0 = 비응축성 가스 없음, 1 = 순수 비응축성 가스",
                                required: true,
                                validation: {
                                    min: 0,
                                    max: 1,
                                    custom: "validateNonCondConsistency6"
                                }
                            },
                            {
                                id: "boronConc6",
                                label: "붕소 농도",
                                type: "number",
                                unit: "kg/kg",
                                placeholder: "0.0",
                                description: "액체 질량 대비 붕소 질량 비율",
                                conditionalDisplay: {
                                    field: "boronPresent",
                                    value: "1"
                                },
                                required: true,
                                validation: {
                                    min: 0
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: "timeTable",
                label: "시간 테이블",
                cards: [
                    {
                        id: "timeTableEditor",
                        label: "시간 종속 데이터 테이블",
                        description: "시간(또는 다른 검색 변수)에 따른 열역학적 상태 변화를 정의합니다.",
                        fields: [
                            {
                                id: "timeTableData",
                                label: "시간 종속 데이터",
                                type: "timeTableEditor", // 사용자 지정 컴포넌트로 시간 테이블 에디터를 구현
                                description: "검색 변수와 열역학적 상태 데이터 쌍을 입력합니다. (최대 5,000세트)",
                                helpText: "세트 형식은 t-flag 값에 따라 달라집니다",
                                required: true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    formatters: {
        generateHeader: function(component) {
            return `* TMDPVOL 컴포넌트 입력\n*\n${component.number}0000  ${component.name}  TMDPVOL\n`;
        },
        formatGeometryCard: function(data) {
            // CCC0101-0109 카드 데이터 포맷팅
            let output = `${data.componentNumber}0101  ${data.area}  ${data.length}  ${data.volume || data.area * data.length}  `;
            output += `${data.azimuthal || 0.0}  ${data.inclination || 0.0}  ${data.elevation || 0.0}  `;
            output += `${data.roughness || 0.0}  ${data.hydraulic || 0.0}\n`;

            // CCC0001 체적 제어 플래그 추가
            output += `${data.componentNumber}0001  ${data.volumeFlags || "0000000"}\n`;

            return output;
        },
        formatControlWordCard: function(data) {
            // CCC0200 카드 데이터 포맷팅
            let controlWord = `${data.fluidType || "0"}${data.boronPresent || "0"}${data.thermoState || "3"}`;

            let output = `${data.componentNumber}0200  ${controlWord}`;

            if (data.tableTrip) {
                output += `  ${data.tableTrip}`;

                if (data.varNamePart) {
                    output += `  ${data.varNamePart}  ${data.varNumPart || 0}`;
                }
            }

            return output + '\n';
        },
        formatTimeDataCard: function(data, timeEntry, index) {
            // CCC0201-0299 카드 포맷팅 (t-flag에 따라 다른 형식)
            const cardNumber = 201 + index;
            let output = `${data.componentNumber}0${cardNumber}  ${timeEntry.time}  `;

            switch(data.thermoState) {
                case "0":
                    output += `${timeEntry.pressure0}  ${timeEntry.liquidEnergy0}  ${timeEntry.vaporEnergy0}  ${timeEntry.voidFraction0}`;
                    if (data.boronPresent === "1") output += `  ${timeEntry.boronConc0 || 0.0}`;
                    break;
                case "1":
                    output += `${timeEntry.temperature1}  ${timeEntry.staticQuality1}`;
                    if (data.boronPresent === "1") output += `  ${timeEntry.boronConc1 || 0.0}`;
                    break;
                case "2":
                    output += `${timeEntry.pressure2}  ${timeEntry.staticQuality2}`;
                    if (data.boronPresent === "1") output += `  ${timeEntry.boronConc2 || 0.0}`;
                    break;
                case "3":
                    output += `${timeEntry.pressure3}  ${timeEntry.temperature3}`;
                    if (data.boronPresent === "1") output += `  ${timeEntry.boronConc3 || 0.0}`;
                    break;
                case "4":
                    output += `${timeEntry.pressure4}  ${timeEntry.temperature4}  ${timeEntry.staticQuality4}`;
                    if (data.boronPresent === "1") output += `  ${timeEntry.boronConc4 || 0.0}`;
                    break;
                case "5":
                    output += `${timeEntry.temperature5}  ${timeEntry.staticQuality5}  ${timeEntry.nonCondQuality5}`;
                    if (data.boronPresent === "1") output += `  ${timeEntry.boronConc5 || 0.0}`;
                    break;
                case "6":
                    output += `${timeEntry.pressure6}  ${timeEntry.liquidEnergy6}  ${timeEntry.vaporEnergy6}  `;
                    output += `${timeEntry.voidFraction6}  ${timeEntry.nonCondQuality6}`;
                    if (data.boronPresent === "1") output += `  ${timeEntry.boronConc6 || 0.0}`;
                    break;
                default:
                    // 기본값 (t=3)
                    output += `${timeEntry.pressure3 || 0.0}  ${timeEntry.temperature3 || 0.0}`;
                    if (data.boronPresent === "1") output += `  ${timeEntry.boronConc3 || 0.0}`;
            }

            return output + '\n';
        }
    },
    validators: {
        validateVolume: function(value, data) {
            if(data.area && data.length && value) {
                const calculatedVolume = data.area * data.length;
                const error = Math.abs((value - calculatedVolume) / calculatedVolume);
                return error <= 0.000001;
            }
            return true;
        },
        validateElevation: function(value, data) {
            if (value === undefined || value === null) return true;

            // 수직각이 0이면 고도 변화도 0이어야 함
            if (data.inclination === 0 && value !== 0) {
                return false;
            }

            // 고도 변화의 절대값은 길이보다 작거나 같아야 함
            if (Math.abs(value) > data.length) {
                return false;
            }

            // 수직각과 고도 변화의 부호가 일치해야 함
            if (data.inclination > 0 && value < 0 || data.inclination < 0 && value > 0) {
                return false;
            }

            return true;
        },
        validateRoughness: function(value, data) {
            if (value === undefined || value === null || value === 0) return true;

            // 거칠기는 수력학적 직경의 절반보다 작아야 함
            if (data.hydraulic && value >= data.hydraulic / 2) {
                return false;
            }

            return true;
        },
        validateTmdpvolFlags: function(value) {
            // TMDPVOL에서는 0000000만 허용됨
            return value === "0000000";
        },
        validateTemperature4: function(value, data) {
            // 여기서는 간단한 검증만 수행 (실제로는 포화 온도 계산이 필요)
            return value > 0;
        },
        validateNonCondConsistency6: function(nonCondQuality, data) {
            // 비응축성 품질이 0보다 큰 경우, 체적 분율도 0보다 커야 함
            if (nonCondQuality > 0 && data.voidFraction6 <= 0) {
                return false;
            }

            // 비응축성 품질이 1인 경우, 체적 분율도 1이어야 함
            if (nonCondQuality === 1 && data.voidFraction6 !== 1) {
                return false;
            }

            return true;
        }
    }
};

export default TMDPVOL;