/**
 * Critically-dampable spring solver (semi-implicit Euler). Returns a stepper you
 * call once per frame with the elapsed milliseconds; it integrates toward `to`
 * and reports `done` once it settles. Used for springy choreography (marker pop,
 * dynamic updates) where easing curves feel less natural.
 */

export interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
  /** Settle threshold for both displacement and velocity. */
  precision?: number;
}

export interface SpringStep {
  value: number;
  velocity: number;
  done: boolean;
}

export function createSpring(
  from: number,
  to: number,
  options: SpringOptions = {},
): (deltaMs: number) => SpringStep {
  const stiffness = options.stiffness ?? 170;
  const damping = options.damping ?? 26;
  const mass = options.mass ?? 1;
  const precision = options.precision ?? 0.01;

  let value = from;
  let velocity = 0;

  return (deltaMs: number): SpringStep => {
    // Clamp the timestep so a long frame gap can't explode the integration.
    const dt = Math.min(Math.max(deltaMs, 0), 64) / 1000;
    const springForce = -stiffness * (value - to);
    const damperForce = -damping * velocity;
    const acceleration = (springForce + damperForce) / mass;

    velocity += acceleration * dt;
    value += velocity * dt;

    const done = Math.abs(value - to) < precision && Math.abs(velocity) < precision;
    if (done) {
      value = to;
      velocity = 0;
    }
    return { value, velocity, done };
  };
}
