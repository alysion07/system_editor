import React from 'react';
import { componentTypes } from '../ComponentsType.jsx';

/**
 * TMDPJUN Component Type Definition
 * 
 * This component exports the definition for the Time-Dependent Junction component
 * to be integrated into the componentTypes object.
 */
export const metaTMDPJUN = {
  type: 'TMDPJUN',
  label: 'TDJ',
  icon: 'TDJ',
  description: '시간 종속 접합부 컴포넌트는 시간이나 다른 시스템 변수에 따라 유량 조건이 변하는 접합부를 정의합니다.',
  category: 'hydro',
  ports: {
    inputs: [{ id: 'from', label: 'From' }],
    outputs: [{ id: 'to', label: 'To' }]
  },
  properties: {
    tabs: [
      {
        id: "geometry",
        label: "기하학적 데이터",
        cards: [
          {
            id: "CCC0101",
            label: "시간 종속 접합부 기하학적 데이터",
            description: "접합부의 기하학적 특성과 연결 정보를 정의합니다.",
            fields: [
              {
                id: "fromConnection",
                label: "연결 시작점 (From)",
                type: "text",
                placeholder: "예: 120010000",
                description: "접합부 좌표 방향이 시작되는 컴포넌트 연결 코드",
                helpText: "형식: CCCVV000N (CCC=컴포넌트번호, VV=체적번호, N=면번호). 시간 종속 체적에 연결할 경우 N은 1 또는 2로 제한됩니다.",
                required: true
              },
              {
                id: "toConnection",
                label: "연결 종료점 (To)",
                type: "text",
                placeholder: "예: 130000000",
                description: "접합부 좌표 방향이 끝나는 컴포넌트 연결 코드",
                helpText: "형식: CCCVV000N (CCC=컴포넌트번호, VV=체적번호, N=면번호). 시간 종속 체적에 연결할 경우 N은 1 또는 2로 제한됩니다.",
                required: true
              },
              {
                id: "junctionArea",
                label: "접합부 면적",
                type: "number",
                unit: "m², ft²",
                placeholder: "0.0",
                description: "접합부의 유동 면적",
                helpText: "0 입력 시 인접한 체적들의 최소 유동 면적으로 자동 설정됩니다. 시간 종속 접합부에는 면적 제한이 없습니다.",
                required: false,
                validation: {
                  min: 0
                }
              },
              {
                id: "eFlag",
                label: "수정된 PV항(e-flag)",
                type: "select",
                description: "에너지 방정식의 수정된 PV항 적용 여부",
                helpText: "시간 종속 접합부에서는 e-플래그만 설정 가능합니다.",
                required: true,
                default: "0",
                options: [
                  { value: "0", label: "적용 안함(0)" },
                  { value: "1", label: "적용(1)" }
                ]
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
            label: "시간 종속 접합부 데이터 제어 단어",
            description: "시간 종속 접합부의 데이터 형식과 검색 방법을 정의합니다.",
            fields: [
              {
                id: "controlWord",
                label: "제어 단어",
                type: "select",
                description: "시간 종속 데이터의 해석 방식",
                helpText: "시간 종속 데이터의 두 번째와 세 번째 단어가 속도인지 질량 유량인지 지정합니다.",
                required: true,
                default: "0",
                options: [
                  { value: "0", label: "속도(velocity) 입력" },
                  { value: "1", label: "질량 유량(mass flow) 입력" }
                ]
              },
              {
                id: "tableTrip",
                label: "테이블 트립 번호",
                type: "number",
                placeholder: "0",
                description: "시간 인자 결정에 사용되는 트립 번호",
                helpText: "0 또는 미입력 시 트립을 사용하지 않으며, 시간 인자는 진행 시간입니다.",
                required: false
              },
              {
                id: "searchVariable",
                label: "변수 요청 코드 (알파벳 부분)",
                type: "text",
                placeholder: "TIME",
                description: "테이블 검색 및 보간을 위한 검색 인자 지정",
                helpText: "트립 번호가 0인 경우 지정된 인자가 항상 사용됩니다. MFLOWJ는 검색 변수로 사용해서는 안 됩니다.",
                required: false
              },
              {
                id: "searchVarNum",
                label: "변수 요청 코드 (숫자 부분)",
                type: "number",
                placeholder: "0",
                description: "변수 요청 코드의 숫자 부분",
                helpText: "생략된 경우 0으로 간주됩니다.",
                required: false
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
            id: "CCC0201-0299",
            label: "시간 종속 접합부 데이터 테이블",
            description: "시간에 따른 접합부 유동 조건의 변화를 정의합니다.",
            fields: [
              {
                id: "timeTableData",
                label: "시간 종속 데이터",
                type: "tableEditor",
                description: "검색 변수(시간)에 따른 유동 조건 데이터",
                helpText: "각 행은 검색 변수, 액체 유동, 기체 유동, 계면 속도로 구성됩니다. 최대 5,000세트까지 입력 가능합니다.",
                required: true,
                config: {
                  columns: [
                    {
                      id: "time",
                      header: "검색 변수(시간)",
                      type: "number",
                      width: 120
                    },
                    {
                      id: "liquidFlow",
                      header: "액체 유동",
                      type: "number",
                      width: 120,
                      tooltip: "제어 단어 설정에 따라 속도(m/s, ft/s) 또는 질량 유량(kg/s, lb/s)"
                    },
                    {
                      id: "vaporFlow",
                      header: "기체 유동",
                      type: "number",
                      width: 120,
                      tooltip: "제어 단어 설정에 따라 속도(m/s, ft/s) 또는 질량 유량(kg/s, lb/s)"
                    },
                    {
                      id: "interfaceVel",
                      header: "계면 속도(m/s, ft/s)",
                      type: "number",
                      width: 120,
                      tooltip: "항상 0으로 입력(아직 구현되지 않은 기능)",
                      defaultValue: "0.0",
                      readOnly: true
                    }
                  ],
                  defaultRow: { time: "0.0", liquidFlow: "0.0", vaporFlow: "0.0", interfaceVel: "0.0" },
                  sortable: true,
                  minRows: 1,
                  maxRows: 5000
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
      return `* TMDPJUN 컴포넌트 입력\n*\n${component.number}0000  ${component.name}  TMDPJUN\n`;
    },
    formatGeometryCard: function(data) {
      // CCC0101 카드 데이터 포맷팅
      let junctionFlags = "0000000";
      if (data.eFlag === "1") {
        junctionFlags = "0100000";
      }
      
      return `${data.componentNumber}0101  ${data.fromConnection}  ${data.toConnection}  ${data.junctionArea || '0.0'}  ${junctionFlags}\n`;
    },
    formatControlWordCard: function(data) {
      // CCC0200 카드 데이터 포맷팅
      let output = `${data.componentNumber}0200  ${data.controlWord || '0'}`;

      if (data.tableTrip && data.tableTrip !== "0") {
        output += `  ${data.tableTrip}`;

        if (data.searchVariable) {
          output += `  ${data.searchVariable}  ${data.searchVarNum || '0'}`;
        }
      }

      return output + '\n';
    },
    formatTimeDataCards: function(data) {
      // CCC0201-0299 카드 데이터 포맷팅
      let output = '';
      
      if (data.timeTableData && data.timeTableData.length > 0) {
        data.timeTableData.forEach((row, i) => {
          const cardNumber = 201 + i;
          output += `${data.componentNumber}0${cardNumber}  ${row.time}  ${row.liquidFlow}  ${row.vaporFlow}  ${row.interfaceVel || '0.0'}\n`;
        });
      } else {
        // 기본 데이터 생성
        output += `${data.componentNumber}0201  0.0  0.0  0.0  0.0\n`;
      }
      
      return output;
    }
  },
  validators: {
    validateConnectionCodes: function(value) {
      // 연결 코드 형식 검증 (CCCVV000N)
      const regex = /^\d{3}(?:\d{2}000\d)?$/;
      return regex.test(value);
    },
    validateJunctionFlags: function(value) {
      // 시간 종속 접합부에서는 e-플래그(두 번째 문자)만 설정 가능
      if (value.length !== 7) return false;
      return value === "0000000" || value === "0100000";
    },
    validateTimeTableData: function(data) {
      // 시간 테이블 데이터 검증
      if (!data || data.length === 0) return false;
      
      // 검색 변수(시간)는 오름차순이어야 함
      for (let i = 1; i < data.length; i++) {
        if (parseFloat(data[i].time) < parseFloat(data[i-1].time)) {
          return false;
        }
      }
      
      return true;
    },
    validateInterfaceVelocity: function(value) {
      // 계면 속도는 항상 0이어야 함
      return parseFloat(value) === 0;
    }
  }
};

export default metaTMDPJUN;