# License scope

This repository contains an adapted third-party renderer and a new control/runtime layer. It is not offered under a blanket MIT license.

## Aurora renderer

`src/renderer.ts`, generated `renderer.js`, the renderer portion of generated `wallpaper.js`, and the aurora imagery derive from **Auroras** by **nimitz (@stormoid)**, through **Rice-dog/code-codex**.

- Original: https://www.shadertoy.com/view/XtGGRt
- Applicable third-party notice: [THIRD_PARTY_NOTICES.md, section 2](THIRD_PARTY_NOTICES.md#2-aurora-ionosphere-background--极光电离层)
- Upstream's original integration code license: [LICENSE-Code-Codex.txt](LICENSE-Code-Codex.txt)

The upstream notice records the shader's license evidence as conditional and refers to Creative Commons Attribution-NonCommercial-ShareAlike 3.0 where applicable. This repository preserves that qualification; it does not represent commercial clearance or independently verified author permission. The attribution, modification record and upstream revision are in [SOURCES.md](SOURCES.md).

To the extent licensed rights allow distribution of the adaptation, the renderer modifications made here are offered under CC BY-NC-SA 3.0, with the same attribution, noncommercial and share-alike conditions: https://creativecommons.org/licenses/by-nc-sa/3.0/ . No additional rights to the underlying work are granted.

## New control and runtime code

The independently written `controls.js`, `panel-template.js`, `adapters.js`, `hosts.mjs`, `runtime.mjs`, `build.mjs`, `terminal/`, launch scripts and tests are available under the MIT terms below. This does not extend to the shader embedded in the generated bundle.

Copyright (c) 2026 Liamkim

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
