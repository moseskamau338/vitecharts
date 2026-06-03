/**
 * A single requestAnimationFrame loop shared by every running tween. Batching
 * all animation work into one rAF callback avoids layout thrash and keeps frame
 * timing consistent.
 *
 * Tests can drive frames deterministically: `setAuto(false)` then call `flush(t)`.
 */

export type FrameTask = (now: number) => void;

class Scheduler {
  private readonly tasks = new Set<FrameTask>();
  private handle: number | null = null;
  private auto = true;

  add(task: FrameTask): void {
    this.tasks.add(task);
    this.ensureFrame();
  }

  remove(task: FrameTask): void {
    this.tasks.delete(task);
  }

  get size(): number {
    return this.tasks.size;
  }

  /** Disable automatic rAF scheduling (for deterministic tests). */
  setAuto(value: boolean): void {
    this.auto = value;
  }

  /** Run every task with the given timestamp; re-arms the next frame if needed. */
  flush(now: number): void {
    for (const task of [...this.tasks]) task(now);
    if (this.tasks.size > 0) this.ensureFrame();
  }

  private ensureFrame(): void {
    if (this.handle != null || !this.auto) return;
    if (typeof requestAnimationFrame === 'undefined') return;
    this.handle = requestAnimationFrame((now) => {
      this.handle = null;
      this.flush(now);
    });
  }
}

export const scheduler = new Scheduler();
