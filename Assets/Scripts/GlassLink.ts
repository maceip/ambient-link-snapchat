// Copy of the canonical contract in ambient-link-core/contracts/glass-link.ts.
// Kept in-repo for the Lens Studio (Spectacles) implementation.
//
// Spectacles capture differs from Cosmo's projected service, but the boundary is
// the same: a GlassLink impl wraps the Spectacles camera/audio + Fetch-based relay
// so the AmbientLinkController consumes one uniform surface. Shape extracted from
// the recovered Cosmo CosmoGlassManager (ambient-link-google/glasses_link.md);
// plan in ambient-link-core/ROUTING.md.

export interface GlassFrame {
  width: number;
  height: number;
  pixels: Uint8Array;
  tsMillis: number;
}

export type FrameSink = (frame: GlassFrame) => void;
export type AudioSink = (bytes: Uint8Array, validLen: number) => void;

export interface GlassLink {
  readonly connected: boolean;
  readonly bound: boolean;
  onState(listener: (s: { connected: boolean; bound: boolean }) => void): () => void;

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
