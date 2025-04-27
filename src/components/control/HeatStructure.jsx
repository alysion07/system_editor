import React, { useState, useEffect, useRef } from 'react';
import './../../styles/HeatStructure.css';

// 메인 애플리케이션 컴포넌트
const HeatStructure = ({selectedNode}) => {
  // 탭 상태 관리
  const [activeTab, setActiveTab] = useState('general');

  return (
      <div className="heat-structure">
        <div className="container">
          <header className="header">
            <h1 className="header-title">MARS 열구조체 입력 인터페이스</h1>
          </header>

          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="content-container">
            {activeTab === 'general' && <GeneralDataTab selectedNode = {selectedNode}/> }
            {activeTab === 'mesh' && <MeshDataTab />}
            {activeTab === 'material' && <MaterialDataTab />}
            {activeTab === 'boundary' && <BoundaryConditionTab />}
            {activeTab === 'generate' && <GenerateInputTab />}
          </div>
        </div>
      </div>
  );
};

// 탭 네비게이션 컴포넌트
const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'general', label: '일반 데이터' },
    { id: 'mesh', label: '메시 데이터' },
    { id: 'material', label: '열물성 데이터' },
    { id: 'boundary', label: '경계 조건' },
    { id: 'generate', label: '입력 생성' }
  ];

  return (
      <div className="tabs">
        {tabs.map(tab => (
            <div
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </div>
        ))}
      </div>
  );
};

// 일반 데이터 탭 컴포넌트
const GeneralDataTab = ({selectedNode}) => {
  const [refloodFlag, setRefloodFlag] = useState('0');

  return (
      <div className="tab-content">
        <h2 className="section-title">열구조체 일반 데이터 (1CCCG000)</h2>

        <div className="info-box">
          <p>열구조체의 기본 매개변수를 정의합니다. 구조체 번호(CCC)와 기하학 번호(G)를 선택하고 기본 속성을 설정하세요.</p>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="heat-structure-number">
            열구조체 번호 (1CCC)
          </label>
          <input
              type="number"
              id="heat-structure-number"
              className="field-input"
              min="1"
              max="999"
              defaultValue= "000"
              value={selectedNode ? selectedNode.compNumber: "1000"}
          />
          <div className="helper-text">1000-1999 사이의 값을 입력하세요. 가능하면 관련 유체 볼륨과 일치시키는 것을 권장합니다.</div>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="geometry-number">
            기하학 번호 (G)
          </label>
          <input
              type="number"
              id="geometry-number"
              className="field-input"
              min="1"
              max="9"
              defaultValue="1"
          />
          <div className="helper-text">1-9 사이의 값을 입력하세요. 이는 동일한 유체 볼륨과 연관된 다른 유형의 열구조체를 구분합니다.</div>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="axial-structures">
            축방향 열구조체 수 (nh)
          </label>
          <input
              type="number"
              id="axial-structures"
              className="field-input"
              min="1"
              max="99"
              defaultValue="1"
          />
          <div className="helper-text">이 기하학을 가진 축방향 열구조체의 수를 입력하세요 (최대 99).</div>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="radial-points">
            반경 방향 메시 포인트 수 (np)
          </label>
          <input
              type="number"
              id="radial-points"
              className="field-input"
              min="2"
              max="99"
              defaultValue="2"
          />
          <div className="helper-text">반경 방향 메시 포인트의 수를 입력하세요. 리플러드(reflood)가 없으면 &gt;1, 있으면 &gt;2.</div>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="geometry-type">
            기하학 유형
          </label>
          <select
              id="geometry-type"
              className="field-input"
              defaultValue="2"
          >
            <option value="1">직사각형 (Rectangular)</option>
            <option value="2">원통형 (Cylindrical)</option>
            <option value="3">구형 (Spherical)</option>
          </select>
          <div className="helper-text">구조체의 기하학적 형태를 선택하세요. 갭 전도 모델을 사용할 경우 원통형을 선택해야 합니다.</div>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="steady-state-flag">
            정상상태 초기화 플래그
          </label>
          <select
              id="steady-state-flag"
              className="field-input"
              defaultValue="0"
          >
            <option value="0">사용자 정의 온도 (0)</option>
            <option value="1">코드 계산 온도 (1)</option>
          </select>
          <div className="helper-text">초기 온도 조건을 사용자가 입력할지 코드가 계산할지 선택하세요.</div>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="left-coordinate">
            좌측 경계 좌표 (m)
          </label>
          <input
              type="number"
              id="left-coordinate"
              className="field-input"
              step="0.001"
              defaultValue="0.0"
          />
          <div className="helper-text">열구조체의 좌측 경계 좌표를 입력하세요 (미터).</div>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="reflood-flag">
            리플러드 조건 플래그
          </label>
          <select
              id="reflood-flag"
              className="field-input"
              value={refloodFlag}
              onChange={(e) => setRefloodFlag(e.target.value)}
          >
            <option value="0">리플러드 계산 없음 (0)</option>
            <option value="1">거의 빈 상태일 때 시작 (1)</option>
            <option value="2">건조 시작 시 시작 (2)</option>
            <option value="trip">트립 번호 지정</option>
          </select>
          <div className="helper-text">리플러드 계산이 시작되는 조건을 선택하세요.</div>
        </div>

        {refloodFlag === 'trip' && (
            <div className="form-group">
              <label className="field-label" htmlFor="trip-number">
                트립 번호
              </label>
              <input
                  type="number"
                  id="trip-number"
                  className="field-input"
                  min="1"
                  defaultValue="501"
              />
              <div className="helper-text">리플러드 계산을 시작하는 트립 번호를 입력하세요.</div>
            </div>
        )}
      </div>
  );
};

