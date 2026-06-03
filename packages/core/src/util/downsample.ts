/**
 * Largest-Triangle-Three-Buckets (LTTB) downsampling. Reduces a dense series to
 * `threshold` points while preserving its visual shape — used to keep very large
 * line/area series fast without visibly changing the curve.
 *
 * Reference: Sveinn Steinarsson, "Downsampling Time Series for Visual
 * Representation" (2013).
 */
export interface XY {
  x: number;
  y: number;
}

export function lttb<T extends XY>(data: T[], threshold: number): T[] {
  const n = data.length;
  if (threshold >= n || threshold < 3) return data;

  const sampled: T[] = [];
  const bucketSize = (n - 2) / (threshold - 2);

  let a = 0; // initially the first point
  sampled.push(data[0]!);

  for (let i = 0; i < threshold - 2; i++) {
    // Average point of the next bucket (used as the triangle's far vertex).
    let avgX = 0;
    let avgY = 0;
    const avgStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, n);
    const avgCount = avgEnd - avgStart;
    for (let j = avgStart; j < avgEnd; j++) {
      avgX += data[j]!.x;
      avgY += data[j]!.y;
    }
    avgX /= avgCount || 1;
    avgY /= avgCount || 1;

    // Pick the point in this bucket forming the largest triangle with `a` + avg.
    const rangeStart = Math.floor(i * bucketSize) + 1;
    const rangeEnd = Math.floor((i + 1) * bucketSize) + 1;
    const pointA = data[a]!;
    let maxArea = -1;
    let next = rangeStart;
    for (let j = rangeStart; j < rangeEnd; j++) {
      const p = data[j]!;
      const area = Math.abs(
        (pointA.x - avgX) * (p.y - pointA.y) - (pointA.x - p.x) * (avgY - pointA.y),
      );
      if (area > maxArea) {
        maxArea = area;
        next = j;
      }
    }
    sampled.push(data[next]!);
    a = next;
  }

  sampled.push(data[n - 1]!);
  return sampled;
}
