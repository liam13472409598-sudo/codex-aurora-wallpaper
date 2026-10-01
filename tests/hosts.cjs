const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const os=require('os');const assert=require('node:assert/strict');
(async()=>{const {HOSTS,getHost}=await import('../hosts.mjs');
if(HOSTS.cursor.acceptUrl('https://example.com/workbench.html'))throw Error('Cursor URL filter too broad');
if(!HOSTS.cursor.acceptUrl('vscode-file://vscode-app/x/workbench.html'))throw Error('Cursor URL filter rejects workbench');
if(getHost(['--app','cursor']).port===getHost([]).port)throw Error('Ports must be isolated');
assert.equal(new Set(Object.values(HOSTS).map(h=>h.port)).size,Object.keys(HOSTS).length);
assert.throws(()=>getHost(['--app','toString']));
assert(HOSTS.antigravity.acceptUrl('https://127.0.0.1:52468/'));
for(const url of ['https://antigravity.google/','http://127.0.0.1:52468/','https://127.0.0.1:52468/login','https://127.0.0.1.evil.test:52468/','https://user@127.0.0.1:52468/','data:text/html,test'])assert(!HOSTS.antigravity.acceptUrl(url),url);
const {createSettingsStore}=await import('../settings-store.mjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'aurora-settings-test-'));
try{const file=path.join(dir,'settings.json'),store=createSettingsStore(file);
 assert.equal(store.load(),undefined);store.save('window-a',{speed:1});store.save('window-b',{speed:1});
 store.save('window-a',{speed:1.75});store.save('window-b',{speed:1});assert.equal(store.load().speed,1.75);
 assert.equal(createSettingsStore(file).load().speed,1.75);assert.equal(fs.statSync(file).mode&0o777,0o600);
 fs.writeFileSync(file,'invalid JSON');assert.equal(store.load(),undefined);
}finally{fs.rmSync(dir,{recursive:true,force:true});}
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
try{for(const host of ['cursor','antigravity','claude-terminal']){
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.resolve('preview.html'));
 await page.evaluate(()=>window.__codexAurora.dispose());
 if(host==='antigravity')await page.evaluate(()=>{document.body.classList.add('theme-standalone');window.electronNative={};const shell=document.createElement('div');shell.className='bg-background';const side=document.createElement('div');side.className='bg-sidebar';shell.append(side);document.getElementById('root').append(shell);});
 if(host==='antigravity')assert.equal(await page.evaluate(HOSTS.antigravity.probe),true);
 await page.evaluate(h=>{window.__auroraHostConfig={id:h};localStorage.removeItem(h+'-aurora-wallpaper:v1');const m=document.createElement('meta');m.httpEquiv='Content-Security-Policy';m.content="require-trusted-types-for 'script'; trusted-types 'none'";document.head.append(m);},host);
 if(host==='antigravity')await page.evaluate(()=>window.__auroraHostConfig.settings={speed:1.75,glass:.55});
 await page.evaluate(fs.readFileSync('wallpaper.js','utf8'));
 await page.waitForTimeout(300);const status=await page.evaluate(()=>window.__codexAurora.getStatus());if(!status.renderer||status.error)throw Error(host+' rendering failed');
 if(host==='antigravity'){
  assert.equal(await page.evaluate(()=>window.__codexAurora.getSettings().speed),1.75);
  assert.equal(await page.locator('#root .bg-background').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
 }
 await page.evaluate(()=>window.__codexAurora.show());
 await page.locator('#codex-aurora-controls').getByRole('button',{name:'紫色星海',exact:true}).click();
 if(await page.evaluate(()=>window.__codexAurora.getSettings().hue)!==95)throw Error('Preset failed');
 await page.evaluate(()=>window.__codexAurora.dispose());if(await page.locator('html[data-aurora-host]').count())throw Error('Host attribute not restored');
 if(errors.length)throw Error(errors.join('\n'));await page.close();
}console.log('PASS: isolated host ports/URL filters, random-origin settings persistence, all adapters, Trusted Types, presets and restore.');}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
