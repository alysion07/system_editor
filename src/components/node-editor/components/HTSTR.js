const HTSTR = {
    type: 'HTSTR',
    label: 'HS',
    description: '열구조체는 고체 재료 내부의 1차원 열전달을 모델링합니다.',
    category: 'thermal',
    icon: 'HS',
    ports: {
        // ... 포트 정의 ...
    },
    properties: {
        tabs: [
            // 메시 데이터 탭
            {
                id: "mesh",
                label: "메시 데이터",
                cards: [
                    {
                        id: "meshData",
                        label: "메시 간격 정의",
                        fields: [
                            {
                                id: "meshVisualizer",
                                label: "메시 시각화",
                                type: "meshVisualizer", // 특수 필드 타입
                                description: "반경 방향 메시 간격과 구성을 시각적으로 정의합니다",
                                required: true,
                                compositions: [
                                    { id: "1", name: "지르코늄 (Zircaloy)" },
                                    { id: "2", name: "갭 (Gas Gap)" },
                                    { id: "3", name: "UO2 (Uranium Dioxide)" },
                                    { id: "4", name: "S-STEEL (Stainless Steel)" },
                                    { id: "5", name: "C-STEEL (Carbon Steel)" }
                                ]
                            }
                        ]
                    }
                ]
            },
            // 열물성 데이터 탭
            {
                id: "thermal",
                label: "열물성 데이터",
                cards: [
                    {
                        id: "thermalConductivity",
                        label: "열전도도 테이블",
                        fields: [
                            {
                                id: "conductivityTable",
                                label: "온도-열전도도 테이블",
                                type: "tableEditor", // 특수 필드 타입
                                description: "온도에 따른 열전도도 값을 정의합니다",
                                required: true,
                                config: {
                                    xAxisLabel: "온도",
                                    yAxisLabel: "열전도도",
                                    xAxisUnit: "K",
                                    yAxisUnit: "W/m·K",
                                    minRows: 2,
                                    maxRows: 50,
                                    sortByX: true,
                                    xMin: 273
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    // ... 포맷터와 검증기 ...
    formatters: {
        // 기존 포맷터...
        formatMeshData: function(data) {
            let output = '';

            // 메시 플래그 카드
            output += `${data.number}0100  0      ${data.meshFormat}\n`;

            // 메시 간격 데이터
            if (data.meshFormat === '1') {
                // 형식 1: 영역 수 + 우측 경계
                data.meshData.forEach((region, index) => {
                    output += `${data.number}0${101 + index}  ${region.intervals || 1}    ${region.rightCoord}\n`;
                });
            } else {
                // 형식 2: 메시 간격
                data.meshData.forEach((region, index) => {
                    output += `${data.number}0${101 + index}  ${region.interval}    ${index + 1}\n`;
                });
            }

            // 구성 데이터
            let intervalCount = 0;
            data.meshData.forEach((region, index) => {
                const intervals = parseInt(region.intervals) || 1;
                for (let i = 0; i < intervals; i++) {
                    intervalCount++;
                    output += `${data.number}0${201 + intervalCount - 1}  ${region.composition}    ${intervalCount}\n`;
                }
            });

            return output;
        },

        formatThermalProperty: function(data) {
            let output = '';

            // 열물성 헤더 카드
            output += `2010${data.composition}00   ${data.materialType}\n`;

            if (data.materialType === 'TBL/FCTN') {
                // 열전도도 테이블 포맷팅
                output += `* 온도-열전도도 테이블\n`;
                data.conductivityTable.forEach((row, index) => {
                    output += `2010${data.composition}${String(index + 1).padStart(2, '0')}    ${row.x}    ${row.y}\n`;
                });

                // 체적 열용량 테이블 포맷팅
                output += `* 온도-체적 열용량 테이블\n`;
                data.heatCapacityTable.forEach((row, index) => {
                    output += `2010${data.composition}${String(index + 51).padStart(2, '0')}    ${row.x}    ${row.y}\n`;
                });
            }

            return output;
        }
    },
};

export default HTSTR;