// VENDORED — do not edit. Mirror of the canonical contract:
//   ambient-link-core/contracts/glass-link.ts
// Lens Studio projects vendor .ts files rather than pull a package, so this is the
// one place the Snap implementation reads the GlassLink shape. Keep it byte-for-byte
// in sync with the canonical source (only this header differs).
//
// Implement against the Spectacles transport (camera/audio + Fetch-based relay) so
// the AmbientLinkController consumes one uniform surface. Shape extracted from the
// recovered Cosmo CosmoGlassManager (ambient-link-google/glasses_link.md).

/** Vendor-neutral frame envelope. */
export interface GlassFrame {
  width: number;
  height: number;
  pixels: Uint8Array;
  tsMillis: number;
}

export type FrameSink = (frame: GlassFrame) => void;
export type AudioSink = (bytes: Uint8Array, validLen: number) => void;

export interface GlassLink {
  /** Device present/reachable. */
  readonly connected: boolean;
  /** Capture session live. */
  readonly bound: boolean;
  /** Subscribe to state transitions (no polling). */
  onState(listener: (s: { connected: boolean; bound: boolean }) => void): () => void;

  /** Idempotent; honors the per-link settings gate. */
  bind(): Promise<void>;
  unbind(): void;

  setupImageCapture(onFrame: FrameSink): void;
  startImageCapture(): void;
  stopImageCapture(): void;

  startAudioCapture(onBytes: AudioSink): void;
  stopAudioCapture(): void;

  clear(): void;
}

/** Cosmo: 10s frame interval / 0.1 fps target. */
export const DEFAULT_FRAME_INTERVAL_MS = 10_000;

/** TTL ring buffer for captured media. Mirrors Cosmo's InMemoryEphemeralBuffer. */
export interface EphemeralBuffer<T> {
  readonly ttlMillis: number;
  add(item: T, tsMillis: number): void;
  snapshot(): T[];
  clear(): void;
}
