import { describe, it, expect } from 'vitest';
import { roundPointCoordinates } from './roundPointCoordinates';

describe('roundPointCoordinates', () => {
  it('rounds coordinates to nearest integer by default', () => {
    const point = { x: 1.4, y: 2.6 };
    const rounded = roundPointCoordinates(point);
    expect(rounded).toEqual({ x: 1, y: 3 });
  });

  it('rounds coordinates to nearest tenth when p=10', () => {
    const point = { x: 1.44, y: 2.66 };
    const rounded = roundPointCoordinates(point, 10);
    expect(rounded).toEqual({ x: 1.4, y: 2.7 });
  });

  it('handles negative coordinates', () => {
    const point = { x: -1.49, y: -2.51 };
    const rounded = roundPointCoordinates(point);
    expect(rounded).toEqual({ x: -1, y: -3 });
  });

  it('handles zero coordinates', () => {
    const point = { x: 0, y: 0 };
    const rounded = roundPointCoordinates(point);
    expect(rounded).toEqual({ x: 0, y: 0 });
  });

  it('handles large values', () => {
    const point = { x: 12345.6789, y: 98765.4321 };
    const rounded = roundPointCoordinates(point, 100);
    expect(rounded).toEqual({ x: 12345.68, y: 98765.43 });
  });

  it('handles p=1000 for three decimal places', () => {
    const point = { x: 1.23456, y: 2.98765 };
    const rounded = roundPointCoordinates(point, 1000);
    expect(rounded).toEqual({ x: 1.235, y: 2.988 });
  });
});
