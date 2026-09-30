# Shared runtime discovery; no installation or download is performed.
NODE=""
for candidate in "/Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node" "/Applications/Codex.app/Contents/Resources/cua_node/bin/node" "${HOME}/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" "$(command -v node)"; do
 if [[ -x "$candidate" ]] && "$candidate" -e 'if (Number(process.versions.node.split(".")[0]) < 22 || typeof WebSocket !== "function") process.exit(1)' 2>/dev/null; then
  NODE="$candidate"; break
 fi
done
if [[ -z "$NODE" ]]; then
 echo '未找到 Node.js 22+。请安装 Node.js，或使用包含 cua_node 运行时的 Codex 版本。'
 read '?按回车关闭…'
 return 1
fi
