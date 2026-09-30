const {chromium}=require('playwright');
const fs=require('fs');const path=require('path');
(async()=>{
 fs.mkdirSync('test-results',{recursive:true});
 const base=path.resolve(__dirname,'..');const {cdp}=await import('file://'+base+'/runtime.mjs');
 const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),headless:true,args:['--remote-debugging-address=127.0.0.1','--remote-debugging-port=9358']});
 try{
 const page=await browser.newPage({viewport:{width:1100,height:760}});await page.goto('file://'+base+'/preview.html');
 const targets=await fetch('http://127.0.0.1:9358/json/list').then(r=>r.json());const target=targets.find(t=>t.type==='page'&&t.url.endsWith('/preview.html'));
 if(!target)throw Error('Missing test target');
 await cdp(target.webSocketDebuggerUrl,'window.__codexAurora.dispose()');
 const code=fs.readFileSync(base+'/wallpaper.js','utf8');await cdp(target.webSocketDebuggerUrl,code);await cdp(target.webSocketDebuggerUrl,code);
 if(await page.locator('#codex-aurora-controls').count()!==1)throw Error('Duplicate injection');
 await cdp(target.webSocketDebuggerUrl,'window.__codexAurora.setSettings({enabled:true,hue:45})');
 if((await cdp(target.webSocketDebuggerUrl,'window.__codexAurora.getSettings()')).hue!==45)throw Error('CDP mutation failed');
 await page.evaluate(()=>window.__codexAurora.show());
 const controls=page.locator('#codex-aurora-controls');
 const dl=page.waitForEvent('download');await controls.getByRole('button',{name:'导出参数',exact:true}).click();const download=await dl;await download.saveAs(path.resolve('test-results/exported-settings.json'));
 const exported=JSON.parse(fs.readFileSync('test-results/exported-settings.json'));if(exported.settings.hue!==45)throw Error('Export mismatch');
 const imported={format:'codex-aurora-v1',settings:{...exported.settings,speed:999,shade:-9,hue:-65}};
 await controls.locator('input[type=file]').setInputFiles({name:'parameters.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(imported))});await page.waitForTimeout(250);
 const params=await cdp(target.webSocketDebuggerUrl,'window.__codexAurora.getSettings()');if(params.speed!==3||params.shade!==0||params.hue!==-65)throw Error('Import validation failed');
 await controls.locator('input[type=file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{bad')});await page.waitForTimeout(150);if(!(await controls.locator('.status').textContent()).includes('导入失败'))throw Error('Invalid JSON not handled');
 await cdp(target.webSocketDebuggerUrl,'window.__codexAurora.dispose()');
 // Same inline style restrictions as the installed app; injection uses CDP, no script-src changes.
 await page.evaluate(()=>{const meta=document.createElement('meta');meta.httpEquiv='Content-Security-Policy';meta.content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:;";document.head.append(meta);});
 await cdp(target.webSocketDebuggerUrl,code);await cdp(target.webSocketDebuggerUrl,'window.__codexAurora.setSettings({enabled:true});window.__codexAurora.show()');await page.waitForTimeout(300);
 const state=await cdp(target.webSocketDebuggerUrl,'window.__codexAurora.getStatus()');if(!state.renderer||state.error)throw Error('CSP injection failure');
 await cdp(target.webSocketDebuggerUrl,'window.__codexAurora.dispose()');
 const restored=await cdp(target.webSocketDebuggerUrl,"({global:!!window.__codexAurora,layer:!!document.getElementById('codex-aurora-layer'),attr:document.documentElement.hasAttribute('data-codex-aurora')})");if(Object.values(restored).some(Boolean))throw Error('Restoration failure');
 console.log('PASS: real CDP injection, idempotence, settings, JSON export/import, bounds/invalid input, CSP compatibility, restore.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
