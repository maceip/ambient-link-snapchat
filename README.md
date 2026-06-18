# ambient-link-snapchat

Ambient Link surface for **Snap Spectacles** (Lens Studio / Snap OS).

This is the Snap sibling of [`ambient-link-meta`](https://github.com/maceip/ambient-link-meta).
It renders live coding-agent sessions (Cursor / Claude / Codex) from the Ambient Link
relay inside a Spectacles Lens, using the **Spectacles Interaction Kit (SIK)** for the
windowed UI and the **Spectacles Fetch API** for networking.

> Status: **scaffold / placeholder**. The TypeScript components target the real SIK
> APIs, but a Lens Studio project binds assets/inputs in the editor — the `.esproj`
> / scene is created in Lens Studio 5 and is intentionally not committed. Search
> markers: `TODO(spectacles)`.

## Companion-link contract

Capture/relay follows the vendor-neutral
[`glass-link.ts`](https://github.com/maceip/ambient-link-core/blob/main/contracts/glass-link.ts)
contract — full routing/perf plan in
[ambient-link-core/ROUTING.md](https://github.com/maceip/ambient-link-core/blob/main/ROUTING.md),
extracted from the recovered Cosmo teardown. Implemented here as
`Assets/Scripts/GlassLink.ts`. Perf rules to honor: idempotent `bind()`,
1-frame/10s throttle, TTL ephemeral buffer.

## How Spectacles Lenses display content

- Build in **Lens Studio 5** (https://ar.snap.com/lens-studio); scripts are TypeScript.
- Install **Spectacles Interaction Kit** and **Spectacles UI Kit** from
  `Window > Asset Library > Spectacles`.
- A **`ContainerFrame`** (SIK) is the window/panel that holds your content in AR space;
  parent `Text` / 3D content under it.
- Network with the **Spectacles Fetch API** via a `RemoteServiceModule`
  (`remoteServiceModule.fetch(...)`), since Lenses are sandboxed.

Docs:
- SIK: https://developers.snap.com/spectacles/spectacles-frameworks/spectacles-interaction-kit/get-started
- UI Composites (ContainerFrame): https://developers.snap.com/spectacles/spectacles-frameworks/spectacles-interaction-kit/features/ui-composites
- Samples: https://github.com/Snapchat/Spectacles-Sample (and https://github.com/specs-devs/samples)

## Layout

```
Assets/Scripts/
  AmbientLinkController.ts   # builds a ContainerFrame + renders the session list
  RelayClient.ts            # Spectacles Fetch API -> Ambient Link relay
  SessionTypes.ts           # shared types
```

## Relay

Reuses the existing Ambient Link relay (same one the Meta web app reads):

```
GET https://public.computer/ambient-link/status   ->  { sessions: [...] }
```

`public.computer` must be allow-listed in the Lens's **Extended Permissions /
Internet Access** settings for the Fetch call to succeed.

## Setup in Lens Studio

1. Create a new Spectacles project in Lens Studio 5.
2. Asset Library → install **Spectacles Interaction Kit** + **Spectacles UI Kit**.
3. Drag `SpectaclesInteractionKit.prefab` into the scene.
4. Add a Scene Object, attach `Assets/Scripts/AmbientLinkController.ts`.
5. Add a **Remote Service Module** asset and assign it to the script's
   `remoteServiceModule` input.
6. Set the script's `relayBaseUrl` input (default `https://public.computer`).
7. Add `public.computer` to Internet Access permissions, then push to Spectacles.
