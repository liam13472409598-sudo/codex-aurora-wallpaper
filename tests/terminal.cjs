const {chromium}=require('playwright');const {spawn}=require('child_process');const fs=require('fs');const path=require('path');const os=require('os');const {WebSocket}=require('ws');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
const state=fs.mkdtempSync(path.join(os.tmpdir(),'aurora-terminal-test-'));const child=spawn(process.execPath,[path.resolve('terminal/server.mjs'),'serve','--shell','--cwd',state],{env:{...process.env,AURORA_TERMINAL_STATE_DIR:state},stdio:['ignore','pipe','pipe']});let logs='';child.stdout.on('data',d=>logs+=d);child.stderr.on('data',d=>logs+=d);let browser;
try{
 let s;for(let i=0;i<60;i++){try{s=JSON.parse(fs.readFileSync(path.join(state,'server.json')));break;}catch{await wait(100);}}
 if(!s)throw Error('Test terminal did not start: '+logs);const base=`http://127.0.0.1:${s.port}`;
 if((await fetch(base+'/settings')).status!==403)throw Error('Unauthenticated settings allowed');
 await fetch(base+'/settings',{method:'PUT',headers:{'x-aurora-token':s.token},body:JSON.stringify({hue:23,speed:.35,enabled:true})});
 if((await fetch(base+'/status')).status!==403)throw Error('Unauthenticated status allowed');
 if((await fetch(base+'/status',{headers:{'x-aurora-token':s.token}})).status!==200)throw Error('Status authentication failed');
 const denied=await new Promise(resolve=>{const ws=new WebSocket(`ws://127.0.0.1:${s.port}/pty?token=${s.token}`,{origin:'https://untrusted.example'});ws.on('unexpected-response',(_,res)=>{resolve(res.statusCode);res.resume();ws.terminate();});ws.on('error',()=>{});ws.on('open',()=>{resolve(101);ws.close();});});if(denied!==403)throw Error('Foreign origin accepted');
 browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});const page=await browser.newPage({viewport:{width:1400,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/#'+s.token);
 await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('已连接'));
 await page.waitForFunction(()=>window.__codexAurora?.getSettings().hue===23);
 await page.evaluate(()=>window.__codexAurora.setSettings({hue:0,speed:.7}));await wait(650);
 const saved=JSON.parse(fs.readFileSync(path.join(state,'settings.json')));if(saved.speed!==.7)throw Error('Terminal settings did not persist');
 await page.evaluate(()=>terminal.input("printf '\\nAURORA_PTY_OK\\n'\r",true));
 await page.waitForFunction(()=>{let t='';for(let i=0;i<terminal.buffer.active.length;i++)t+=terminal.buffer.active.getLine(i)?.translateToString();return t.includes('AURORA_PTY_OK');});
 await page.evaluate(()=>terminal.input("printf '\\n中文极光测试\\n'; stty size\r",true));await page.waitForTimeout(300);
 await page.setViewportSize({width:1000,height:700});await page.waitForTimeout(300);const size=await page.evaluate(()=>({cols:terminal.cols,rows:terminal.rows}));if(size.cols<40||size.rows<10)throw Error('Terminal fitting failed');
 await page.evaluate(()=>terminal.input("PS1='aurora > '; printf '\\033[2J\\033[H'; printf 'Claude Code · Aurora terminal\\n\\nLive PTY · resize · UTF-8 · local session\\n'\r",true));
 await page.waitForTimeout(300);await page.evaluate(()=>window.__codexAurora.show());await page.waitForTimeout(2400);fs.mkdirSync('test-results',{recursive:true});await page.screenshot({path:'test-results/claude-terminal.png'});
 await page.close();await wait(500);const stateAfter=await fetch(base+'/status',{headers:{'x-aurora-token':s.token}}).then(r=>r.json());if(stateAfter.sessions!==0)throw Error('PTY leaked after closing tab');if(errors.length)throw Error(errors.join('\n'));
 console.log('PASS: authenticated local PTY, origin rejection, terminal I/O, UTF-8, resize, wallpaper and session cleanup.');
}finally{await browser?.close();child.kill('SIGTERM');await wait(900);fs.rmSync(state,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
