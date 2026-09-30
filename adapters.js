function auroraAdapterStyles(host) {
 const base=`
html[data-codex-aurora] {background:#070e18!important;color-scheme:dark;}
html[data-codex-aurora] body {background:transparent!important;isolation:isolate;}
`;
 if(host==='cursor') return base+`
html[data-codex-aurora] body > div:has(.monaco-workbench) {background:transparent!important;}
html[data-codex-aurora] :is(.monaco-workbench,.workspace-container,.workspaces-container,.agent-panel) {
 background:transparent!important;
 --vscode-editor-background:transparent!important;
 --vscode-sideBar-background:rgba(7,15,25,.36)!important;
 --vscode-panel-background:rgba(7,15,25,.34)!important;
 --vscode-activityBar-background:rgba(7,15,25,.48)!important;
 --vscode-editorGroupHeader-tabsBackground:rgba(7,15,25,.36)!important;
 --vscode-titleBar-activeBackground:rgba(7,15,25,.48)!important;
 --vscode-statusBar-background:rgba(7,15,25,.7)!important;
 --vscode-quickInput-background:#102030!important;
 --vscode-menu-background:#102030!important;
 --vscode-input-background:rgba(10,22,34,var(--aurora-glass,.72))!important;
 --vscode-editorWidget-background:rgba(10,22,34,.96)!important;
 --vscode-terminal-background:transparent!important;
}
html[data-codex-aurora] :is(.monaco-editor,.monaco-editor .margin,.monaco-editor-background,.monaco-editor .overflow-guard,.editor-instance,.editor-container,.editor-group-container) {background:transparent!important;}
html[data-codex-aurora] :is(.part.sidebar,.part.auxiliarybar,.part.panel,.agent-panel) {background:rgba(7,15,25,.28)!important;}
html[data-codex-aurora] :is(.interactive-input-part,.composer-container) {background:rgba(10,22,34,var(--aurora-glass,.72))!important;}
html[data-codex-aurora] .xterm-screen {mix-blend-mode:screen;}
html[data-codex-aurora] :is(.quick-input-widget,.context-view .monaco-menu-container,.monaco-dialog-box,.monaco-hover,.suggest-widget) {background:#102030!important;}
`;
 if(host==='claude-terminal') return base+`
html[data-codex-aurora] #terminal-root {background:transparent!important;}
html[data-codex-aurora] .terminal-card {background:rgba(6,14,24,var(--aurora-glass,.72))!important;}
html[data-codex-aurora] .xterm-viewport {background:transparent!important;}
`;
 throw new Error('Unsupported aurora host: '+host);
}
