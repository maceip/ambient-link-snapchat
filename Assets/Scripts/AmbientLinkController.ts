import { ContainerFrame } from "./SpectaclesInteractionKit.lspkg/Components/UI/ContainerFrame/ContainerFrame"
import { RelayClient } from "./RelayClient"
import { isLive, sessionLabel, Session } from "./SessionTypes"

/**
 * AmbientLinkController
 *
 * Builds a SIK ContainerFrame as the AR "window" and renders the live Ambient
 * Link session list inside it, polling the relay on an interval.
 *
 * Setup in Lens Studio:
 *  - Install Spectacles Interaction Kit (Asset Library) so the import above resolves.
 *  - Add a Remote Service Module asset -> assign to `remoteServiceModule`.
 *  - Optionally point `relayBaseUrl` at your own relay.
 *  - Provide a Text asset/prefab for rows via `rowTextPrefab` (a SceneObject with
 *    a Text component), or let the script create plain Text components.
 */
@component
export class AmbientLinkController extends BaseScriptComponent {
  @input remoteServiceModule!: RemoteServiceModule
  @input
  @hint("Base URL of the Ambient Link relay")
  relayBaseUrl: string = "https://public.computer"
  @input
  @hint("Seconds between relay polls")
  pollSeconds: number = 5.0
  @input
  @hint("SceneObject prefab containing a Text component, used per session row")
  rowTextPrefab!: ObjectPrefab

  private container!: ContainerFrame
  private relay!: RelayClient
  private rows: SceneObject[] = []

  onAwake() {
    this.relay = new RelayClient(this.remoteServiceModule, this.relayBaseUrl)
    this.createEvent("OnStartEvent").bind(() => this.onStart())
  }

  private onStart() {
    // The ContainerFrame is the window that holds our content in AR space.
    this.container = this.sceneObject.createComponent(ContainerFrame.getTypeName())
    this.container.innerSize = new vec2(28, 18)
    this.container.enableCloseButton(true)
    this.container.enableFollowButton(true)
    this.container.autoShowHide = false
    this.container.showVisual()

    this.poll()
    const delayed = this.createEvent("DelayedCallbackEvent")
    delayed.bind(() => {
      this.poll()
      delayed.reset(this.pollSeconds)
    })
    delayed.reset(this.pollSeconds)
  }

  private async poll() {
    const sessions = await this.relay.fetchSessions()
    this.render(sessions)
  }

  private render(sessions: Session[]) {
    // Clear previous rows.
    for (const r of this.rows) r.destroy()
    this.rows = []

    if (sessions.length === 0) {
      this.addRow("no sessions", 0, false)
      return
    }

    sessions.forEach((s, i) => {
      const live = isLive(s)
      const sub = s.preview && s.preview.length > 0 ? s.preview : s.state.toLowerCase()
      this.addRow(`${sessionLabel(s)}  ·  ${sub}`, i, live)
    })
  }

  /**
   * Creates one text row parented to the container. Uses the provided prefab if
   * set, otherwise creates a bare Text component.
   * TODO(spectacles): swap for Spectacles UI Kit list/card components for the
   * native focus + glass styling instead of raw Text.
   */
  private addRow(text: string, index: number, live: boolean) {
    let obj: SceneObject
    let textComp: Text
    if (this.rowTextPrefab) {
      obj = this.rowTextPrefab.instantiate(this.container.getParentTransform().getSceneObject())
      textComp = obj.getComponent("Component.Text") as Text
    } else {
      obj = global.scene.createSceneObject(`row_${index}`)
      obj.setParent(this.sceneObject)
      textComp = obj.createComponent("Component.Text") as Text
    }
    textComp.text = text
    // Live = full white; ended = dimmed. (Additive display: brightness == alpha.)
    const a = live ? 1.0 : 0.5
    textComp.textFill.color = new vec4(1, 1, 1, a)

    const t = obj.getTransform()
    t.setLocalPosition(new vec3(0, 7 - index * 2.2, 0))
    this.rows.push(obj)
  }
}
