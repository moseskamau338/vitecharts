import { curveBasis, curveLinear, curveMonotoneX, curveStep, type CurveFactory } from 'd3-shape';
import type { CurveType } from '../types.js';

const CURVES: Record<CurveType, CurveFactory> = {
  linear: curveLinear,
  smooth: curveMonotoneX,
  step: curveStep,
  basis: curveBasis,
};

export function curveFor(curve: CurveType = 'linear'): CurveFactory {
  return CURVES[curve] ?? curveLinear;
}
