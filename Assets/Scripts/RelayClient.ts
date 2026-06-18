import { RelayStatus, Session } from "./SessionTypes"

/**
 * Thin wrapper around the Spectacles Fetch API.
 *
 * Lenses are sandboxed, so all networking goes through a RemoteServiceModule
 * (the Spectacles Fetch API). The host (`public.computer`) must be allow-listed
 * in the Lens's Internet Access / Extended Permissions.
 *
 * Docs: https://developers.snap.com/spectacles/about-spectacles-features/apis/fetch
 */
export class RelayClient {
  constructor(
    private readonly remoteServiceModule: RemoteServiceModule,
    private readonly baseUrl: string
  ) {}

  async fetchSessions(): Promise<Session[]> {
    const url = `${this.baseUrl}/ambient-link/status`
    try {
      // TODO(spectacles): confirm the Request/Response shape against the Lens
      // Studio version you build with; some versions expose `global.fetch`
      // directly once a RemoteServiceModule is present.
      const response = await this.remoteServiceModule.fetch(url, {
        method: "GET",
      })
      if (response.status !== 200) {
        print(`[ambient-link] relay HTTP ${response.status}`)
        return []
      }
      const body = (await response.json()) as RelayStatus
      return body.sessions || []
    } catch (e) {
      print(`[ambient-link] relay fetch failed: ${e}`)
      return []
    }
  }
}
