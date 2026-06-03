import type { CurveType } from '../types.js';

/** A point already mapped to pixel space. */
export interface PixelPoint {
  x: number;
  y: number;
}

export interface LineStyle {
  stroke: string;
  width?: number;
  curve?: CurveType;
  /** SVG `stroke-dasharray` value. */
  dash?: string;
}

export interface AreaStyle {
  fill: string;
  opacity?: number;
  curve?: CurveType;
}

export interface PointStyle {
  fill: string;
  radius?: number;
  stroke?: string;
  strokeWidth?: number;
}

export interface RectStyle {
  fill: string;
  opacity?: number;
  radius?: number;
}

export interface ArcStyle {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}
