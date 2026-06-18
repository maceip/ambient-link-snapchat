// Shared types for the Ambient Link relay payload.

export interface Session {
  session_id: string
  agent: string // "cursor" | "claude" | "codex"
  cwd: string
  state: string // "BUSY" | "IDLE" | "DEAD"
  preview?: string
}

export interface RelayStatus {
  sessions: Session[]
}

export function isLive(s: Session): boolean {
  return s.state !== "DEAD"
}

export function sessionLabel(s: Session): string {
  return `${s.agent}: ${s.cwd}`
}
