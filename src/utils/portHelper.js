import { Position } from 'reactflow';

/**
 * 방위각(azimuthal angle)에 따라 React Flow 핸들의 최적 위치를 계산합니다.
 * 0도: 오른쪽, 90도: 위쪽, 180도: 왼쪽, 270도: 아래쪽을 중심으로 45도씩 범위를 가집니다.
 * @param {number} angle - 0-360 사이의 방위각. null이나 undefined일 경우 기본값 0으로 처리됩니다.
 * @returns {Position} React Flow의 Position enum 값 (Top, Right, Bottom, Left)
 */
export function getPortPosition(angle) {
    // 입력값이 유효하지 않으면 기본값 0으로 처리
    const safeAngle = angle ?? 0;
    // 각도를 0-359.99... 범위로 정규화
    const normalizedAngle = ((safeAngle % 360) + 360) % 360;

    if (normalizedAngle >= 45 && normalizedAngle < 135) {
        return Position.Top; // 위쪽 (90도 중심)
    } else if (normalizedAngle >= 135 && normalizedAngle < 225) {
        return Position.Left; // 왼쪽 (180도 중심)
    } else if (normalizedAngle >= 225 && normalizedAngle < 315) {
        return Position.Bottom; // 아래쪽 (270도 중심)
    } else { // 315-360 및 0-45 범위
        return Position.Right; // 오른쪽 (0/360도 중심)
    }
}
