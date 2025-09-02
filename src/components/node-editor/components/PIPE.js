const PIPE = {
    type: 'PIPE',
    label: 'PIPE',
    icon: 'PIPE',
    description: '파이프 컴포넌트는 여러 체적으로 구성된 1차원 유체 흐름 경로를 나타냅니다.',
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
                        id: "CCC0001",
                        label: "파이프 정보",
                        description: "파이프의 기본 정보를 정의합니다.",
                        fields: [
                            {
                                id: "numberOfVolumes",
                                label: "체적 수 (nv)",
                                type: "number",
                                placeholder: "1",
                                description: "파이프를 구성하는 체적의 수",
                                helpText: "1 이상 99 이하의 정수여야 합니다. 내부 접합부 수는 nv-1입니다.",
                                required: true,
                                validation: {
                                    min: 1,
                                    max: 99,
                                    integer: true
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
                        id: "CCC0101-0199",
                        label: "파이프 X-좌표 면적 데이터",
                        description: "파이프 각 체적의 X-좌표 방향 단면적을 정의합니다.",
                        fields: [
                            {
                                id: "xAreaTable",
                                label: "X-좌표 면적 테이블",
                                type: "table",
                                description: "체적별 X-좌표 방향 단면적",
                                required: true,
                                columns: [
                                    {
                                        id: "volumeNumber",
                                        label: "체적 번호",
                                        type: "number",
                                        placeholder: "1",
                                        validation: {
                                            min: 1,
                                            max: 99,
                                            integer: true
                                        }
                                    },
                                    {
                                        id: "area",
                                        label: "면적 (m², ft²)",
                                        type: "number",
                                        placeholder: "0.0",
                                        validation: {
                                            min: 0
                                        }
                                    }
                                ],
                                dynamicRows: {
                                    dependsOn: "numberOfVolumes"
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0201-0299",
                        label: "파이프 접합부 면적 데이터",
                        description: "파이프 내부 접합부의 유동 면적을 정의합니다. (선택 사항)",
                        fields: [
                            {
                                id: "junctionAreaTable",
                                label: "접합부 면적 테이블",
                                type: "table",
                                description: "접합부별 유동 면적",
                                required: false,
                                columns: [
                                    {
                                        id: "junctionNumber",
                                        label: "접합부 번호",
                                        type: "number",
                                        placeholder: "1",
                                        validation: {
                                            min: 1,
                                            max: 98,
                                            integer: true
                                        }
                                    },
                                    {
                                        id: "junctionArea",
                                        label: "접합부 면적 (m², ft²)",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "0 입력 또는 미입력 시 인접 체적의 최소 면적 사용",
                                        validation: {
                                            min: 0
                                        }
                                    }
                                ],
                                dynamicRows: {
                                    dependsOn: "numberOfVolumes",
                                    formula: "n - 1" // nv - 1
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0301-0399",
                        label: "파이프 X-좌표 길이 데이터",
                        description: "파이프 각 체적의 X-좌표 방향 길이를 정의합니다.",
                        fields: [
                            {
                                id: "xLengthTable",
                                label: "X-좌표 길이 테이블",
                                type: "table",
                                description: "체적별 X-좌표 방향 길이",
                                required: true,
                                columns: [
                                    {
                                        id: "volumeNumber",
                                        label: "체적 번호",
                                        type: "number",
                                        placeholder: "1",
                                        validation: {
                                            min: 1,
                                            max: 99,
                                            integer: true
                                        }
                                    },
                                    {
                                        id: "length",
                                        label: "길이 (m, ft)",
                                        type: "number",
                                        placeholder: "0.0",
                                        validation: {
                                            min: 0
                                        }
                                    }
                                ],
                                dynamicRows: {
                                    dependsOn: "numberOfVolumes"
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0401-0499",
                        label: "파이프 체적 데이터",
                        description: "파이프 각 체적의 부피를 정의합니다. (선택 사항)",
                        fields: [
                            {
                                id: "volumeTable",
                                label: "체적 테이블",
                                type: "table",
                                description: "체적별 부피 데이터",
                                required: false,
                                columns: [
                                    {
                                        id: "volumeNumber",
                                        label: "체적 번호",
                                        type: "number",
                                        placeholder: "1",
                                        validation: {
                                            min: 1,
                                            max: 99,
                                            integer: true
                                        }
                                    },
                                    {
                                        id: "volume",
                                        label: "부피 (m³, ft³)",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "미입력 시 0으로 설정됨. 체적 = 면적 × 길이와 일치해야 함",
                                        validation: {
                                            min: 0,
                                            custom: "validateVolume"
                                        }
                                    }
                                ],
                                dynamicRows: {
                                    dependsOn: "numberOfVolumes"
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0501-0599",
                        label: "파이프 체적 방위각 데이터",
                        description: "파이프 각 체적의 방위각을 정의합니다. (선택 사항)",
                        fields: [
                            {
                                id: "azimuthalAngleTable",
                                label: "방위각 테이블",
                                type: "table",
                                description: "체적별 방위각 데이터",
                                required: false,
                                columns: [
                                    {
                                        id: "volumeNumber",
                                        label: "체적 번호",
                                        type: "number",
                                        placeholder: "1",
                                        validation: {
                                            min: 1,
                                            max: 99,
                                            integer: true
                                        }
                                    },
                                    {
                                        id: "azimuthalAngle",
                                        label: "방위각 (도)",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "3D 그리기 프로그램에서 사용됨",
                                        validation: {
                                            min: -360,
                                            max: 360
                                        }
                                    }
                                ],
                                dynamicRows: {
                                    dependsOn: "numberOfVolumes"
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0601-0699",
                        label: "파이프 체적 수직각 데이터",
                        description: "파이프 각 체적의 수직각을 정의합니다.",
                        fields: [
                            {
                                id: "verticalAngleTable",
                                label: "수직각 테이블",
                                type: "table",
                                description: "체적별 수직각 데이터",
                                required: true,
                                columns: [
                                    {
                                        id: "volumeNumber",
                                        label: "체적 번호",
                                        type: "number",
                                        placeholder: "1",
                                        validation: {
                                            min: 1,
                                            max: 99,
                                            integer: true
                                        }
                                    },
                                    {
                                        id: "verticalAngle",
                                        label: "수직각 (도)",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "계면 항력 계산에 사용됨",
                                        helpText: "절대값은 90도 이하여야 함",
                                        validation: {
                                            min: -90,
                                            max: 90
                                        }
                                    }
                                ],
                                dynamicRows: {
                                    dependsOn: "numberOfVolumes"
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0701-0799",
                        label: "파이프 X-좌표 (고도) 변화 데이터",
                        description: "파이프 각 체적의 X-좌표 방향 고도 변화를 정의합니다. (선택 사항)",
                        fields: [
                            {
                                id: "elevationChangeMode",
                                label: "좌표 변화 입력 모드",
                                type: "select",
                                description: "좌표 변화 입력 방식 선택",
                                required: false,
                                default: "1",
                                options: [
                                    { value: "1", label: "1개 좌표 변화 (고도만)" },
                                    { value: "3", label: "3개 좌표 변화 (x, y, z)" }
                                ]
                            },
                            {
                                id: "elevationChangeTable1",
                                label: "고도 변화 테이블",
                                type: "table",
                                description: "체적별 고도 변화 데이터",
                                conditionalDisplay: {
                                    field: "elevationChangeMode",
                                    value: "1"
                                },
                                columns: [
                                    {
                                        id: "volumeNumber",
                                        label: "체적 번호",
                                        type: "number",
                                        placeholder: "1",
                                        validation: {
                                            min: 1,
                                            max: 99,
                                            integer: true
                                        }
                                    },
                                    {
                                        id: "elevationChange",
                                        label: "고도 변화 (m, ft)",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "입구에서 출구까지의 고도 변화(Δzx)",
                                        helpText: "절대값은 체적 길이 이하여야 함",
                                        validation: {
                                            custom: "validateElevationChange"
                                        }
                                    }
                                ],
                                dynamicRows: {
                                    dependsOn: "numberOfVolumes"
                                }
                            },
                            {
                                id: "elevationChangeTable3",
                                label: "3차원 좌표 변화 테이블",
                                type: "table",
                                description: "체적별 x, y, z 좌표 변화 데이터",
                                conditionalDisplay: {
                                    field: "elevationChangeMode",
                                    value: "3"
                                },
                                columns: [
                                    {
                                        id: "volumeNumber",
                                        label: "체적 번호",
                                        type: "number",
                                        placeholder: "1",
                                        validation: {
                                            min: 1,
                                            max: 99,
                                            integer: true
                                        }
                                    },
                                    {
                                        id: "deltaX",
                                        label: "X-방향 변화 (m, ft)",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "입구에서 출구까지의 고정 x축 방향 변화(Δxx)"
                                    },
                                    {
                                        id: "deltaY",
                                        label: "Y-방향 변화 (m, ft)",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "입구에서 출구까지의 고정 y축 방향 변화(Δyx)"
                                    },
                                    {
                                        id: "deltaZ",
                                        label: "Z-방향 변화 (m, ft)",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "입구에서 출구까지의 고정 z축 방향 변화(Δzx)"
                                    }
                                ],
                                dynamicRows: {
                                    dependsOn: "numberOfVolumes"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: "friction",
                label: "마찰 데이터",
                cards: [
                    {
                        id: "CCC0801-0899",
                        label: "파이프 체적 X-좌표 마찰 데이터",
                        description: "파이프 각 체적의 벽면 거칠기와 수력학적 직경을 정의합니다.",
                        fields: [
                            {
                                id: "frictionTable",
                                label: "마찰 데이터 테이블",
                                type: "table",
                                description: "체적별 벽면 거칠기 및 수력학적 직경",
                                required: true,
                                columns: [
                                    {
                                        id: "volumeNumber",
                                        label: "체적 번호",
                                        type: "number",
                                        placeholder: "1",
                                        validation: {
                                            min: 1,
                                            max: 99,
                                            integer: true
                                        }
                                    },
                                    {
                                        id: "roughness",
                                        label: "벽면 거칠기 (m, ft)",
                                        type: "number",
                                        placeholder: "0.0",
                                        validation: {
                                            min: 0
                                        }
                                    },
                                    {
                                        id: "hydraulicDiameter",
                                        label: "수력학적 직경 (m, ft)",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "0 입력 시 면적에서 자동 계산됨",
                                        helpText: "4*면적/젖은둘레 또는 2*√(면적/π)",
                                        validation: {
                                            min: 0,
                                            custom: "validateHydraulicDiameter"
                                        }
                                    }
                                ],
                                dynamicRows: {
                                    dependsOn: "numberOfVolumes"
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC0901-0999",
                        label: "파이프 접합부 손실 계수",
                        description: "파이프 내부 접합부의 에너지 손실 계수를 정의합니다. (선택 사항)",
                        fields: [
                            {
                                id: "lossCoeffTable",
                                label: "손실 계수 테이블",
                                type: "table",
                                description: "접합부별 손실 계수",
                                required: false,
                                columns: [
                                    {
                                        id: "junctionNumber",
                                        label: "접합부 번호",
                                        type: "number",
                                        placeholder: "1",
                                        validation: {
                                            min: 1,
                                            max: 98,
                                            integer: true
                                        }
                                    },
                                    {
                                        id: "forwardLossCoef",
                                        label: "순방향 손실 계수 (AF)",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "레이놀즈 수 독립적 순방향 에너지 손실 계수",
                                        validation: {
                                            min: 0
                                        }
                                    },
                                    {
                                        id: "reverseLossCoef",
                                        label: "역방향 손실 계수 (AR)",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "레이놀즈 수 독립적 역방향 에너지 손실 계수",
                                        validation: {
                                            min: 0
                                        }
                                    }
                                ],
                                dynamicRows: {
                                    dependsOn: "numberOfVolumes",
                                    formula: "n - 1" // nv - 1
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC2501-2599",
                        label: "파이프 체적 추가 벽면 마찰 데이터",
                        description: "파이프 각 체적의 추가 벽면 마찰 계수를 정의합니다. (선택 사항)",
                        fields: [
                            {
                                id: "additionalFrictionTable",
                                label: "추가 마찰 데이터 테이블",
                                type: "table",
                                description: "체적별 추가 마찰 계수",
                                required: false,
                                columns: [
                                    {
                                        id: "volumeNumber",
                                        label: "체적 번호",
                                        type: "number",
                                        placeholder: "1",
                                        validation: {
                                            min: 1,
                                            max: 99,
                                            integer: true
                                        }
                                    },
                                    {
                                        id: "xShapeFactor",
                                        label: "X-좌표 형상 인자",
                                        type: "number",
                                        placeholder: "1.0",
                                        description: "X-좌표 방향 층류 형상 인자",
                                        default: 1.0
                                    },
                                    {
                                        id: "xViscRatioExp",
                                        label: "X-좌표 점도비 지수",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "X-좌표 방향 점도비 지수",
                                        default: 0.0
                                    },
                                    {
                                        id: "yShapeFactor",
                                        label: "Y-좌표 형상 인자",
                                        type: "number",
                                        placeholder: "1.0",
                                        description: "Y-좌표 방향 층류 형상 인자",
                                        default: 1.0
                                    },
                                    {
                                        id: "yViscRatioExp",
                                        label: "Y-좌표 점도비 지수",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "Y-좌표 방향 점도비 지수",
                                        default: 0.0
                                    },
                                    {
                                        id: "zShapeFactor",
                                        label: "Z-좌표 형상 인자",
                                        type: "number",
                                        placeholder: "1.0",
                                        description: "Z-좌표 방향 층류 형상 인자",
                                        default: 1.0
                                    },
                                    {
                                        id: "zViscRatioExp",
                                        label: "Z-좌표 점도비 지수",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "Z-좌표 방향 점도비 지수",
                                        default: 0.0
                                    }
                                ],
                                dynamicRows: {
                                    dependsOn: "numberOfVolumes"
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC3001-3099",
                        label: "파이프 접합부 형상 손실 데이터",
                        description: "파이프 내부 접합부의 형상 손실 계수를 정의합니다. (선택 사항)",
                        fields: [
                            {
                                id: "formLossTable",
                                label: "형상 손실 데이터 테이블",
                                type: "table",
                                description: "접합부별 형상 손실 계수",
                                required: false,
                                columns: [
                                    {
                                        id: "junctionNumber",
                                        label: "접합부 번호",
                                        type: "number",
                                        placeholder: "1",
                                        validation: {
                                            min: 1,
                                            max: 98,
                                            integer: true
                                        }
                                    },
                                    {
                                        id: "BF",
                                        label: "BF",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "순방향 레이놀즈 수 의존 계수",
                                        helpText: "KF = AF + BF*Re^(-CF)",
                                        validation: {
                                            min: 0
                                        }
                                    },
                                    {
                                        id: "CF",
                                        label: "CF",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "순방향 레이놀즈 수 지수",
                                        validation: {
                                            min: 0
                                        }
                                    },
                                    {
                                        id: "BR",
                                        label: "BR",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "역방향 레이놀즈 수 의존 계수",
                                        helpText: "KR = AR + BR*Re^(-CR)",
                                        validation: {
                                            min: 0
                                        }
                                    },
                                    {
                                        id: "CR",
                                        label: "CR",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "역방향 레이놀즈 수 지수",
                                        validation: {
                                            min: 0
                                        }
                                    }
                                ],
                                dynamicRows: {
                                    dependsOn: "numberOfVolumes",
                                    formula: "n - 1" // nv - 1
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: "flags",
                label: "제어 플래그",
                cards: [
                    {
                        id: "CCC1001-1099",
                        label: "파이프 체적 X-좌표 제어 플래그",
                        description: "파이프 각 체적의 물리적 모델 제어 플래그를 정의합니다.",
                        fields: [
                            {
                                id: "volumeFlagsTable",
                                label: "체적 제어 플래그 테이블",
                                type: "table",
                                description: "체적별 제어 플래그",
                                required: true,
                                columns: [
                                    {
                                        id: "volumeNumber",
                                        label: "체적 번호",
                                        type: "number",
                                        placeholder: "1",
                                        validation: {
                                            min: 1,
                                            max: 99,
                                            integer: true
                                        }
                                    },
                                    {
                                        id: "volumeFlags",
                                        label: "체적 제어 플래그",
                                        type: "flags",
                                        description: "형식: tlpvbfe",
                                        subfields: [
                                            {
                                                id: "tFlag",
                                                label: "열 전단 추적 모델 (t)",
                                                type: "select",
                                                options: [
                                                    { value: "0", label: "미사용" },
                                                    { value: "1", label: "사용" }
                                                ],
                                                description: "열 전단 추적 모델 사용 여부",
                                                helpText: "수직 방향 컴포넌트에만 적용 가능",
                                                default: "0"
                                            },
                                            {
                                                id: "lFlag",
                                                label: "혼합 수위 추적 모델 (l)",
                                                type: "select",
                                                options: [
                                                    { value: "0", label: "미사용" },
                                                    { value: "1", label: "사용" }
                                                ],
                                                description: "혼합 수위 추적 모델 사용 여부",
                                                helpText: "수직 방향 컴포넌트에만 적용 가능",
                                                default: "0"
                                            },
                                            {
                                                id: "pFlag",
                                                label: "물 압축 방식 (p)",
                                                type: "select",
                                                options: [
                                                    { value: "0", label: "사용" },
                                                    { value: "1", label: "미사용" }
                                                ],
                                                description: "물 압축 방식 사용 여부",
                                                default: "0"
                                            },
                                            {
                                                id: "vFlag",
                                                label: "수직 층화 모델 (v)",
                                                type: "select",
                                                options: [
                                                    { value: "0", label: "사용" },
                                                    { value: "1", label: "미사용" }
                                                ],
                                                description: "수직 층화 모델 사용 여부",
                                                default: "0"
                                            },
                                            {
                                                id: "bFlag",
                                                label: "계면 마찰 모델 (b)",
                                                type: "select",
                                                options: [
                                                    { value: "0", label: "파이프 모델" },
                                                    { value: "1", label: "봉다발 모델" },
                                                    { value: "2", label: "ORNL ANS 모델" }
                                                ],
                                                description: "사용할 계면 마찰 모델",
                                                default: "0"
                                            },
                                            {
                                                id: "fFlag",
                                                label: "벽 마찰 계산 (f)",
                                                type: "select",
                                                options: [
                                                    { value: "0", label: "계산함" },
                                                    { value: "1", label: "계산 안함" }
                                                ],
                                                description: "X-좌표 방향으로 벽 마찰 계산 여부",
                                                default: "0"
                                            },
                                            {
                                                id: "eFlag",
                                                label: "열평형 계산 (e)",
                                                type: "select",
                                                options: [
                                                    { value: "0", label: "비평형(온도 불균형)" },
                                                    { value: "1", label: "평형(온도 균형)" }
                                                ],
                                                description: "열평형/비평형 계산 여부",
                                                helpText: "평형 체적과 비평형 체적은 연결하지 않는 것이 좋음",
                                                default: "0"
                                            }
                                        ]
                                    }
                                ],
                                dynamicRows: {
                                    dependsOn: "numberOfVolumes"
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC1101-1199",
                        label: "파이프 접합부 제어 플래그",
                        description: "파이프 내부 접합부의 물리적 모델 제어 플래그를 정의합니다.",
                        fields: [
                            {
                                id: "junctionFlagsTable",
                                label: "접합부 제어 플래그 테이블",
                                type: "table",
                                description: "접합부별 제어 플래그",
                                required: true,
                                columns: [
                                    {
                                        id: "junctionNumber",
                                        label: "접합부 번호",
                                        type: "number",
                                        placeholder: "1",
                                        validation: {
                                            min: 1,
                                            max: 98,
                                            integer: true
                                        }
                                    },
                                    {
                                        id: "junctionFlags",
                                        label: "접합부 제어 플래그",
                                        type: "flags",
                                        description: "형식: 0ef0cahs (파이프 컴포넌트용)",
                                        subfields: [
                                            {
                                                id: "eFlag",
                                                label: "수정된 PV 항 (e)",
                                                type: "select",
                                                options: [
                                                    { value: "0", label: "적용 안함" },
                                                    { value: "1", label: "적용" }
                                                ],
                                                description: "에너지 방정식의 수정된 PV 항",
                                                default: "0"
                                            },
                                            {
                                                id: "fFlag",
                                                label: "CCFL 옵션 (f)",
                                                type: "select",
                                                options: [
                                                    { value: "0", label: "CCFL 모델 사용 안함" },
                                                    { value: "1", label: "CCFL 모델 사용" }
                                                ],
                                                description: "역류 제한(CCFL) 모델 적용 여부",
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
                                                    { value: "1", label: "완전 급격 면적 변화" },
                                                    { value: "2", label: "부분 급격 면적 변화" }
                                                ],
                                                description: "면적 변화에 따른 모델링 방식",
                                                helpText: "면적 변화에 따른 손실 계수 계산 방법",
                                                default: "0"
                                            },
                                            {
                                                id: "hFlag",
                                                label: "동질/비동질 옵션 (h)",
                                                type: "select",
                                                options: [
                                                    { value: "0", label: "비동질(두 속도 운동량 방정식)" },
                                                    { value: "1", label: "동질(단일 속도 운동량 방정식)" },
                                                    { value: "2", label: "동질(단일 속도 운동량 방정식)" }
                                                ],
                                                description: "유체 혼합물의 동질성 가정",
                                                default: "0"
                                            },
                                            {
                                                id: "sFlag",
                                                label: "운동량 플럭스 옵션 (s)",
                                                type: "select",
                                                options: [
                                                    { value: "0", label: "양쪽 체적에서 운동량 플럭스 사용" },
                                                    { value: "1", label: "시작 체적만 운동량 플럭스 사용" },
                                                    { value: "2", label: "종료 체적만 운동량 플럭스 사용" },
                                                    { value: "3", label: "운동량 플럭스 사용 안함" }
                                                ],
                                                description: "운동량 플럭스 적용 방식",
                                                default: "0"
                                            }
                                        ]
                                    }
                                ],
                                dynamicRows: {
                                    dependsOn: "numberOfVolumes",
                                    formula: "n - 1" // nv - 1
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC3101-3199",
                        label: "ORNL ANS 계면 모델 값",
                        description: "ORNL ANS 계면 마찰 모델에 사용되는 값을 정의합니다.",
                        conditionalDisplay: {
                            field: "volumeFlagsTable",
                            condition: "hasAnyBFlag2"
                        },
                        fields: [
                            {
                                id: "ornlAnsTable",
                                label: "ORNL ANS 모델 값 테이블",
                                type: "table",
                                description: "체적별 ORNL ANS 모델 값",
                                required: true,
                                columns: [
                                    {
                                        id: "volumeNumber",
                                        label: "체적 번호",
                                        type: "number",
                                        placeholder: "1",
                                        validation: {
                                            min: 1,
                                            max: 99,
                                            integer: true
                                        }
                                    },
                                    {
                                        id: "gap",
                                        label: "Gap (m, ft)",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "측면 벽 사이 거리, 짧은 길이, 피치, 채널 폭",
                                        validation: {
                                            min: 0
                                        }
                                    },
                                    {
                                        id: "span",
                                        label: "Span (m, ft)",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "한쪽 끝에서 다른 쪽 끝까지의 거리, 긴 길이",
                                        validation: {
                                            min: 0
                                        }
                                    }
                                ],
                                dynamicRows: {
                                    dependsOn: "volumeFlagsTable",
                                    filter: "bFlag=2"
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
                        id: "CCC1201-1299",
                        label: "파이프 체적 초기 조건",
                        description: "파이프 각 체적의 초기 열역학적 상태를 정의합니다.",
                        fields: [
                            {
                                id: "initialCondTable",
                                label: "초기 조건 테이블",
                                type: "table",
                                description: "체적별 초기 열역학적 상태",
                                required: true,
                                columns: [
                                    {
                                        id: "volumeNumber",
                                        label: "체적 번호",
                                        type: "number",
                                        placeholder: "1",
                                        validation: {
                                            min: 1,
                                            max: 99,
                                            integer: true
                                        }
                                    },
                                    {
                                        id: "fluidType",
                                        label: "유체 유형 (ε)",
                                        type: "select",
                                        options: [
                                            { value: "0", label: "기본 유체" },
                                            { value: "1", label: "H₂O" },
                                            { value: "2", label: "D₂O" },
                                            { value: "3", label: "기타 유체" }
                                        ],
                                        description: "사용할 유체 종류",
                                        default: "0"
                                    },
                                    {
                                        id: "boronPresent",
                                        label: "붕소 존재 여부 (b)",
                                        type: "select",
                                        options: [
                                            { value: "0", label: "붕소 없음" },
                                            { value: "1", label: "붕소 농도 입력 필요" }
                                        ],
                                        description: "붕소 농도 입력 여부",
                                        default: "0"
                                    },
                                    {
                                        id: "thermoState",
                                        label: "열역학적 상태 정의 방법 (t)",
                                        type: "select",
                                        options: [
                                            { value: "0", label: "[P, Uf, Ug, αg] - 비평형/평형" },
                                            { value: "1", label: "[T, xs] - 평형" },
                                            { value: "2", label: "[P, xs] - 평형" },
                                            { value: "3", label: "[P, T] - 평형" },
                                            { value: "4", label: "[P, T, xs] - 비응축성 가스" },
                                            { value: "5", label: "[T, xs, xn] - 비응축성 가스" },
                                            { value: "6", label: "[P, Uf, Ug, αg, xn] - 비응축성 가스" }
                                        ],
                                        description: "열역학적 상태를 정의하는 방법",
                                        default: "3"
                                    },
                                    {
                                        id: "initialValue1",
                                        label: "초기값 1",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "t=0: 압력(Pa, lbf/in²), t=1: 온도(K, °F), t=2: 압력(Pa, lbf/in²), t=3: 압력(Pa, lbf/in²), t=4: 압력(Pa, lbf/in²), t=5: 온도(K, °F), t=6: 압력(Pa, lbf/in²)",
                                        required: true
                                    },
                                    {
                                        id: "initialValue2",
                                        label: "초기값 2",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "t=0: 액체 내부 에너지(J/kg, Btu/lb), t=1: 정적 품질, t=2: 정적 품질, t=3: 온도(K, °F), t=4: 온도(K, °F), t=5: 정적 품질, t=6: 액체 내부 에너지(J/kg, Btu/lb)",
                                        required: true
                                    },
                                    {
                                        id: "initialValue3",
                                        label: "초기값 3",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "t=0: 증기 내부 에너지(J/kg, Btu/lb), t=4: 정적 품질, t=5: 비응축성 품질, t=6: 증기 내부 에너지(J/kg, Btu/lb)",
                                        conditionalDisplay: {
                                            field: "thermoState",
                                            values: ["0", "4", "5", "6"]
                                        }
                                    },
                                    {
                                        id: "initialValue4",
                                        label: "초기값 4",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "t=0: 증기 체적 분율, t=6: 증기 체적 분율",
                                        conditionalDisplay: {
                                            field: "thermoState",
                                            values: ["0", "6"]
                                        }
                                    },
                                    {
                                        id: "initialValue5",
                                        label: "초기값 5",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "t=6: 비응축성 품질",
                                        conditionalDisplay: {
                                            field: "thermoState",
                                            values: ["6"]
                                        }
                                    }
                                ],
                                dynamicRows: {
                                    dependsOn: "numberOfVolumes"
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC1300",
                        label: "파이프 접합부 조건 제어 단어",
                        description: "접합부 초기 조건의 입력 방식을 정의합니다. (선택 사항)",
                        fields: [
                            {
                                id: "junctionCondWord",
                                label: "접합부 조건 제어 단어",
                                type: "select",
                                options: [
                                    { value: "0", label: "속도 입력" },
                                    { value: "1", label: "질량 유량 입력" }
                                ],
                                description: "접합부 초기 조건 입력 방식",
                                default: "0",
                                required: false
                            }
                        ]
                    },
                    {
                        id: "CCC1301-1399",
                        label: "파이프 접합부 초기 조건",
                        description: "파이프 내부 접합부의 초기 유동 상태를 정의합니다.",
                        fields: [
                            {
                                id: "junctionInitCondTable",
                                label: "접합부 초기 조건 테이블",
                                type: "table",
                                description: "접합부별 초기 유동 상태",
                                required: true,
                                columns: [
                                    {
                                        id: "junctionNumber",
                                        label: "접합부 번호",
                                        type: "number",
                                        placeholder: "1",
                                        validation: {
                                            min: 1,
                                            max: 98,
                                            integer: true
                                        }
                                    },
                                    {
                                        id: "liquidValue",
                                        label: "액체 속도/질량 유량",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "액체 속도(m/s, ft/s) 또는 질량 유량(kg/s, lb/s)",
                                        helpText: "제어 단어에 따라 속도 또는 질량 유량 입력"
                                    },
                                    {
                                        id: "vaporValue",
                                        label: "증기 속도/질량 유량",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "증기 속도(m/s, ft/s) 또는 질량 유량(kg/s, lb/s)",
                                        helpText: "제어 단어에 따라 속도 또는 질량 유량 입력"
                                    },
                                    {
                                        id: "interfaceVelocity",
                                        label: "계면 속도",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "계면 속도(m/s, ft/s)",
                                        helpText: "현재 구현되지 않았으므로 0 입력",
                                        default: 0.0
                                    }
                                ],
                                dynamicRows: {
                                    dependsOn: "numberOfVolumes",
                                    formula: "n - 1" // nv - 1
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC1401-1499",
                        label: "파이프 접합부 직경 및 CCFL 데이터",
                        description: "파이프 내부 접합부의 수력학적 직경과 CCFL 모델 매개변수를 정의합니다. (선택 사항)",
                        fields: [
                            {
                                id: "junctionDiamCcflTable",
                                label: "접합부 직경 및 CCFL 데이터 테이블",
                                type: "table",
                                description: "접합부별 직경 및 CCFL 데이터",
                                required: false,
                                columns: [
                                    {
                                        id: "junctionNumber",
                                        label: "접합부 번호",
                                        type: "number",
                                        placeholder: "1",
                                        validation: {
                                            min: 1,
                                            max: 98,
                                            integer: true
                                        }
                                    },
                                    {
                                        id: "junctionDiameter",
                                        label: "접합부 수력학적 직경",
                                        type: "number",
                                        unit: "m, ft",
                                        placeholder: "0.0",
                                        description: "접합부 수력학적 직경",
                                        helpText: "0 입력 시 자동 계산됨: 2*√(면적/π)",
                                        validation: {
                                            min: 0
                                        }
                                    },
                                    {
                                        id: "floodingForm",
                                        label: "침수 상관식 형태 (β)",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "CCFL 상관식 형태",
                                        helpText: "0: Wallis 형태, 1: Kutateladze 형태, 0~1: Bankoff 가중치",
                                        conditionalDisplay: {
                                            field: "junctionFlagsTable",
                                            condition: "hasFFlag1"
                                        },
                                        default: 0.0,
                                        validation: {
                                            min: 0,
                                            max: 1
                                        }
                                    },
                                    {
                                        id: "gasIntercept",
                                        label: "가스 절편 (c)",
                                        type: "number",
                                        placeholder: "1.0",
                                        description: "CCFL 상관식의 가스 절편",
                                        helpText: "Hf^(1/2) = 0일 때 사용됨",
                                        conditionalDisplay: {
                                            field: "junctionFlagsTable",
                                            condition: "hasFFlag1"
                                        },
                                        default: 1.0,
                                        validation: {
                                            min: 0
                                        }
                                    },
                                    {
                                        id: "slope",
                                        label: "기울기 (m)",
                                        type: "number",
                                        placeholder: "1.0",
                                        description: "CCFL 상관식의 기울기",
                                        conditionalDisplay: {
                                            field: "junctionFlagsTable",
                                            condition: "hasFFlag1"
                                        },
                                        default: 1.0,
                                        validation: {
                                            min: 0
                                        }
                                    }
                                ],
                                dynamicRows: {
                                    dependsOn: "numberOfVolumes",
                                    formula: "n - 1" // nv - 1
                                }
                            }
                        ]
                    },
                    {
                        id: "CCC2001-2099",
                        label: "파이프 초기 붕소 농도",
                        description: "파이프 각 체적의 초기 붕소 농도를 정의합니다.",
                        conditionalDisplay: {
                            field: "initialCondTable",
                            condition: "hasAnyBoronPresent1"
                        },
                        fields: [
                            {
                                id: "boronConcTable",
                                label: "붕소 농도 테이블",
                                type: "table",
                                description: "체적별 초기 붕소 농도",
                                required: true,
                                columns: [
                                    {
                                        id: "volumeNumber",
                                        label: "체적 번호",
                                        type: "number",
                                        placeholder: "1",
                                        validation: {
                                            min: 1,
                                            max: 99,
                                            integer: true
                                        }
                                    },
                                    {
                                        id: "boronConcentration",
                                        label: "붕소 농도",
                                        type: "number",
                                        placeholder: "0.0",
                                        description: "액체 질량 대비 붕소 질량 비율",
                                        validation: {
                                            min: 0
                                        }
                                    }
                                ],
                                dynamicRows: {
                                    dependsOn: "initialCondTable",
                                    filter: "boronPresent=1"
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
            return `* PIPE 컴포넌트 입력\n*\n${component.number}0000  ${component.name}  PIPE\n`;
        },
        formatCard0001: function(data) {
            return `${data.componentNumber}0001  ${data.numberOfVolumes}\n`;
        },
        formatCardRange0101to0199: function(data) {
            let output = "";

            // X-좌표 면적 데이터 포맷팅
            for (let i = 0; i < data.xAreaTable.length; i++) {
                const row = data.xAreaTable[i];
                output += `${data.componentNumber}01${String(i+1).padStart(2, '0')}  ${row.area}  ${row.volumeNumber}\n`;
            }

            return output;
        },
        formatCardRange0201to0299: function(data) {
            if (!data.junctionAreaTable || data.junctionAreaTable.length === 0) return "";

            let output = "";

            // 접합부 면적 데이터 포맷팅
            for (let i = 0; i < data.junctionAreaTable.length; i++) {
                const row = data.junctionAreaTable[i];
                output += `${data.componentNumber}02${String(i+1).padStart(2, '0')}  ${row.junctionArea || '0.0'}  ${row.junctionNumber}\n`;
            }

            return output;
        },
        // 나머지 카드 포맷팅 함수들...
        generateVolumeFlags: function(flags) {
            return `${flags.tFlag || '0'}${flags.lFlag || '0'}${flags.pFlag || '0'}${flags.vFlag || '0'}${flags.bFlag || '0'}${flags.fFlag || '0'}${flags.eFlag || '0'}`;
        },
        generateJunctionFlags: function(flags) {
            return `0${flags.eFlag || '0'}${flags.fFlag || '0'}0${flags.cFlag || '0'}${flags.aFlag || '0'}${flags.hFlag || '0'}${flags.sFlag || '0'}`;
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
        validateElevationChange: function(value, data) {
            if(value === undefined || value === null) return true;

            // 고도 변화의 절대값은 길이보다 작거나 같아야 함
            const volumeIndex = data.volumeNumber - 1;
            const length = data.xLengthTable[volumeIndex].length;
            return Math.abs(value) <= length;
        },
        validateHydraulicDiameter: function(value, data, roughness) {
            if(value === undefined || value === null || value === 0) return true;

            // 거칠기는 수력학적 직경의 절반보다 작아야 함
            if(roughness && roughness >= value / 2) {
                return false;
            }

            return true;
        },
        hasAnyBFlag2: function(volumeFlagsTable) {
            if (!volumeFlagsTable) return false;

            for (const row of volumeFlagsTable) {
                if (row.volumeFlags && row.volumeFlags.bFlag === "2") {
                    return true;
                }
            }

            return false;
        },
        hasAnyBoronPresent1: function(initialCondTable) {
            if (!initialCondTable) return false;

            for (const row of initialCondTable) {
                if (row.boronPresent === "1") {
                    return true;
                }
            }

            return false;
        },
        hasFFlag1: function(junctionFlagsTable, junctionNumber) {
            if (!junctionFlagsTable) return false;

            for (const row of junctionFlagsTable) {
                if (row.junctionNumber === junctionNumber && row.junctionFlags && row.junctionFlags.fFlag === "1") {
                    return true;
                }
            }

            return false;
        }
    }
};

export default PIPE;