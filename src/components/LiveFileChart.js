import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';

// === Data Structure ===
// 파일 헤더와 매칭되는 센서 키 목록
const headers = [
    'time',
    'mflowj1','mflowj2','mflowj3',
    'tempf1','tempf2','tempf3','tempf4','tempf5','tempf6','tempf7','tempf8','tempf9','tempf10','tempf11','tempf12','tempf13','tempf14',
    'p1','p2',
    'voidg1','voidg2','voidg3','voidg4','voidg5','voidg6','voidg7','voidg8','voidg9','voidg10','voidg11','voidg12',
    'httemp1','httemp2','httemp3','httemp4',
    'hthtc1','hthtc2','hthtc3','hthtc4','hthtc5','hthtc6','hthtc7','hthtc8','hthtc9','hthtc10',
    // 'cntrlvar'
];

const groups = {
    mflowj: ['mflowj1','mflowj2','mflowj3'],
    tempf0: ['tempf1','tempf2'],
    tempf: ['tempf3','tempf4','tempf5','tempf6','tempf7','tempf8','tempf9','tempf10','tempf11','tempf12','tempf13','tempf14'],
    p: ['p1','p2'],
    voidg: ['voidg1','voidg2','voidg3','voidg4','voidg5','voidg6','voidg7','voidg8','voidg9','voidg10','voidg11','voidg12'],
    httemp: ['httemp1','httemp2','httemp3','httemp4'],
    hthtc: ['hthtc1','hthtc2','hthtc3','hthtc4','hthtc5','hthtc6','hthtc7','hthtc8','hthtc9','hthtc10'],
    // cntrlvar: ['cntrlvar']
};

/**
 * 라인 문자열을 DataPoint 객체로 변환
 * - CSV(comma-separated) 또는 공백 구분 모두 지원
 *
 * @param {string} line  서버로부터 전달된 한 줄의 데이터
 * @returns {Object}      { time, mflowj1, ..., cntrlvar } 형태의 데이터 포인트
 */
function parseLine(line) {
    // 1) 줄 끝 공백 제거 후, 쉼표 또는 공백 단위로 분리해 토큰 배열 생성
    const tokens = line.trim().split(/\s*,\s*|\s+/);

    // 2) 결과를 담을 빈 객체 생성
    const dp = {};

    // 3) headers 배열과 동일한 인덱스로 매핑하여 값 할당
    headers.forEach((key, idx) => {
        // tokens[idx]: headers[idx]에 대응하는 문자열 값
        const token = tokens[idx];
        // 문자열을 부동소수점 숫자로 파싱
        const value = parseFloat(token);
        // 값이 유한한 숫자이면 할당, 아니면 undefined 처리
        dp[key] = Number.isFinite(value) ? value : undefined;
    });

    // 4) 변환된 DataPoint 객체 반환
    return dp;
}

export default function LiveFileChart({ incomingLine }) {
    const [data, setData] = useState([]);

    useEffect(() => {
        if (!incomingLine) return;
        try {
            const dp = parseLine(incomingLine);
            setData(prev => [...prev, dp]);
        } catch (e) {
            console.error('Error parsing line:', e);
        }
    }, [incomingLine]);

    const getOption = groupName => ({
        tooltip: { trigger: 'axis' },
        legend: { data: groups[groupName] },
        xAxis: { type: 'value', name: 'time (s)' },
        yAxis: { type: 'value' },
        series: groups[groupName].map(sensor => ({
            name: sensor,
            type: 'line',
            showSymbol: false,
            data: data.map(dp => [dp.time, dp[sensor]])
        }))
    });

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.keys(groups).map(group => (
                <div
                    key={group}
                    style={{
                        flex: '1 1 400px', // 최소 너비 300px, 가로로 늘어남
                        padding: '16px',   // 주변 여백
                        boxSizing: 'border-box',
                        backgroundColor: '#ececec',
                        borderRadius: '8px',
                    }}
                >
                    <h4 style={{ textAlign: 'center' }}>{group.toUpperCase()}</h4>
                    <ReactECharts
                        option={getOption(group)}
                        style={{ height: 200, width: '100%' }}
                    />
                </div>
            ))}
        </div>
    );
}
