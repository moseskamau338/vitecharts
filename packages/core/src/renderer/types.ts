/**
 * Backend-agnostic rendering contract.
 *
 * Every chart draws against this interface, never against the DOM directly.
 * Phase 0 ships an SVG backend; a Canvas backend (Phase 9) can implement the
 * same surface so dense series render without touching chart code.
 */

export type Attrs = Record<string, string | number>;

/** A handle to a drawn primitive. Kept opaque so backends can swap their node type. */
export interface NodeHandle {
  /** Set one or more presentation attributes. */
  set(attrs: Attrs): this;
  /** Set the text content (no-op for non-text primitives). */
  text(value: string): this;
  /** Detach this node from the scene. */
  remove(): void;
}

export interface Renderer {
  /** The root element mounted into the container. */
  readonly mount: Element;
  /** Resize the drawing surface. */
  resize(width: number, height: number): void;
  /** Remove every drawn primitive (keeps the surface mounted). */
  clear(): void;

  group(attrs?: Attrs, parent?: NodeHandle): NodeHandle;
  path(attrs?: Attrs, parent?: NodeHandle): NodeHandle;
  line(attrs?: Attrs, parent?: NodeHandle): NodeHandle;
  rect(attrs?: Attrs, parent?: NodeHandle): NodeHandle;
  circle(attrs?: Attrs, parent?: NodeHandle): NodeHandle;
  text(content: string, attrs?: Attrs, parent?: NodeHandle): NodeHandle;

  /** Unmount and release the surface. */
  destroy(): void;
}
