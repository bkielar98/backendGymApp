import { describe, expect, it } from '@jest/globals';
import { calculateBrzyckiRepMax } from './rep-max.util';

describe('calculateBrzyckiRepMax', () => {
  it('uses the Brzycki formula for one rep max', () => {
    expect(calculateBrzyckiRepMax(80, 5)).toBe(90);
    expect(calculateBrzyckiRepMax(90, 8)).toBe(111.72);
  });

  it('returns null for invalid or unsupported values', () => {
    expect(calculateBrzyckiRepMax(0, 5)).toBeNull();
    expect(calculateBrzyckiRepMax(80, 0)).toBeNull();
    expect(calculateBrzyckiRepMax(80, 37)).toBeNull();
    expect(calculateBrzyckiRepMax(80, 50)).toBeNull();
  });
});
