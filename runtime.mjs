import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn,spawnSync} from 'node:child_process';
import net from 'node:net';
const DIR=path.dirname(fileURLToPath(import.meta.url));
const PORT=9347, BASE=`http://127.0.0.1:${PORT}`, STATE=path.join(DIR,'.runtime');
fs.mkdirSync(STATE,{recursive:true,mode:0o700});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const pidFile=path.join(STATE,'watcher.pid');
const stopFile=path.join(STATE,'stop');
export async function cdp(wsUrl,expression){
 const u=new URL(wsUrl);if(!['127.0.0.1','localhost','[::1]'].includes(u.hostname))throw Error('只允许本机调试连接');
 return await new Promise((resolve,reject)=>{
  const ws=new WebSocket(wsUrl);const timer=setTimeout(()=>finish(Error('CDP 请求超时')),8000);let done=false;
  function finish(err,value){if(done)return;done=true;clearTimeout(timer);ws.close();err?reject(err):resolve(value);}
  ws.onopen=()=>ws.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression,returnByValue:true,awaitPromise:true}}));
  ws.onerror=()=>finish(Error('CDP 连接失败'));
  ws.onclose=()=>{if(!done)finish(Error('CDP 连接已关闭'));};
  ws.onmessage=event=>{let m;try{m=JSON.parse(event.data);}catch{return;}if(m.id!==1)return;if(m.error||m.result?.exceptionDetails)finish(Error(m.error?.message||m.result.exceptionDetails.text));else finish(null,m.result?.result?.value);};
 });
}
async function targets(){try{const r=await fetch(BASE+'/json/list',{signal:AbortSignal.timeout(1000)});if(!r.ok)return[];return(await r.json()).filter(t=>t.type==='page'&&t.url?.startsWith('app://')&&t.webSocketDebuggerUrl);}catch{return[];}}
async function officialEndpoint(){
 const version=await fetch(BASE+'/json/version',{signal:AbortSignal.timeout(1000)}).then(r=>r.json()).catch(()=>null);
 if(!version)return false;
 // Verify the listener belongs to the official app; never inject into an unrelated service.
 const pids=spawnSync('/usr/sbin/lsof',['-t','-nP',`-iTCP:${PORT}`,'-sTCP:LISTEN'],{encoding:'utf8'}).stdout.trim().split(/\s+/).filter(Boolean);
 return pids.some(pid=>{
 const cmd=spawnSync('/bin/ps',['-p',pid,'-o','comm='],{encoding:'utf8'}).stdout.trim();
 return ['/Applications/ChatGPT.app/Contents/MacOS/ChatGPT','/Applications/Codex.app/Contents/MacOS/Codex'].includes(cmd);
 });
}
function appPath(){return ['/Applications/ChatGPT.app/Contents/MacOS/ChatGPT','/Applications/Codex.app/Contents/MacOS/Codex'].find(p=>fs.existsSync(p));}
function appRunning(executable){const out=spawnSync('/bin/ps',['-axo','comm='],{encoding:'utf8'}).stdout;return out.split('\n').some(s=>s.trim()===executable);}
async function portFree(){return new Promise(resolve=>{const s=net.createServer();s.once('error',()=>resolve(false));s.listen(PORT,'127.0.0.1',()=>s.close(()=>resolve(true)));});}
function aliveWatcher(){try{const pid=Number(fs.readFileSync(pidFile,'utf8'));const cmd=spawnSync('/bin/ps',['-p',String(pid),'-o','command='],{encoding:'utf8'}).stdout;return cmd.includes(path.join(DIR,'runtime.mjs'))&&cmd.includes('watch')?pid:null;}catch{return null;}}
async function inject(enable=false){
 const code=fs.readFileSync(path.join(DIR,'wallpaper.js'),'utf8');let applied=0;
 for(const t of await targets()){
  try{
   const safe=await cdp(t.webSocketDebuggerUrl,`(()=>{const r=document.documentElement;const kind=r.getAttribute('data-codex-window-type');return !!document.getElementById('root') && !['extension','quick-chat','pet','voice','mini'].includes(kind) && !!document.querySelector('main,nav,[data-sidebar]');})()`);
   if(!safe)continue;
   const installed=await cdp(t.webSocketDebuggerUrl,'window.__codexAurora?.version');
   if(!installed)await cdp(t.webSocketDebuggerUrl,code);
   if(enable)await cdp(t.webSocketDebuggerUrl,'window.__codexAurora?.setSettings({enabled:true})');
   const result=await cdp(t.webSocketDebuggerUrl,'window.__codexAurora?.getStatus()');
   if(result?.error)throw Error(result.error);
   if(result)applied++;
  }catch(e){console.error('窗口注入：',e.message);}
 }
 return applied;
}
async function start(){
 const executable=appPath();if(!executable)throw Error('未找到 /Applications 中的 Codex / ChatGPT 应用');
 if(!await officialEndpoint()){
  if(!await portFree())throw Error(`端口 ${PORT} 被其他程序占用，未修改任何应用。`);
  if(appRunning(executable)){
   if(!process.argv.includes('--restart'))throw Error('请先用 Cmd+Q 完全退出 Codex，再双击启动器。正在运行的 Codex 尚未开启壁纸端口。');
   const bundle=executable.split('/Contents/')[0];
   const reply=spawnSync('/usr/bin/osascript',['-e',`tell application "${bundle}" to quit`],{encoding:'utf8'});
   if(reply.status!==0)throw Error('Codex 未退出，请手动 Cmd+Q 后重试');
   for(let i=0;i<60&&appRunning(executable);i++)await wait(500);
   if(appRunning(executable))throw Error('Codex 仍在运行，已停止；未强制结束进程。');
  }
  const log=fs.openSync(path.join(STATE,'app-launch.log'),'a',0o600);
  const child=spawn(executable,[`--remote-debugging-address=127.0.0.1`,`--remote-debugging-port=${PORT}`],{detached:true,stdio:['ignore',log,log]});child.unref();fs.closeSync(log);
  for(let i=0;i<60;i++){await wait(500);if(await officialEndpoint())break;}
  if(!await officialEndpoint())throw Error('应用未开放本地壁纸端口。应用文件没有被修改；请查看 .runtime/app-launch.log。');
 }
 let count=0;for(let i=0;i<30;i++){count=await inject(true);if(count)break;await wait(700);}
 if(!count)throw Error('尚未找到兼容的 Codex 主窗口，请打开主窗口后重试。');
 fs.rmSync(stopFile,{force:true});
 if(!aliveWatcher()){
  const log=fs.openSync(path.join(STATE,'wallpaper.log'),'a',0o600);
  const watcher=spawn(process.execPath,[path.join(DIR,'runtime.mjs'),'watch'],{detached:true,stdio:['ignore',log,log]});watcher.unref();fs.closeSync(log);fs.writeFileSync(pidFile,String(watcher.pid),{mode:0o600});
 }
 console.log(`已在 ${count} 个 Codex 窗口启用极光。右上角「✦ 极光」可调参数。`);
}
async function watch(){
 let misses=0;
 try{while(!fs.existsSync(stopFile)){
  if(!await officialEndpoint()){if(++misses>=5)break;}else{misses=0;await inject(false);}
  await wait(2500);
 }}finally{try{if(Number(fs.readFileSync(pidFile,'utf8'))===process.pid)fs.unlinkSync(pidFile);}catch{}}
}
async function restore(){
 fs.writeFileSync(stopFile,'stop',{mode:0o600});
 for(let i=0;i<40&&aliveWatcher();i++)await wait(250);
 if(aliveWatcher())throw Error('壁纸守护程序尚未停止，请稍后重试。');
 if(await officialEndpoint())for(const t of await targets())await cdp(t.webSocketDebuggerUrl,'window.__codexAurora?.dispose()').catch(()=>{});
 console.log('极光及控制面板已移除，恢复原界面。普通重开 Codex 后本地壁纸端口也会关闭。');
}
const isMain=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(isMain){try{const command=process.argv[2]||'start';if(command==='start')await start();else if(command==='watch')await watch();else if(command==='restore')await restore();else if(command==='status')console.log(JSON.stringify({endpoint:await officialEndpoint(),windows:(await targets()).length,watcher:aliveWatcher()},null,2));else throw Error('用法: node runtime.mjs start|restore|status');}catch(e){console.error(e.message);process.exitCode=1;}}
