import SNGLVOL from './SNGLVOL';

// SNGLVOL 컴포넌트의 validators 객체에 대한 단위 테스트
describe('SNGLVOL Component Validators', () => {
  const { validators } = SNGLVOL;

  // 1. validateElevation 함수 테스트
  describe('validateElevation (W6)', () => {
    it('고도변화의 절댓값이 길이보다 작거나 같으면 true를 반환해야 합니다', () => {
      expect(validators.validateElevation(10, { length: 10 })).toBe(true);
      expect(validators.validateElevation(5, { length: 10 })).toBe(true);
      expect(validators.validateElevation(-10, { length: 10 })).toBe(true);
    });

    it('고도변화의 절댓값이 길이보다 크면 false를 반환해야 합니다', () => {
      expect(validators.validateElevation(10.1, { length: 10 })).toBe(false);
      expect(validators.validateElevation(-10.1, { length: 10 })).toBe(false);
    });

    it('필요한 데이터(고도변화 또는 길이)가 없으면 true를 반환해야 합니다 (검증 스킵)', () => {
      expect(validators.validateElevation(undefined, { length: 10 })).toBe(true);
      expect(validators.validateElevation(10, {})).toBe(true);
      expect(validators.validateElevation(null, { length: 10 })).toBe(true);
    });
  });

  // 2. validateRoughness 함수 테스트
  describe('validateRoughness (W8)', () => {
    it('벽 거칠기가 수력학적 직경의 절반보다 작으면 true를 반환해야 합니다', () => {
      expect(validators.validateRoughness(0.49, { hydraulic: 1.0 })).toBe(true);
    });

    it('벽 거칠기가 수력학적 직경의 절반보다 크거나 같으면 false를 반환해야 합니다', () => {
      expect(validators.validateRoughness(0.5, { hydraulic: 1.0 })).toBe(false);
      expect(validators.validateRoughness(0.6, { hydraulic: 1.0 })).toBe(false);
    });

    it('수력학적 직경이 0이면 true를 반환해야 합니다 (검증 스킵)', () => {
      expect(validators.validateRoughness(0.5, { hydraulic: 0 })).toBe(true);
    });
  });

  // 3. validateVolumeConsistency 함수 테스트
  describe('validateVolumeConsistency (W3)', () => {
    it('부피가 (면적 * 길이)와 허용 오차(1e-6) 내에서 일치하면 true를 반환해야 합니다', () => {
      expect(validators.validateVolumeConsistency(10.000001, { area: 2, length: 5 })).toBe(true);
      expect(validators.validateVolumeConsistency(9.999999, { area: 2, length: 5 })).toBe(true);
    });

    it('부피가 허용 오차를 벗어나면 false를 반환해야 합니다', () => {
      expect(validators.validateVolumeConsistency(10.000011, { area: 2, length: 5 })).toBe(false);
    });
  });

  // 4. validateVolumeRequired 함수 테스트
  describe('validateVolumeRequired (W3)', () => {
    it('면적, 길이, 부피 중 0이 아닌 값이 2개 이상이면 true를 반환해야 합니다', () => {
      expect(validators.validateVolumeRequired(null, { area: 1, length: 1, volume: 0 })).toBe(true);
      expect(validators.validateVolumeRequired(null, { area: 1, length: 0, volume: 1 })).toBe(true);
      expect(validators.validateVolumeRequired(null, { area: 0, length: 1, volume: 1 })).toBe(true);
      expect(validators.validateVolumeRequired(null, { area: 1, length: 1, volume: 1 })).toBe(true);
    });

    it('0이 아닌 값이 2개 미만이면 false를 반환해야 합니다', () => {
      expect(validators.validateVolumeRequired(null, { area: 1, length: 0, volume: 0 })).toBe(false);
      expect(validators.validateVolumeRequired(null, { area: 0, length: 1, volume: 0 })).toBe(false);
      expect(validators.validateVolumeRequired(null, { area: 0, length: 0, volume: 1 })).toBe(false);
      expect(validators.validateVolumeRequired(null, { area: 0, length: 0, volume: 0 })).toBe(false);
      expect(validators.validateVolumeRequired(null, {})).toBe(false);
    });
  });

  // 5. validateAzimuthal 함수 테스트
  describe('validateAzimuthal (W4)', () => {
    it('방위각의 절댓값이 360 이하이면 true를 반환해야 합니다', () => {
      expect(validators.validateAzimuthal(360)).toBe(true);
      expect(validators.validateAzimuthal(-360)).toBe(true);
      expect(validators.validateAzimuthal(0)).toBe(true);
    });

    it('방위각의 절댓값이 360을 초과하면 false를 반환해야 합니다', () => {
      expect(validators.validateAzimuthal(360.1)).toBe(false);
      expect(validators.validateAzimuthal(-360.1)).toBe(false);
    });
  });

  // 6. validateInclination 함수 테스트
  describe('validateInclination (W5)', () => {
    it('경사각의 절댓값이 90 이하이면 true를 반환해야 합니다', () => {
      expect(validators.validateInclination(90)).toBe(true);
      expect(validators.validateInclination(-90)).toBe(true);
    });

    it('경사각의 절댓값이 90을 초과하면 false를 반환해야 합니다', () => {
      expect(validators.validateInclination(90.1)).toBe(false);
      expect(validators.validateInclination(-90.1)).toBe(false);
    });
  });
});
