# Codex Aurora Wallpaper · 极光动态壁纸

为 macOS 上的 Codex 添加实时极光背景和中文参数面板。17 个数值参数、三档画质、四种预设，支持自动保存、暂停、导入导出和一键还原。

![极光与中文控制面板预览](docs/preview.png)

> 图中是独立预览页的演示布局。壁纸可以加载到真实 Codex 主窗口；本项目是非官方定制，与 OpenAI 无关联。

## 下载与启用

1. 从 [Releases](https://github.com/liam13472409598-sudo/codex-aurora-wallpaper/releases/latest) 下载 `Codex-Aurora-Wallpaper-macOS.zip` 并解压。
2. 等待当前 Codex 任务完成并保存输入，然后双击 **启用极光壁纸.command**。
3. 首次启用需重开 Codex，启动器会先提示；完成后点击右上角的 **✦ 极光**。

通过启动器开启应用时，壁纸会被自动加载。普通方式重开 Codex 不会自动启用壁纸。

想先体验效果，可双击 **预览壁纸.command**。完整移除壁纸和设置入口，双击 **恢复原界面.command**。

如果 macOS 没有直接执行 `.command`，可在终端进入解压目录后运行：

```sh
zsh ./启用极光壁纸.command
```

## 参数

| 类别 | 可调内容 |
| --- | --- |
| 光幕 | 漂移速度、强度、密度、湍流、辉光 |
| 色彩与星空 | 色相、饱和度、星尘数量 |
| 阅读 | 壁纸透明度、阅读遮罩、面板不透明度 |
| 开场 | 时长、羽化、光幕起点与终点、天空显现、星尘延迟 |
| 渲染 | 轻量 32 层 / 均衡 50 层 / 精细 72 层 |

预设为 **默认、静谧工作、翡翠光幕、紫色星海**。滑块旁的数字可直接编辑。参数自动保存，JSON 文件可在预览页与 Codex 之间导入导出。

最高约 30 FPS，窗口文档隐藏时暂停绘制；支持自适应分辨率、暂停／继续、重播开场和显卡上下文恢复。

## 运行方式与兼容性

- macOS，安装在 `/Applications/ChatGPT.app` 或 `/Applications/Codex.app` 的 Codex 桌面应用。
- 优先使用应用自带的 Node.js，备用为 Codex 工作区运行时或 PATH 中的 Node.js 22+。
- 通过 `127.0.0.1:9347` 的本机 CDP 通道注入；先核对监听进程属于官方应用，再加载壁纸。
- 不修改应用包、`app.asar`、代码签名或登录配置。
- “恢复原界面”移除壁纸并停止守护程序；普通方式退出重开 Codex 后，调试端口也会关闭。
- 已在本机 Codex 主窗口启用并检查渲染器状态。Codex 界面更新后可能需要调整兼容选择器；这不是官方壁纸接口。

更多说明见 [使用说明](使用说明.md)。

## 开发

构建需要 Node.js 24。运行已有发行包不需要 npm 安装依赖。

```sh
npm ci
npm run build
npm run check
npx playwright install chromium
npm test
```

测试也可使用本机 Chrome：

```sh
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm test
```

在 macOS 上生成发行 ZIP：

```sh
npm run package
```

测试覆盖真实 WebGL 渲染、三档画质、持久化、暂停恢复、上下文丢失恢复、缩放、CDP 注入、参数导入导出和清理。运行日志、测试结果和用户设置不进入仓库或发行包。

## 来源与许可

极光基于 **nimitz (@stormoid)** 的 [Auroras](https://www.shadertoy.com/view/XtGGRt)，渲染器改编自 [Rice-dog/code-codex](https://github.com/Rice-dog/code-codex)。本项目加入独立控制面板、macOS 启停脚本、阅读参数和渲染恢复修复。

**整个效果不适用统一 MIT 许可。** 原 Shader 的许可证据在上游仍标为有条件适用；相关非商业、署名与相同方式共享条款及其边界，见 [LICENSE.md](LICENSE.md)、[SOURCES.md](SOURCES.md) 和 [上游第三方声明](THIRD_PARTY_NOTICES.md)。
