# Sources and attribution

- Underlying shader: **Auroras**, by **nimitz (@stormoid)**. https://www.shadertoy.com/view/XtGGRt
- Adapted three-pass renderer: **Rice-dog/code-codex**, `packages/explorer-ui/src/explorer-element.ts`.
- Source revision recorded during lookup: `a12dfa7c78b3959b5f2693bd95adf526b7c63a46`.
- Source link: https://github.com/Rice-dog/code-codex/blob/a12dfa7c78b3959b5f2693bd95adf526b7c63a46/packages/explorer-ui/src/explorer-element.ts
- Upstream notices: https://github.com/Rice-dog/code-codex/blob/main/THIRD_PARTY_NOTICES_ZH_CN.md

This local package extracts the upstream aurora renderer and adds a standalone Chinese control panel, four presets, opacity/readability controls, JSON settings exchange, reversible macOS Codex injection and launch/restore scripts. Renderer changes include a 30 FPS draw cap, continuous motion across speed changes, framebuffer checking, and corrected resource rebuilding after context loss.

The Code-Codex MIT license is included as LICENSE-Code-Codex.txt. It applies to the upstream project's original portions and does not relicense nimitz's shader. The original shader's license evidence is marked conditional by the upstream project; see THIRD_PARTY_NOTICES.md, section 2. This package makes no claim that the complete effect is MIT licensed or cleared for commercial redistribution. Original authorship is retained in source and UI.

Prepared 2026-09-30. No application binaries or original app resources are redistributed.
