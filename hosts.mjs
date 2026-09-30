export const HOSTS=Object.freeze({
 codex:{id:'codex',name:'Codex',port:9347,executables:['/Applications/ChatGPT.app/Contents/MacOS/ChatGPT','/Applications/Codex.app/Contents/MacOS/Codex'],acceptUrl:url=>url.startsWith('app://'),probe:`!!document.getElementById('root') && !['extension','quick-chat','pet','voice','mini'].includes(document.documentElement.getAttribute('data-codex-window-type')) && !!document.querySelector('main,nav,[data-sidebar]')`},
 cursor:{id:'cursor',name:'Cursor',port:9348,executables:['/Applications/Cursor.app/Contents/MacOS/Cursor'],acceptUrl:url=>{try{const u=new URL(url);return u.protocol==='vscode-file:'&&u.hostname==='vscode-app'&&u.pathname.endsWith('/workbench.html');}catch{return false;}},probe:`!!document.querySelector('.monaco-workbench')`}
});
export function getHost(argv=process.argv.slice(2)){const i=argv.indexOf('--app');const name=i<0?'codex':argv[i+1];if(!HOSTS[name])throw Error('应用必须是 codex 或 cursor');return HOSTS[name];}
