/**
 * Minimal auto-tracking reactive core.
 *
 * `signal` holds a value and remembers which effects read it; setting the value
 * re-runs those effects. `effect` runs a function and subscribes it to every
 * signal it touches. `computed` is a memoized signal derived from others.
 *
 * This is the reactive store the {@link Chart} lifecycle is built on: options
 * and container size are signals, and a single render effect re-draws whenever
 * either changes.
 */

interface Reaction {
  fn: () => void;
  disposed: boolean;
}

let active: Reaction | null = null;
const stack: Reaction[] = [];

function run(reaction: Reaction): void {
  if (reaction.disposed) return;
  stack.push(reaction);
  active = reaction;
  try {
    reaction.fn();
  } finally {
    stack.pop();
    active = stack[stack.length - 1] ?? null;
  }
}

export interface Signal<T> {
  value: T;
}

export function signal<T>(initial: T): Signal<T> {
  let current = initial;
  const subscribers = new Set<Reaction>();

  return {
    get value(): T {
      if (active) subscribers.add(active);
      return current;
    },
    set value(next: T) {
      if (Object.is(next, current)) return;
      current = next;
      for (const reaction of [...subscribers]) {
        if (reaction.disposed) subscribers.delete(reaction);
        else run(reaction);
      }
    },
  };
}

/** Run `fn`, re-running it whenever a signal it read changes. Returns a disposer. */
export function effect(fn: () => void): () => void {
  const reaction: Reaction = { fn, disposed: false };
  run(reaction);
  return () => {
    reaction.disposed = true;
  };
}

/** A read-only signal derived from other signals. */
export function computed<T>(fn: () => T): { readonly value: T } {
  const derived = signal<T>(undefined as T);
  effect(() => {
    derived.value = fn();
  });
  return {
    get value(): T {
      return derived.value;
    },
  };
}
