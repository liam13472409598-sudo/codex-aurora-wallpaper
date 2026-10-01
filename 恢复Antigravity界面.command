#!/bin/zsh
cd -- "${0:A:h}" || exit 1
source ./scripts/node-runtime.zsh || exit 1
"$NODE" runtime.mjs restore --app antigravity
if [[ $? -ne 0 ]]; then read '?按回车关闭…'; fi
