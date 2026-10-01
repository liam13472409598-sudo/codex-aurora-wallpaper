#!/bin/zsh
cd -- "${0:A:h}" || exit 1
source ./scripts/node-runtime.zsh || exit 1
if [[ ! -x "$NODE" ]]; then
 echo '需要 Node.js 22 或更高版本。'; read '?按回车关闭…'; exit 1
fi
# The user starts this launcher intentionally. Warn before interrupting active work.
if "$NODE" runtime.mjs status --app antigravity | /usr/bin/grep -q '"endpoint": false'; then
 if /usr/bin/pgrep -x Antigravity >/dev/null; then
  /usr/bin/osascript -e 'display dialog "首次启用动态壁纸，需要重开 Antigravity 以开启本地壁纸连接。请先保存输入并等待任务结束。\n\n继续后会正常退出并重新打开 Antigravity。" with title "启用极光壁纸" buttons {"取消", "重开并启用"} default button "重开并启用" cancel button "取消"' >/dev/null || exit 0
 fi
fi
"$NODE" runtime.mjs start --app antigravity --restart
if [[ $? -ne 0 ]]; then read '?按回车关闭…'; fi
