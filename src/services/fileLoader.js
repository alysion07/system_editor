// src/services/fileLoader.js

export const FileLoader = {
    /**
     * JSON 텍스트 → 객체로 파싱
     * @param {string} text
     * @returns {Object} 파싱된 객체
     * @throws {Error} 파싱 실패 시
     */
    parse(text) {
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error('JSON 파싱에 실패했습니다.');
        }
    },

    /**
     * Flow 데이터 구조 유효성 검사
     * @param {Object} data
     * @returns {boolean} 유효 여부
     * @throws {Error} 유효하지 않은 경우
     */
    validateFlowData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('프로젝트 데이터가 존재하지 않습니다.');
        }
        if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
            throw new Error('nodes 또는 edges 구조가 올바르지 않습니다.');
        }
        return true;
    }
};
