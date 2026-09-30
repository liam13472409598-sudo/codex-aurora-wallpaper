const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const {HOSTS,getHost}=await import('../hosts.mjs');
if(HOSTS.cursor.acceptUrl('https://example.com/workbench.html'))throw Error('Cursor URL filter too broad');
if(!HOSTS.cursor.acceptUrl('vscode-file://vscode-app/x/workbench.html'))throw Error('Cursor URL filter rejects workbench');
if(getHost(['--app','cursor']).port===getHost([]).port)throw Error('Ports must be isolated');
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
try{for(const host of ['cursor','claude-terminal']){
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.resolve('preview.html'));
 await page.evaluate(()=>window.__codexAurora.dispose());
 await page.evaluate(h=>{window.__auroraHostConfig={id:h};localStorage.removeItem(h+'-aurora-wallpaper:v1');const m=document.createElement('meta');m.httpEquiv='Content-Security-Policy';m.content="require-trusted-types-for 'script'; trusted-types 'none'";document.head.append(m);},host);
 await page.evaluate(fs.readFileSync('wallpaper.js','utf8'));
 await page.waitForTimeout(300);const status=await page.evaluate(()=>window.__codexAurora.getStatus());if(!status.renderer||status.error)throw Error(host+' rendering failed');
 await page.evaluate(()=>window.__codexAurora.show());
 await page.locator('#codex-aurora-controls').getByRole('button',{name:'紫色星海',exact:true}).click();
 if(await page.evaluate(()=>window.__codexAurora.getSettings().hue)!==95)throw Error('Preset failed');
 await page.evaluate(()=>window.__codexAurora.dispose());if(await page.locator('html[data-aurora-host]').count())throw Error('Host attribute not restored');
 if(errors.length)throw Error(errors.join('\n'));await page.close();
}console.log('PASS: per-app ports/URL filters, Cursor and terminal adapters, Trusted Types, presets and restore.');}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
