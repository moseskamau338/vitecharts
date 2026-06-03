/**
 * Cross-chart sync registry. Charts sharing a `group` id broadcast their hovered
 * x value to peers so they show a matching crosshair + tooltip simultaneously.
 */
export interface SyncPeer {
  showAt(xRaw: unknown): void;
  hide(): void;
}

const groups = new Map<string, Set<SyncPeer>>();

export function joinSyncGroup(id: string, peer: SyncPeer): () => void {
  let set = groups.get(id);
  if (!set) {
    set = new Set();
    groups.set(id, set);
  }
  set.add(peer);
  return () => {
    const g = groups.get(id);
    g?.delete(peer);
    if (g && g.size === 0) groups.delete(id);
  };
}

export function broadcastShow(id: string, source: SyncPeer, xRaw: unknown): void {
  for (const peer of groups.get(id) ?? []) {
    if (peer !== source) peer.showAt(xRaw);
  }
}

export function broadcastHide(id: string, source: SyncPeer): void {
  for (const peer of groups.get(id) ?? []) {
    if (peer !== source) peer.hide();
  }
}
