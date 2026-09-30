window.__auroraHostConfig={id:'claude-terminal'};
const terminal=new Terminal({allowTransparency:true,fontFamily:'Menlo, Monaco, "SFMono-Regular", monospace',fontSize:13,lineHeight:1.22,cursorBlink:true,scrollback:5000,theme:{background:'#00000000',foreground:'#e1eee9',cursor:'#9bf0ce',selectionBackground:'#68d9b94d',black:'#14232e',brightBlack:'#728898',red:'#ed8d94',green:'#89d7af',yellow:'#e8c68d',blue:'#85bce5',magenta:'#b4a3df',cyan:'#79d7d1',white:'#dfece6',brightWhite:'#ffffff'}});
const fit=new FitAddon.FitAddon();terminal.loadAddon(fit);terminal.open(document.getElementById('terminal'));
const state=document.getElementById('status'),token=location.hash.slice(1);let socket;
const encode=bytes=>{let raw='';for(const b of bytes)raw+=String.fromCharCode(b);return btoa(raw);};
function resize(){fit.fit();if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify({type:'resize',cols:terminal.cols,rows:terminal.rows}));}
function connect(){
 if(!/^[a-f0-9]{64}$/.test(token)){state.textContent='连接链接已失效，请重新使用启动器';return;}
 if(socket)socket.close();const current=new WebSocket(`ws://${location.host}/pty?token=${token}`);socket=current;state.textContent='正在连接…';
 current.onopen=()=>{if(socket!==current)return;state.textContent='已连接 · 本机';resize();terminal.focus();};
 current.onmessage=e=>{if(socket!==current)return;const m=JSON.parse(e.data);if(m.type==='output'){const raw=atob(m.data);terminal.write(Uint8Array.from(raw,c=>c.charCodeAt(0)));}else if(m.type==='exit'){state.textContent='会话已结束';}else if(m.type==='error'){state.textContent=m.message;}};
 current.onclose=()=>{if(socket===current)state.textContent='会话已断开';};current.onerror=()=>{if(socket===current)state.textContent='连接失败，请重新使用启动器';};
}
terminal.onData(data=>{if(socket?.readyState!==WebSocket.OPEN)return;const bytes=new TextEncoder().encode(data);for(let i=0;i<bytes.length;i+=8000)socket.send(JSON.stringify({type:'input',data:encode(bytes.slice(i,i+8000))}));});
new ResizeObserver(resize).observe(document.getElementById('terminal'));
document.getElementById('reconnect').onclick=()=>{if(socket?.readyState===WebSocket.OPEN&&!confirm('新建终端会结束当前会话。继续吗？'))return;terminal.reset();connect();};
window.addEventListener('beforeunload',()=>socket?.close());
connect();

// Persist on the local service so random-port changes do not lose the preset.
window.addEventListener('load',async()=>{
 try{const r=await fetch('/settings',{headers:{'x-aurora-token':token}});if(r.ok){const settings=await r.json();if(Object.keys(settings).length)window.__codexAurora?.setSettings(settings);}}catch{}
 let timer;window.addEventListener('aurora-settings-changed',e=>{if(e.detail?.host!=='claude-terminal')return;clearTimeout(timer);timer=setTimeout(()=>fetch('/settings',{method:'PUT',headers:{'x-aurora-token':token,'Content-Type':'application/json'},body:JSON.stringify(e.detail.settings)}).catch(()=>{}),180);});
});
