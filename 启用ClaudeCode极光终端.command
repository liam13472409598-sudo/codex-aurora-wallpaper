#!/bin/zsh
cd -- "${0:A:h}" || exit 1
source ./scripts/node-runtime.zsh || exit 1
if [[ ! -d node_modules/ws || ! -d node_modules/@xterm/xterm ]]; then
 echo '请下载包含依赖的发行版 ZIP，或先在此目录运行 npm ci --omit=dev。'
 read '?按回车关闭…'; exit 1
fi
"$NODE" terminal/server.mjs start --cwd "$PWD"
if [[ $? -ne 0 ]]; then read '?按回车关闭…'; fi
