import { describe, it, expect } from 'vitest';
import { roundPointCoordinates } from './roundPointCoordinates';
import { Point } from '../types/Geometry';

const round = (point: Point, precision?: number) => roundPointCoordinates({ ...point, precision });

describe('round', () => {
  it('rounds coordinates to nearest integer by default', () => {
    const point = { x: 1.4, y: 2.6 };
    const rounded = round(point);
    expect(rounded).toEqual({ x: 1, y: 3 });
  });

  it('rounds coordinates to nearest tenth when p=1', () => {
    const point = { x: 1.44, y: 2.66 };
    const rounded = round(point, 1);
    expect(rounded).toEqual({ x: 1.4, y: 2.7 });
  });

  it('handles negative coordinates', () => {
    const point = { x: -1.49, y: -2.51 };
    const rounded = round(point);
    expect(rounded).toEqual({ x: -1, y: -3 });
  });

  it('handles zero coordinates', () => {
    const point = { x: 0, y: 0 };
    const rounded = round(point);
    expect(rounded).toEqual({ x: 0, y: 0 });
  });

  it('handles large values', () => {
    const point = { x: 12345.6789, y: 98765.4321 };
    const rounded = round(point, 2);
    expect(rounded).toEqual({ x: 12345.68, y: 98765.43 });
  });

  it('handles p=1000 for three decimal places', () => {
    const point = { x: 1.23456, y: 2.98765 };
    const rounded = round(point, 3);
    expect(rounded).toEqual({ x: 1.235, y: 2.988 });
  });
});
