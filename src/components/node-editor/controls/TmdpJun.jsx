import React, { useState, useEffect } from 'react';
import '../../styles/TmdpJun.css';

/**
 * TmdpJun component - Represents the Time-Dependent Junction component interface
 * @param {Object} props - Component properties
 * @param {Object} props.selectedNode - The currently selected node
 * @param {Function} props.onPropertyChange - Callback function for property changes
 */
const TmdpJun = ({ selectedNode, onPropertyChange }) => {
  // State management
  const [activeTab, setActiveTab] = useState('geometry');
  const [formValues, setFormValues] = useState({
    // Default values
    componentNumber: selectedNode?.compNumber || '',
    name: selectedNode?.compName || '',
    // CCC0101 - Junction geometry
    fromConnection: '',
    toConnection: '',
    junctionArea: '0.0',
    junctionFlags: '0000000',
    // CCC0200 - Data control word
    controlWord: '0',
    tableTrip: '0',
    searchVariable: 'TIME',
    searchVarNum: '0',
    // Time table data
    timeTableData: [{ time: '0.0', liquidFlow: '0.0', vaporFlow: '0.0', interfaceVel: '0.0' }]
  });
  
  // Update form values when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setFormValues(prev => ({
        ...prev,
        componentNumber: selectedNode.compNumber || '',
        name: selectedNode.compName || '',
        // Add other properties from selectedNode.data if needed
        ...(selectedNode.data || {})
      }));
    }
  }, [selectedNode]);

  /**
   * Handle input field changes
   * @param {string} name - Field name
   * @param {string|number} value - New field value
   */
  const handleInputChange = (name, value) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Notify parent component of change
    if (onPropertyChange && selectedNode) {
      onPropertyChange(selectedNode.id, name, value);
    }
  };

  /**
   * Handle time table data changes
   * @param {number} index - Row index
   * @param {string} field - Field name
   * @param {string|number} value - New field value
   */
  const handleTimeTableChange = (index, field, value) => {
    const updatedTable = [...formValues.timeTableData];
    updatedTable[index] = {
      ...updatedTable[index],
      [field]: value
    };
    
    setFormValues(prev => ({
      ...prev,
      timeTableData: updatedTable
    }));
    
    // Notify parent component of change
    if (onPropertyChange && selectedNode) {
      onPropertyChange(selectedNode.id, 'timeTableData', updatedTable);
    }
  };

  /**
   * Add a new row to the time table
   */
  const addTimeTableRow = () => {
    const lastRow = formValues.timeTableData[formValues.timeTableData.length - 1];
    const newTime = parseFloat(lastRow.time) + 1.0;
    
    const newRow = {
      time: newTime.toFixed(1),
      liquidFlow: lastRow.liquidFlow,
      vaporFlow: lastRow.vaporFlow,
      interfaceVel: '0.0'
    };
    
    const updatedTable = [...formValues.timeTableData, newRow];
    
    setFormValues(prev => ({
      ...prev,
      timeTableData: updatedTable
    }));
    
    // Notify parent component of change
    if (onPropertyChange && selectedNode) {
      onPropertyChange(selectedNode.id, 'timeTableData', updatedTable);
    }
  };

  /**
   * Remove a row from the time table
   * @param {number} index - Row index to remove
   */
  const removeTimeTableRow = (index) => {
    if (formValues.timeTableData.length <= 1) return;
    
    const updatedTable = formValues.timeTableData.filter((_, i) => i !== index);
    
    setFormValues(prev => ({
      ...prev,
      timeTableData: updatedTable
    }));
    
    // Notify parent component of change
    if (onPropertyChange && selectedNode) {
      onPropertyChange(selectedNode.id, 'timeTableData', updatedTable);
    }
  };

  /**
   * Generate TMDPJUN input for MARS code
   * @returns {string} Generated input text
   */
  const generateInput = () => {
    const { componentNumber, name } = formValues;
    
    // Header
    let input = `* TMDPJUN 컴포넌트 입력\n*\n`;
    input += `${componentNumber}0000  ${name}  TMDPJUN\n`;
    
    // Junction geometry
    input += `${componentNumber}0101  ${formValues.fromConnection}  ${formValues.toConnection}  ${formValues.junctionArea}  ${formValues.junctionFlags || '0000000'}\n`;
    
    // Data control word
    input += `${componentNumber}0200  ${formValues.controlWord}`;
    if (formValues.tableTrip !== '0') {
      input += `  ${formValues.tableTrip}`;
      if (formValues.searchVariable) {
        input += `  ${formValues.searchVariable}  ${formValues.searchVarNum || '0'}`;
      }
    }
    input += '\n';
    
    // Time table data
    formValues.timeTableData.forEach((row, i) => {
      const cardNumber = 201 + i;
      input += `${componentNumber}0${cardNumber}  ${row.time}  ${row.liquidFlow}  ${row.vaporFlow}  ${row.interfaceVel}\n`;
    });
    
    return input;
  };

  return (
    <div className="tmdpjun-container">
      <div className="tmdpjun-header">
        <h1 className="tmdpjun-title">시간 종속 접합부 (TMDPJUN) 컴포넌트</h1>
        <p className="tmdpjun-description">
          시간 종속 접합부 컴포넌트는 시간이나 다른 시스템 변수에 따라 유량 조건이 변하는 접합부를 정의합니다. 
          주로 경계 조건 설정에 사용됩니다.
        </p>
        
        <div className="form-group">
          <label className="field-label" htmlFor="componentNumber">컴포넌트 번호 (CCC)</label>
          <input
            type="text"
            id="componentNumber"
            className="field-input"
            value={formValues.componentNumber}
            onChange={(e) => handleInputChange('componentNumber', e.target.value)}
            placeholder="예: 190"
          />
          <div className="helper-text">세 자리 정수로 컴포넌트를 식별합니다 (001-999).</div>
        </div>
        
        <div className="form-group">
          <label className="field-label" htmlFor="name">컴포넌트 이름</label>
          <input
            type="text"
            id="name"
            className="field-input"
            value={formValues.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="예: Inlet_Flow"
          />
          <div className="helper-text">8자 이내의 고유한 컴포넌트 이름을 입력하세요.</div>
        </div>
      </div>

      <div className="tmdpjun-tabs">
        <div 
          className={`tmdpjun-tab ${activeTab === 'geometry' ? 'active' : ''}`}
          onClick={() => setActiveTab('geometry')}
        >
          기하학적 데이터
        </div>
        <div 
          className={`tmdpjun-tab ${activeTab === 'dataControl' ? 'active' : ''}`}
          onClick={() => setActiveTab('dataControl')}
        >
          데이터 제어
        </div>
        <div 
          className={`tmdpjun-tab ${activeTab === 'timeTable' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeTable')}
        >
          시간 테이블
        </div>
        <div 
          className={`tmdpjun-tab ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          입력 미리보기
        </div>
      </div>

      {activeTab === 'geometry' && (
        <div className="tab-content">
          <div className="form-section">
            <h2 className="section-title">시간 종속 접합부 기하학적 데이터 (CCC0101)</h2>
            
            <div className="info-box">
              <p>접합부의 기하학적 특성과 연결 정보를 정의합니다. 연결되는 체적을 지정하고 경계 조건 역할을 할 접합부의 특성을 설정하세요.</p>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">접합부 연결 및 기하학적 데이터</h3>
                <p className="card-description">접합부의 연결 정보와 기하학적 특성을 설정합니다.</p>
              </div>
              
              <div className="form-group">
                <label className="field-label" htmlFor="fromConnection">연결 시작점 (From)</label>
                <input
                  type="text"
                  id="fromConnection"
                  className="field-input"
                  value={formValues.fromConnection}
                  onChange={(e) => handleInputChange('fromConnection', e.target.value)}
                  placeholder="예: 120010000"
                />
                <div className="helper-text">
                  접합부 좌표 방향이 시작되는 컴포넌트 연결 코드. 형식: CCCVV000N (CCC=컴포넌트번호, VV=체적번호, N=면번호).
                  시간 종속 체적에 연결할 경우 N은 1 또는 2로 제한됩니다.
                </div>
              </div>
              
              <div className="form-group">
                <label className="field-label" htmlFor="toConnection">연결 종료점 (To)</label>
                <input
                  type="text"
                  id="toConnection"
                  className="field-input"
                  value={formValues.toConnection}
                  onChange={(e) => handleInputChange('toConnection', e.target.value)}
                  placeholder="예: 130000000"
                />
                <div className="helper-text">
                  접합부 좌표 방향이 끝나는 컴포넌트 연결 코드. 형식: CCCVV000N (CCC=컴포넌트번호, VV=체적번호, N=면번호).
                  시간 종속 체적에 연결할 경우 N은 1 또는 2로 제한됩니다.
                </div>
              </div>
              
              <div className="form-group">
                <label className="field-label" htmlFor="junctionArea">접합부 면적</label>
                <div className="input-row">
                  <input
                    type="number"
                    id="junctionArea"
                    className="field-input"
                    value={formValues.junctionArea}
                    onChange={(e) => handleInputChange('junctionArea', e.target.value)}
                    placeholder="0.0"
                    step="0.000001"
                  />
                  <span className="field-unit">m², ft²</span>
                </div>
                <div className="helper-text">
                  접합부의 유동 면적. 0 입력 시 인접한 체적들의 최소 유동 면적으로 자동 설정됩니다.
                  시간 종속 접합부에는 면적 제한이 없습니다.
                </div>
              </div>
              
              <div className="form-group">
                <label className="field-label" htmlFor="junctionFlags">접합부 제어 플래그</label>
                <input
                  type="text"
                  id="junctionFlags"
                  className="field-input"
                  value={formValues.junctionFlags}
                  onChange={(e) => handleInputChange('junctionFlags', e.target.value)}
                  placeholder="0000000"
                  maxLength={7}
                />
                <div className="helper-text">
                  형식: jefvcahs. 시간 종속 접합부에서는 e-플래그만 설정 가능합니다.
                  e=0(에너지 방정식의 수정된 PV항 미적용) 또는 e=1(적용). 허용 값: 0 또는 1000000.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dataControl' && (
        <div className="tab-content">
          <div className="form-section">
            <h2 className="section-title">시간 종속 접합부 데이터 제어 단어 (CCC0200)</h2>
            
            <div className="info-box">
              <p>시간 종속 접합부의 데이터 형식과 검색 방법을 정의합니다. 이 카드는 선택 사항이며, 
              생략할 경우 시간 종속 데이터의 두 번째와 세 번째 단어는 속도로 간주됩니다.</p>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">데이터 제어 단어 설정</h3>
                <p className="card-description">시간 종속 데이터의 형식과 검색 방법을 설정합니다.</p>
              </div>
              
              <div className="form-group">
                <label className="field-label" htmlFor="controlWord">제어 단어</label>
                <select
                  id="controlWord"
                  className="field-input"
                  value={formValues.controlWord}
                  onChange={(e) => handleInputChange('controlWord', e.target.value)}
                >
                  <option value="0">0 - 속도(velocity) 입력</option>
                  <option value="1">1 - 질량 유량(mass flow) 입력</option>
                </select>
                <div className="helper-text">
                  0: 시간 테이블의 두 번째와 세 번째 데이터가 속도(m/s, ft/s)로 해석됩니다.
                  1: 시간 테이블의 두 번째와 세 번째 데이터가 질량 유량(kg/s, lb/s)으로 해석됩니다.
                </div>
              </div>
              
              <div className="form-group">
                <label className="field-label" htmlFor="tableTrip">테이블 트립 번호</label>
                <input
                  type="text"
                  id="tableTrip"
                  className="field-input"
                  value={formValues.tableTrip}
                  onChange={(e) => handleInputChange('tableTrip', e.target.value)}
                  placeholder="0"
                />
                <div className="helper-text">
                  이 단어는 선택 사항입니다. 생략하거나 0인 경우 트립을 사용하지 않으며, 시간 인자는 진행 시간입니다.
                  0이 아니고 searchVariable이 생략된 경우, 이 값은 트립 번호가 되며, 트립이 거짓이면 시간 인자는 -1.0,
                  트립이 참이면 시간 인자는 진행 시간에서 트립 시간을 뺀 값입니다.
                </div>
              </div>
              
              <div className="form-group">
                <label className="field-label" htmlFor="searchVariable">변수 요청 코드 (알파벳 부분)</label>
                <input
                  type="text"
                  id="searchVariable"
                  className="field-input"
                  value={formValues.searchVariable}
                  onChange={(e) => handleInputChange('searchVariable', e.target.value)}
                  placeholder="TIME"
                />
                <div className="helper-text">
                  이 단어는 선택 사항입니다. 존재하는 경우, 이 단어와 다음 단어는 테이블 검색 및 보간을 위한 검색 인자를 지정하는
                  변수 요청 코드입니다. 트립 번호가 0인 경우 지정된 인자가 항상 사용됩니다. 트립 번호가 0이 아닌 경우,
                  트립이 거짓이면 -1.0E75가 사용되고, 트립이 참이면 지정된 인자가 사용됩니다.
                  TIME을 선택할 수 있지만, 이 단어가 생략된 경우와는 트립 로직이 다릅니다.
                  MFLOWJ는 검색 변수로 사용해서는 안 됩니다.
                </div>
              </div>
              
              <div className="form-group">
                <label className="field-label" htmlFor="searchVarNum">변수 요청 코드 (숫자 부분)</label>
                <input
                  type="text"
                  id="searchVarNum"
                  className="field-input"
                  value={formValues.searchVarNum}
                  onChange={(e) => handleInputChange('searchVarNum', e.target.value)}
                  placeholder="0"
                />
                <div className="helper-text">
                  생략된 경우 0으로 간주됩니다. 이 값은 변수 요청 코드의 숫자 부분입니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timeTable' && (
        <div className="tab-content">
          <div className="form-section">
            <h2 className="section-title">시간 종속 접합부 데이터 (CCC0201-0299)</h2>
            
            <div className="info-box">
              <p>시간(또는 다른 검색 변수)에 따른 접합부 유동 조건을 정의합니다. 
              데이터는 제어 단어에 따라 속도 또는 질량 유량으로 해석됩니다. 최대 5,000세트까지 입력할 수 있습니다.</p>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">시간 종속 데이터 테이블</h3>
                <p className="card-description">
                  검색 변수(예: 시간)에 따른 유동 조건의 변화를 정의합니다. 
                  데이터 형식은 제어 단어 설정에 따라 달라집니다.
                </p>
              </div>
              
              <div className="time-table-editor">
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>검색 변수(시간)</th>
                        <th>
                          {formValues.controlWord === '0' ? '액체 속도(m/s, ft/s)' : '액체 질량 유량(kg/s, lb/s)'}
                        </th>
                        <th>
                          {formValues.controlWord === '0' ? '기체 속도(m/s, ft/s)' : '기체 질량 유량(kg/s, lb/s)'}
                        </th>
                        <th>계면 속도(m/s, ft/s)</th>
                        <th>작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formValues.timeTableData.map((row, index) => (
                        <tr key={index}>
                          <td>
                            <input
                              type="number"
                              className="field-input"
                              value={row.time}
                              onChange={(e) => handleTimeTableChange(index, 'time', e.target.value)}
                              step="0.01"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="field-input"
                              value={row.liquidFlow}
                              onChange={(e) => handleTimeTableChange(index, 'liquidFlow', e.target.value)}
                              step="0.01"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="field-input"
                              value={row.vaporFlow}
                              onChange={(e) => handleTimeTableChange(index, 'vaporFlow', e.target.value)}
                              step="0.01"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="field-input"
                              value={row.interfaceVel}
                              onChange={(e) => handleTimeTableChange(index, 'interfaceVel', e.target.value)}
                              step="0.01"
                              disabled={true}
                            />
                          </td>
                          <td>
                            <button
                              className="btn btn-danger"
                              onClick={() => removeTimeTableRow(index)}
                              disabled={formValues.timeTableData.length <= 1}
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="time-table-actions" style={{ marginTop: '15px' }}>
                  <button
                    className="btn"
                    onClick={addTimeTableRow}
                  >
                    행 추가
                  </button>
                </div>
                
                <div className="info-box" style={{ marginTop: '15px' }}>
                  <p>
                    <strong>참고:</strong> 계면 속도는 항상 0으로 입력해야 합니다. 이 기능은 아직 구현되지 않았습니다.<br />
                    단상(single-phase) 문제에서 속도를 입력할 때는 액체와 기체 속도에 동일한 값을 입력해야 합니다.<br />
                    질량 유량을 입력할 때는 모델링하는 단상(액체 또는 기체)에 맞는 값을 입력하고 다른 쪽에는 0을 입력해야 합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="tab-content">
          <div className="form-section">
            <h2 className="section-title">MARS 입력 미리보기</h2>
            
            <div className="info-box">
              <p>입력한 데이터를 바탕으로 생성된 MARS 입력 코드입니다. 이 코드를 복사하여 MARS 입력 파일에 추가할 수 있습니다.</p>
            </div>
            
            <div className="preview-container">
              <pre className="code-preview">
                {generateInput()}
              </pre>
              
              <button
                className="btn"
                onClick={() => {
                  navigator.clipboard.writeText(generateInput());
                  alert('입력 코드가 클립보드에 복사되었습니다.');
                }}
                style={{ marginTop: '15px' }}
              >
                코드 복사
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TmdpJun;