import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import crypto from 'node:crypto';import readline from 'node:readline';
import {spawn,spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {WebSocketServer} from 'ws';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(here),state=process.env.AURORA_TERMINAL_STATE_DIR||path.join(root,'.runtime','claude-terminal'),stateFile=path.join(state,'server.json');
fs.mkdirSync(state,{recursive:true,mode:0o700});
const args=process.argv.slice(2),mode=args[0]||'start';
const arg=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1];};
const tokenEqual=(a,b)=>typeof a==='string'&&typeof b==='string'&&a.length===b.length&&crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function running(){
 try{const s=JSON.parse(fs.readFileSync(stateFile));if(!Number.isInteger(s.port)||s.port<1024||s.port>65535)return null;
 const cmd=spawnSync('/bin/ps',['-p',String(s.pid),'-o','command='],{encoding:'utf8'}).stdout;
 if(!cmd.includes(fileURLToPath(import.meta.url))||!cmd.includes('serve'))return null;
 const r=await fetch(`http://127.0.0.1:${s.port}/status`,{headers:{'x-aurora-token':s.token},signal:AbortSignal.timeout(1000)});return r.ok?s:null;
 }catch{return null;}
}
function openWindow(s){const url=`http://127.0.0.1:${s.port}/#${s.token}`;const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';const p=fs.existsSync(chrome)?spawn(chrome,[`--app=${url}`],{detached:true,stdio:'ignore'}):spawn('/usr/bin/open',[url],{detached:true,stdio:'ignore'});p.unref();}
async function start(){
 let s=await running();if(!s){const log=fs.openSync(path.join(state,'server.log'),'a',0o600);const p=spawn(process.execPath,[fileURLToPath(import.meta.url),'serve','--cwd',path.resolve(arg('--cwd',process.cwd()))],{detached:true,stdio:['ignore',log,log]});p.unref();fs.closeSync(log);
 for(let i=0;i<50;i++){await sleep(150);s=await running();if(s)break;}if(!s)throw Error('极光终端未能启动，请查看 .runtime/claude-terminal/server.log');}
 if(!args.includes('--no-open'))openWindow(s);
 console.log('Claude Code 极光终端已启动。关闭窗口会结束该窗口的终端会话。');
}
async function serve(){
 const token=crypto.randomBytes(32).toString('hex');const cwd=path.resolve(arg('--cwd',process.cwd()));if(!fs.statSync(cwd).isDirectory())throw Error('工作目录不存在');
 const python=arg('--python',spawnSync('/usr/bin/which',['python3'],{encoding:'utf8'}).stdout.trim());if(!python)throw Error('需要 Python 3 来运行终端 PTY');
 const assets=new Map([
 ['/',['terminal/index.html','text/html; charset=utf-8']],['/client.js',['terminal/client.js','text/javascript; charset=utf-8']],['/terminal.css',['terminal/terminal.css','text/css; charset=utf-8']],
 ['/wallpaper.js',['wallpaper.js','text/javascript; charset=utf-8']],['/xterm.js',['node_modules/@xterm/xterm/lib/xterm.js','text/javascript']],['/xterm.css',['node_modules/@xterm/xterm/css/xterm.css','text/css']],['/fit.js',['node_modules/@xterm/addon-fit/lib/addon-fit.js','text/javascript']]
 ]);
 const sessions=new Set();let port,stopping=false;
 const authorized=req=>tokenEqual(req.headers['x-aurora-token'],token);
 const sameHost=req=>req.headers.host===`127.0.0.1:${port}`;
 const server=http.createServer((req,res)=>{
  if(!sameHost(req)){res.writeHead(403).end();return;}
  const u=new URL(req.url,`http://127.0.0.1:${port}`);
  if(u.pathname==='/status'){res.writeHead(authorized(req)?200:403,{'Content-Type':'application/json'}).end(authorized(req)?JSON.stringify({app:'aurora-terminal',sessions:sessions.size}):'{}');return;}
  if(u.pathname==='/settings'){
   if(!authorized(req)){res.writeHead(403).end();return;}
   const configFile=path.join(state,'settings.json');
   if(req.method==='GET'){let config={};try{config=JSON.parse(fs.readFileSync(configFile));}catch{}res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify(config));return;}
   if(req.method==='PUT'){
    let data='';req.on('data',chunk=>{data+=chunk;if(data.length>16384)req.destroy();});req.on('end',()=>{try{
     const input=JSON.parse(data);if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid settings');const clean={};
     const ranges={speed:[0,3],intensity:[0,3],curtainScale:[.05,2],turbulence:[0,1.8],glow:[0,2.4],starDensity:[0,1.5],hue:[-180,180],saturation:[0,2],opacity:[0,1],shade:[0,.9],glass:[.1,.95],introDuration:[.6,6],introFeather:[.03,.4],introStart:[-.5,.25],introEnd:[.8,1.8],introSkyEnd:[.1,.9],introStarStart:[0,.8]};
     for(const [k,[min,max]]of Object.entries(ranges))if(typeof input[k]==='number'&&Number.isFinite(input[k]))clean[k]=Math.max(min,Math.min(max,input[k]));
     for(const k of ['enabled','paused'])if(typeof input[k]==='boolean')clean[k]=input[k];if(['low','medium','high'].includes(input.quality))clean.quality=input.quality;
     fs.writeFileSync(configFile+'.tmp',JSON.stringify(clean),{mode:0o600});fs.renameSync(configFile+'.tmp',configFile);res.writeHead(200).end('ok');
    }catch{res.writeHead(400).end('Invalid settings');}});return;
   }
   res.writeHead(405).end();return;
  }
  if(u.pathname==='/shutdown'&&req.method==='POST'){if(!authorized(req)){res.writeHead(403).end();return;}res.writeHead(200).end('ok');void shutdown();return;}
  if(req.method!=='GET'||!assets.has(u.pathname)){res.writeHead(404).end();return;}
  const [file,type]=assets.get(u.pathname);
  res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':`default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' ws://127.0.0.1:${port}; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'`});fs.createReadStream(path.join(root,file)).on('error',()=>res.destroy()).pipe(res);
 });
 const wss=new WebSocketServer({noServer:true,maxPayload:65536});
 server.on('upgrade',(req,socket,head)=>{
  const u=new URL(req.url,`http://127.0.0.1:${port}`);
  if(!sameHost(req)||req.headers.origin!==`http://127.0.0.1:${port}`||u.pathname!=='/pty'||!tokenEqual(u.searchParams.get('token'),token)){socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');return;}
  wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,req));
 });
 wss.on('connection',ws=>{
  const child=spawn(python,[path.join(here,'pty-host.py'),...(args.includes('--shell')?['--shell']:[])],{cwd,env:process.env,stdio:['pipe','pipe','pipe']});sessions.add(child);
  const lines=readline.createInterface({input:child.stdout});
  lines.on('line',line=>{if(ws.readyState!==1)return;if(ws.bufferedAmount>4*1024*1024){ws.close(1009,'Output buffer exceeded');return;}ws.send(line);});
  child.stderr.on('data',()=>{if(ws.readyState===1)ws.send(JSON.stringify({type:'error',message:'终端进程发生错误，请重新连接。'}));});
  child.on('error',()=>{if(ws.readyState===1)ws.send(JSON.stringify({type:'error',message:'无法启动 Python PTY。请检查 Python 3。'}));ws.close();});
  child.on('exit',code=>{sessions.delete(child);if(ws.readyState===1){ws.send(JSON.stringify({type:'exit',code}));ws.close();}});
  ws.on('message',data=>{let m;try{m=JSON.parse(data.toString());}catch{return;}
   if(m.type==='input'&&typeof m.data==='string'&&m.data.length<=64000)child.stdin.write(JSON.stringify({type:'input',data:m.data})+'\n');
   else if(m.type==='resize'&&Number.isInteger(m.cols)&&Number.isInteger(m.rows))child.stdin.write(JSON.stringify({type:'resize',cols:Math.max(2,Math.min(500,m.cols)),rows:Math.max(2,Math.min(200,m.rows))})+'\n');
  });
  ws.on('close',()=>{lines.close();child.stdin.end();child.kill('SIGTERM');});
  ws.on('error',()=>child.kill('SIGTERM'));child.stdin.on('error',()=>{});
 });
 async function shutdown(){if(stopping)return;stopping=true;for(const ws of wss.clients)ws.close();for(const child of sessions)child.kill('SIGTERM');
 try{const s=JSON.parse(fs.readFileSync(stateFile));if(s.pid===process.pid)fs.unlinkSync(stateFile);}catch{}
 server.close();wss.close();setTimeout(()=>process.exit(0),800).unref();
 }
 process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});port=server.address().port;
 fs.writeFileSync(stateFile,JSON.stringify({pid:process.pid,port,token}),{mode:0o600});console.log('Aurora PTY service ready on localhost');
}
try{if(mode==='start')await start();else if(mode==='serve')await serve();else if(mode==='stop'){const s=await running();if(s)await fetch(`http://127.0.0.1:${s.port}/shutdown`,{method:'POST',headers:{'x-aurora-token':s.token}});console.log('Claude Code 极光终端已停止。');}else if(mode==='status'){const s=await running();console.log(JSON.stringify({running:!!s,port:s?.port}));}else throw Error('用法：node terminal/server.mjs start|stop|status [--cwd 目录]');}catch(e){console.error(e.message);process.exitCode=1;}