// 메시 데이터 탭 컴포넌트
const MeshDataTab = () => {
  const [meshFormat, setMeshFormat] = useState('1');
  const [meshRows, setMeshRows] = useState([
    { id: 1, intervals: 1, rightCoord: 0.001, composition: '3' }
  ]);
  const [format2Rows, setFormat2Rows] = useState([
    { id: 1, interval: 0.001, composition: '3' }
  ]);
  const canvasRef = useRef(null);

  // 메시 행 추가 함수
  const addMeshRow = () => {
    if (meshFormat === '1') {
      const lastRow = meshRows[meshRows.length - 1];
      const newRow = {
        id: lastRow.id + 1,
        intervals: 1,
        rightCoord: parseFloat(lastRow.rightCoord) + 0.001,
        composition: '3'
      };
      setMeshRows([...meshRows, newRow]);
    } else {
      const lastRow = format2Rows[format2Rows.length - 1];
      const newRow = {
        id: lastRow.id + 1,
        interval: 0.001,
        composition: '3'
      };
      setFormat2Rows([...format2Rows, newRow]);
    }
  };

  // 메시 행 삭제 함수
  const removeMeshRow = (id) => {
    if (meshFormat === '1') {
      if (meshRows.length > 1) {
        setMeshRows(meshRows.filter(row => row.id !== id));
      }
    } else {
      if (format2Rows.length > 1) {
        setFormat2Rows(format2Rows.filter(row => row.id !== id));
      }
    }
  };

  // 메시 시각화 업데이트
  const updateMeshVisualization = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const leftCoord = 0.0; // 나중에 실제 값으로 수정

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let meshPoints = [];
    let compositions = [];

    if (meshFormat === '1') {
      // 왼쪽 경계
      meshPoints.push(leftCoord);

      // 각 영역에 대한 메시 포인트 생성
      let currentCoord = leftCoord;
      meshRows.forEach(row => {
        const intervals = parseInt(row.intervals) || 1;
        const rightCoord = parseFloat(row.rightCoord) || currentCoord + 0.001;

        const interval = (rightCoord - currentCoord) / intervals;
        for (let i = 1; i <= intervals; i++) {
          currentCoord += interval;
          meshPoints.push(currentCoord);
          compositions.push(row.composition);
        }
      });
    } else {
      // 왼쪽 경계
      meshPoints.push(leftCoord);

      // 각 간격에 대한 메시 포인트 생성
      let currentCoord = leftCoord;
      format2Rows.forEach(row => {
        const interval = parseFloat(row.interval) || 0.001;

        currentCoord += interval;
        meshPoints.push(currentCoord);
        compositions.push(row.composition);
      });
    }

    // 시각화 그리기
    const height = canvas.height;
    const width = canvas.width;
    const padding = 40;
    const effectiveWidth = width - 2 * padding;

    // 메시 범위 결정
    const minCoord = meshPoints[0];
    const maxCoord = meshPoints[meshPoints.length - 1];
    const range = maxCoord - minCoord;

    // 축 그리기
    ctx.beginPath();
    ctx.moveTo(padding, height / 2);
    ctx.lineTo(width - padding, height / 2);
    ctx.stroke();

    // 눈금 그리기
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let i = 0; i < meshPoints.length; i++) {
      const x = padding + (meshPoints[i] - minCoord) * effectiveWidth / range;

      ctx.beginPath();
      ctx.moveTo(x, height / 2 - 10);
      ctx.lineTo(x, height / 2 + 10);
      ctx.stroke();

      ctx.fillText(meshPoints[i].toFixed(4), x, height / 2 + 15);
    }

    // 구성 영역 표시
    for (let i = 0; i < meshPoints.length - 1; i++) {
      const x1 = padding + (meshPoints[i] - minCoord) * effectiveWidth / range;
      const x2 = padding + (meshPoints[i + 1] - minCoord) * effectiveWidth / range;

      // 구성에 따른 색상
      let color;
      switch (compositions[i]) {
        case '1': color = '#FFD700'; break; // 지르코늄: 금색
        case '2': color = '#B0E0E6'; break; // 갭: 연한 청색
        case '3': color = '#A0522D'; break; // UO2: 갈색
        case '4': color = '#C0C0C0'; break; // 스테인리스 스틸: 은색
        case '5': color = '#708090'; break; // 탄소강: 회색
        default: color = '#E0E0E0'; break;  // 기타: 연한 회색
      }

      ctx.fillStyle = color;
      ctx.fillRect(x1, height / 2 - 30, x2 - x1, 60);

      // 경계선
      ctx.strokeStyle = '#000';
      ctx.strokeRect(x1, height / 2 - 30, x2 - x1, 60);

      // 구성 번호 표시
      ctx.fillStyle = '#000';
      ctx.fillText(compositions[i], (x1 + x2) / 2, height / 2 - 25);
    }
  };

  // 메시 시각화 효과
  useEffect(() => {
    updateMeshVisualization();
  }, [meshFormat, meshRows, format2Rows]);

  // 메시 입력 필드 변경 핸들러
  const handleMeshRowChange = (id, field, value) => {
    if (meshFormat === '1') {
      setMeshRows(meshRows.map(row =>
          row.id === id ? { ...row, [field]: value } : row
      ));
    } else {
      setFormat2Rows(format2Rows.map(row =>
          row.id === id ? { ...row, [field]: value } : row
      ));
    }
  };

  return (
      <div className="tab-content">
        <h2 className="section-title">메시 데이터 설정</h2>

        <div className="info-box">
          <p>반경 방향 메시 간격과 각 영역의 구성 번호(composition)를 정의합니다. 메시 간격은 구조체의 왼쪽에서 오른쪽까지 모든 영역을 정의해야 합니다.</p>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="mesh-format">
            메시 형식 플래그
          </label>
          <select
              id="mesh-format"
              className="field-input"
              value={meshFormat}
              onChange={(e) => setMeshFormat(e.target.value)}
          >
            <option value="1">형식 1 (영역 수 + 우측 경계)</option>
            <option value="2">형식 2 (메시 간격 순차 확장)</option>
          </select>
          <div className="helper-text">메시 간격 데이터의 입력 형식을 선택하세요.</div>
        </div>

        {meshFormat === '1' ? (
            <div>
              <h3 className="sub-section-title">형식 1 메시 간격 (1CCCG101-G199)</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                  <tr>
                    <th>영역 번호</th>
                    <th>간격 수</th>
                    <th>우측 좌표 (m)</th>
                    <th>구성 번호</th>
                    <th>작업</th>
                  </tr>
                  </thead>
                  <tbody>
                  {meshRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>
                          <input
                              type="number"
                              className="field-input"
                              min="1"
                              value={row.intervals}
                              onChange={(e) => handleMeshRowChange(row.id, 'intervals', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                              type="number"
                              className="field-input"
                              step="0.001"
                              value={row.rightCoord}
                              onChange={(e) => handleMeshRowChange(row.id, 'rightCoord', e.target.value)}
                          />
                        </td>
                        <td>
                          <select
                              className="field-input"
                              value={row.composition}
                              onChange={(e) => handleMeshRowChange(row.id, 'composition', e.target.value)}
                          >
                            <option value="3">3 (UO2)</option>
                            <option value="2">2 (갭)</option>
                            <option value="1">1 (지르코늄)</option>
                            <option value="4">4 (스테인리스 스틸)</option>
                            <option value="5">5 (탄소강)</option>
                            <option value="custom">사용자 정의...</option>
                          </select>
                        </td>
                        <td>
                          <button
                              className="btn"
                              onClick={() => removeMeshRow(row.id)}
                              disabled={meshRows.length === 1}
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
              <button
                  className="btn"
                  onClick={addMeshRow}
              >
                영역 추가
              </button>
            </div>
        ) : (
            <div>
              <h3 className="sub-section-title">형식 2 메시 간격 (1CCCG101-G199)</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                  <tr>
                    <th>간격 번호</th>
                    <th>메시 간격 (m)</th>
                    <th>구성 번호</th>
                    <th>작업</th>
                  </tr>
                  </thead>
                  <tbody>
                  {format2Rows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>
                          <input
                              type="number"
                              className="field-input"
                              step="0.001"
                              value={row.interval}
                              onChange={(e) => handleMeshRowChange(row.id, 'interval', e.target.value)}
                          />
                        </td>
                        <td>
                          <select
                              className="field-input"
                              value={row.composition}
                              onChange={(e) => handleMeshRowChange(row.id, 'composition', e.target.value)}
                          >
                            <option value="3">3 (UO2)</option>
                            <option value="2">2 (갭)</option>
                            <option value="1">1 (지르코늄)</option>
                            <option value="4">4 (스테인리스 스틸)</option>
                            <option value="5">5 (탄소강)</option>
                            <option value="custom">사용자 정의...</option>
                          </select>
                        </td>
                        <td>
                          <button
                              className="btn"
                              onClick={() => removeMeshRow(row.id)}
                              disabled={format2Rows.length === 1}
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
              <button
                  className="btn"
                  onClick={addMeshRow}
              >
                간격 추가
              </button>
            </div>
        )}

        <div className="mesh-visualizer">
          <h3 className="sub-section-title">메시 시각화</h3>
          <canvas
              ref={canvasRef}
              className="mesh-canvas"
              width={600}
              height={150}
          />
          <div className="mesh-labels">
            <span id="left-label">0.0</span>
            <span id="right-label">
            {meshFormat === '1'
                ? meshRows.length > 0 ? meshRows[meshRows.length - 1].rightCoord : '0.0'
                : format2Rows.reduce((sum, row) => sum + parseFloat(row.interval || 0), 0).toFixed(4)}
          </span>
          </div>
          <button
              className="btn"
              onClick={updateMeshVisualization}
          >
            시각화 업데이트
          </button>
        </div>
      </div>
  );
};

// 열물성 데이터 탭 컴포넌트
const MaterialDataTab = () => {
  const [activeComposition, setActiveComposition] = useState('3');
  const [materialType, setMaterialType] = useState({
    '1': 'ZR',
    '2': 'TBL/FCTN',
    '3': 'UO2'
  });
  const [gasRows, setGasRows] = useState([
    { id: 1, gasName: 'HELIUM', moleFraction: 1.0 }
  ]);

  // 기체 행 추가 함수
  const addGasRow = () => {
    const newId = gasRows.length + 1;
    setGasRows([...gasRows, { id: newId, gasName: 'ARGON', moleFraction: 0.5 }]);
  };

  // 기체 행 삭제 함수
  const removeGasRow = (id) => {
    if (gasRows.length > 1) {
      setGasRows(gasRows.filter(row => row.id !== id));
    }
  };

  // 기체 행 변경 핸들러
  const handleGasRowChange = (id, field, value) => {
    setGasRows(gasRows.map(row =>
        row.id === id ? { ...row, [field]: value } : row
    ));
  };

  // 새 구성 추가 함수
  const addNewComposition = () => {
    const newId = String(Object.keys(materialType).length + 1);
    setMaterialType({
      ...materialType,
      [newId]: 'TBL/FCTN'
    });
    setActiveComposition(newId);
  };

  return (
      <div className="tab-content">
        <h2 className="section-title">열물성 데이터 (201MMM00-99)</h2>

        <div className="info-box">
          <p>구성 번호(MMM)에 대한 열물성을 정의합니다. 각 구성 번호에 대해 열전도도와 체적 열용량 데이터를 설정하세요.</p>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="composition-selection">
            구성 번호(MMM) 선택
          </label>
          <div className="input-group">
            <select
                id="composition-selection"
                className="field-input"
                value={activeComposition}
                onChange={(e) => setActiveComposition(e.target.value)}
            >
              {Object.keys(materialType).map((id) => (
                  <option key={id} value={id}>
                    구성 {id} {id === '1' ? '(지르코늄)' : id === '2' ? '(갭)' : id === '3' ? '(UO2)' : ''}
                  </option>
              ))}
            </select>
            <button
                className="btn"
                onClick={addNewComposition}
            >
              새 구성 추가
            </button>
          </div>
        </div>

        <div>
          {Object.keys(materialType).map((id) => (
              <div key={id} className={`material-properties ${activeComposition === id ? 'active' : ''}`}>
                <div className="form-group">
                  <label className="field-label" htmlFor={`material-type-${id}`}>
                    재료 유형
                  </label>
                  <select
                      id={`material-type-${id}`}
                      className="field-input"
                      value={materialType[id]}
                      onChange={(e) => setMaterialType({...materialType, [id]: e.target.value})}
                  >
                    {id === '1' ? (
                        <option value="ZR">지르코늄 (ZR)</option>
                    ) : id === '2' ? (
                        <option value="TBL/FCTN">사용자 정의 테이블/함수 (TBL/FCTN)</option>
                    ) : id === '3' ? (
                        <option value="UO2">이산화 우라늄 (UO2)</option>
                    ) : (
                        <>
                          <option value="TBL/FCTN">사용자 정의 테이블/함수 (TBL/FCTN)</option>
                          <option value="ZR">지르코늄 (ZR)</option>
                          <option value="UO2">이산화 우라늄 (UO2)</option>
                        </>
                    )}
                    <option value="C-STEEL">탄소강 (C-STEEL)</option>
                    <option value="S-STEEL">스테인리스 스틸 (S-STEEL)</option>
                  </select>
                </div>

                {materialType[id] === 'TBL/FCTN' && (
                    <>
                      {id === '2' ? (
                          // 갭 몰 분율 테이블
                          <div>
                            <h3 className="sub-section-title">갭 몰 분율 (201MMM01-49)</h3>
                            <table className="data-table">
                              <thead>
                              <tr>
                                <th>기체 성분</th>
                                <th>몰 분율</th>
                                <th>작업</th>
                              </tr>
                              </thead>
                              <tbody>
                              {gasRows.map((row) => (
                                  <tr key={row.id}>
                                    <td>
                                      <select
                                          className="field-input"
                                          value={row.gasName}
                                          onChange={(e) => handleGasRowChange(row.id, 'gasName', e.target.value)}
                                      >
                                        <option value="HELIUM">헬륨 (HELIUM)</option>
                                        <option value="ARGON">아르곤 (ARGON)</option>
                                        <option value="KRYPTON">크립톤 (KRYPTON)</option>
                                        <option value="XENON">제논 (XENON)</option>
                                        <option value="NITROGEN">질소 (NITROGEN)</option>
                                        <option value="HYDROGEN">수소 (HYDROGEN)</option>
                                        <option value="OXYGEN">산소 (OXYGEN)</option>
                                      </select>
                                    </td>
                                    <td>
                                      <input
                                          type="number"
                                          className="field-input"
                                          min="0"
                                          max="1"
                                          step="0.01"
                                          value={row.moleFraction}
                                          onChange={(e) => handleGasRowChange(row.id, 'moleFraction', e.target.value)}
                                      />
                                    </td>
                                    <td>
                                      <button
                                          className="btn"
                                          onClick={() => removeGasRow(row.id)}
                                          disabled={gasRows.length === 1}
                                      >
                                        삭제
                                      </button>
                                    </td>
                                  </tr>
                              ))}
                              </tbody>
                            </table>
                            <button
                                className="btn"
                                onClick={addGasRow}
                            >
                              기체 추가
                            </button>
                          </div>
                      ) : (
                          // 일반 테이블/함수 정의
                          <div className="warning-box">
                            <p>사용자 정의 테이블 또는 함수를 사용하려면 추가 설정이 필요합니다.</p>
                          </div>
                      )}
                    </>
                )}
              </div>
          ))}
        </div>
      </div>
  );
};

// 경계 조건 탭 컴포넌트
const BoundaryConditionTab = () => {
  return (
      <div className="tab-content">
        <h2 className="section-title">경계 조건 (1CCCG501-G699)</h2>

        <div className="info-box">
          <p>열구조체의 좌측 및 우측 경계 조건을 정의합니다. 경계 볼륨, 경계 조건 유형, 그리고 표면적을 설정하세요.</p>
        </div>

        <h3 className="sub-section-title">좌측 경계 조건 (1CCCG501-599)</h3>
        <div className="form-group">
          <label className="field-label" htmlFor="left-volume">
            좌측 경계 볼륨 번호
          </label>
          <input
              type="text"
              id="left-volume"
              className="field-input"
              placeholder="예: CCCNN000F"
              defaultValue="0"
          />
          <div className="helper-text">형식: CCCNN000F, 0 입력시 대칭/단열 경계 조건 적용</div>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="left-increment">
            볼륨 번호 증분
          </label>
          <input
              type="number"
              id="left-increment"
              className="field-input"
              defaultValue="10000"
          />
          <div className="helper-text">여러 열구조체에 대한 볼륨 번호 증분값</div>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="left-bc-type">
            좌측 경계 조건 유형
          </label>
          <select
              id="left-bc-type"
              className="field-input"
              defaultValue="1"
          >
            <option value="0">대칭/단열 (0)</option>
            <option value="1">대류 - 기본 (1)</option>
            <option value="101">대류 - 권장 기본 (101)</option>
            <option value="110">수직 다발 - 교차유동 없음 (110)</option>
            <option value="111">수직 다발 - 교차유동 있음 (111)</option>
            <option value="1000">표면 온도 (1000)</option>
            <option value="table-temp">테이블 온도 (1xxx)</option>
            <option value="table-flux">테이블 열유속 (2xxx)</option>
            <option value="table-htc-time">시간 함수 열전달계수 (3xxx)</option>
            <option value="table-htc-temp">온도 함수 열전달계수 (4xxx)</option>
          </select>
          <div className="helper-text">열구조체 좌측 경계의 열전달 조건</div>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="left-area-code">
            좌측 표면적 코드
          </label>
          <select
              id="left-area-code"
              className="field-input"
              defaultValue="0"
          >
            <option value="0">직접 표면적 입력 (0)</option>
            <option value="1">기하학 기반 계산 (1)</option>
          </select>
          <div className="helper-text">표면적을 직접 입력할지, 기하학적 형태에 따라 계산할지 선택</div>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="left-area">
            좌측 표면적 또는 인자 (m²)
          </label>
          <input
              type="number"
              id="left-area"
              className="field-input"
              step="0.001"
              defaultValue="0.12"
          />
          <div className="helper-text">표면적 코드에 따라 직접 표면적 또는 기하학적 인자 입력</div>
        </div>

        <h3 className="sub-section-title">우측 경계 조건 (1CCCG601-G699)</h3>
        <div className="form-group">
          <label className="field-label" htmlFor="right-volume">
            우측 경계 볼륨 번호
          </label>
          <input
              type="text"
              id="right-volume"
              className="field-input"
              placeholder="예: -500"
              defaultValue="-500"
          />
          <div className="helper-text">양수: 볼륨 번호, 음수: 일반 테이블 번호, 0: 대칭/단열</div>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="right-increment">
            볼륨 번호 증분
          </label>
          <input
              type="number"
              id="right-increment"
              className="field-input"
              defaultValue="0"
          />
          <div className="helper-text">여러 열구조체에 대한 볼륨 번호 증분값</div>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="right-bc-type">
            우측 경계 조건 유형
          </label>
          <select
              id="right-bc-type"
              className="field-input"
              defaultValue="table-temp"
          >
            <option value="0">대칭/단열 (0)</option>
            <option value="1">대류 - 기본 (1)</option>
            <option value="101">대류 - 권장 기본 (101)</option>
            <option value="110">수직 다발 - 교차유동 없음 (110)</option>
            <option value="111">수직 다발 - 교차유동 있음 (111)</option>
            <option value="1000">표면 온도 (1000)</option>
            <option value="table-temp">테이블 온도 (1xxx)</option>
            <option value="table-flux">테이블 열유속 (2xxx)</option>
            <option value="table-htc-time">시간 함수 열전달계수 (3xxx)</option>
            <option value="table-htc-temp">온도 함수 열전달계수 (4xxx)</option>
          </select>
          <div className="helper-text">열구조체 우측 경계의 열전달 조건</div>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="right-area-code">
            우측 표면적 코드
          </label>
          <select
              id="right-area-code"
              className="field-input"
              defaultValue="0"
          >
            <option value="0">직접 표면적 입력 (0)</option>
            <option value="1">기하학 기반 계산 (1)</option>
          </select>
          <div className="helper-text">표면적을 직접 입력할지, 기하학적 형태에 따라 계산할지 선택</div>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="right-area">
            우측 표면적 또는 인자 (m²)
          </label>
          <input
              type="number"
              id="right-area"
              className="field-input"
              step="0.001"
              defaultValue="0.12"
          />
          <div className="helper-text">표면적 코드에 따라 직접 표면적 또는 기하학적 인자 입력</div>
        </div>

        <h3 className="sub-section-title">열원 데이터 (1CCCG701-G799)</h3>
        <div className="form-group">
          <label className="field-label" htmlFor="source-type">
            열원 유형
          </label>
          <select
              id="source-type"
              className="field-input"
              defaultValue="0"
          >
            <option value="0">열원 없음 (0)</option>
            <option value="table">일반 테이블 (&lt;1000)</option>
            <option value="1000">총 원자로 출력 (1000)</option>
            <option value="1001">총 붕괴 출력 (1001)</option>
            <option value="1002">핵분열 출력 (1002)</option>
            <option value="1003">핵분열 생성물 출력 (1003)</option>
            <option value="1004">악티늄 붕괴 출력 (1004)</option>
            <option value="control">제어 변수 (10001-19999)</option>
          </select>
          <div className="helper-text">열구조체의 내부 열원 유형</div>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="source-multiplier">
            내부 열원 승수
          </label>
          <input
              type="number"
              id="source-multiplier"
              className="field-input"
              step="0.01"
              defaultValue="0.1"
          />
          <div className="helper-text">축방향 피킹 인자 등 열원 승수</div>
        </div>
      </div>
  );
};

// 입력 생성 탭 컴포넌트
const GenerateInputTab = () => {
  const [generatedInput, setGeneratedInput] = useState('* 생성하기 버튼을 클릭하여 MARS 입력 텍스트를 생성하세요.');
  const [notification, setNotification] = useState(false);

  // 입력 파일 생성 함수
  const generateInputText = () => {
    // 여기서는 간단한 예시만 생성합니다
    const inputText = `*
* 열구조체 정의 (Heat Structure Definition)
*
* 열구조체 일반 데이터 (1CCCG000)
11301000  10     2    2    0    0.0
*
* 메시 플래그 (1CCCG100)
11301100  0      1
*
* 메시 간격 - 형식 1 (1CCCG101-G199)
11301101  1    0.001
*
* 열구조체 구성 데이터 (1CCCG201-G299)
11301201  3    1
*
* 좌측 경계 조건 (1CCCG501-599)
11301501  150010000  10000  100   0    0.12   1
11301502  0  0  0  0  0  2
...
11301510  0  0  0  0  0  10
*
* 우측 경계 조건 (1CCCG601-G699)
11301601  -500           0  1500   0    0.12   1
11301602  0  0  0  0  0  2
...
11301610  0  0  0  0  0  10
*
* 열원 데이터 (1CCCG701-G799)
11301701  0   0.1   0.     0.   1
11301702  0   0.1   0.     0.   2
...
11301710  0   0.1   0.     0.   10
*
* 열구조체 열물성 데이터 (201MMM00-99)
*
* 구성 3 - UO2 (Uranium Dioxide)
2010300   UO2
*`;

    setGeneratedInput(inputText);
  };

  // 클립보드에 복사 함수
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedInput).then(() => {
      setNotification(true);
      setTimeout(() => setNotification(false), 3000);
    });
  };

  return (
      <div className="tab-content">
        <h2 className="section-title">MARS 입력 파일 생성</h2>

        <div className="info-box">
          <p>입력한 설정을 바탕으로 MARS 입력 파일 형식의 텍스트를 생성합니다. 생성된 텍스트를 복사하여 MARS 입력 파일에 추가하세요.</p>
        </div>

        <button
            className="btn btn-success"
            onClick={generateInputText}
        >
          입력 파일 생성
        </button>

        <div className="result-section">
          <h3 className="sub-section-title">생성된 MARS 입력</h3>
          <pre className="generated-input">
          {generatedInput}
        </pre>
          <button
              className="btn"
              onClick={copyToClipboard}
          >
            클립보드에 복사
          </button>
        </div>

        {notification && (
            <div className="notification show">
              텍스트가 클립보드에 복사되었습니다.
            </div>
        )}
      </div>
  );
};

export default HeatStructure;