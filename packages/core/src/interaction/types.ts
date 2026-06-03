/** A single plotted datum located in pixel space (for hit-testing/tooltips). */
export interface PlotPoint {
  seriesIndex: number;
  name: string;
  color: string;
  xRaw: unknown;
  value: number;
  cx: number;
  cy: number;
}

/** All points sharing one x position (for shared tooltips + crosshair). */
export interface XGroup {
  x: number;
  xRaw: unknown;
  points: PlotPoint[];
}

export interface PlotBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** What a chart type hands the interaction layer after drawing a frame. */
export interface InteractionModel {
  bounds: PlotBounds;
  groups: XGroup[];
}

/** Sink the Chart passes into the render context to receive the model. */
export interface SceneSink {
  setModel(model: InteractionModel): void;
}

export interface ChartEventMap {
  pointerMove: { group: XGroup; x: number; y: number };
  pointerLeave: undefined;
  markerClick: { point: PlotPoint };
  legendClick: { seriesIndex: number; name: string; hidden: boolean };
  /** Emitted when a brush selection finishes; x0/x1 are data values. */
  brushSelection: { x0: unknown; x1: unknown; px0: number; px1: number };
}

export type TooltipRenderer = (group: XGroup) => string;
