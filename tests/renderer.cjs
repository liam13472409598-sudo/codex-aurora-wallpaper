const {chromium}=require('playwright');
const fs=require('fs');const path=require('path');
(async()=>{
 fs.mkdirSync('test-results',{recursive:true});
 const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),headless:true,args:['--enable-webgl']});
 const page=await browser.newPage({viewport:{width:1440,height:960}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=path.resolve(__dirname,'..');await page.goto('file://'+base+'/preview.html');
 await page.waitForFunction(()=>window.__codexAurora?.getStatus().renderer);await page.waitForTimeout(2800);
 console.log('initial',await page.evaluate(()=>window.__codexAurora.getStatus()));
 await page.locator('#codex-aurora-controls').getByRole('button',{name:'打开极光壁纸设置'}).click();
 await page.screenshot({path:path.resolve('test-results/preview.png')});
 const controls=page.locator('#codex-aurora-controls');
 await controls.getByRole('button',{name:'默认',exact:true}).click();await page.waitForTimeout(300);
 console.log('default preset',await page.evaluate(()=>window.__codexAurora.getSettings()));
 await controls.getByRole('spinbutton',{name:'漂移速度数值',exact:true}).fill('0.45');await page.keyboard.press('Tab');
 await page.waitForTimeout(300);await page.reload();await page.waitForFunction(()=>window.__codexAurora?.getStatus().renderer);
 const stored=await page.evaluate(()=>window.__codexAurora.getSettings().speed);if(stored!==.45)throw Error('Persistence failed '+stored);
 for(const quality of ['low','high','medium']){await page.evaluate(q=>window.__codexAurora.setSettings({quality:q}),quality);await page.waitForTimeout(120);if(await page.evaluate(()=>window.__codexAurora.getStatus().error))throw Error('Shader quality failure');}
 // Canvas readback in the same animation frame avoids the discarded drawing buffer.
 const pixels=async()=>page.evaluate(()=>new Promise(resolve=>{const c=document.querySelector('#codex-aurora-layer canvas');const gl=c.getContext('webgl');const original=gl.drawArrays.bind(gl);gl.drawArrays=(...args)=>{original(...args);if(gl.getParameter(gl.FRAMEBUFFER_BINDING)===null){const p=new Uint8Array(32*32*4);gl.readPixels(c.width/2|0,c.height/2|0,32,32,gl.RGBA,gl.UNSIGNED_BYTE,p);gl.drawArrays=original;resolve({sum:p.reduce((a,b)=>a+b,0),error:gl.getError(),values:new Set(p).size});}};window.__codexAurora.setSettings({});}));
 await page.waitForTimeout(5100);const pixelsBefore=await pixels();console.log('pixels',pixelsBefore);if(pixelsBefore.values<10||pixelsBefore.error)throw Error('No rendered aurora');
 await page.evaluate(()=>window.__codexAurora.setSettings({paused:true}));await page.waitForTimeout(200);
 const a=await page.screenshot();await page.waitForTimeout(300);const b=await page.screenshot();if(!a.equals(b))throw Error('Pause not stable');
 await page.evaluate(()=>window.__codexAurora.setSettings({paused:false}));await page.waitForTimeout(600);const c=await page.screenshot();if(b.equals(c))throw Error('Animation not resumed');
 await page.evaluate(()=>window.__codexAurora.setSettings({enabled:false}));if(await page.locator('#codex-aurora-layer').count())throw Error('Disable failed');if(await page.locator('html[data-codex-aurora]').count())throw Error('Restore CSS failed');
 await page.evaluate(()=>window.__codexAurora.setSettings({enabled:true}));await page.waitForTimeout(300);
 await page.evaluate(()=>{const gl=document.querySelector('#codex-aurora-layer canvas').getContext('webgl');window.testLoss=gl.getExtension('WEBGL_lose_context');window.testLoss.loseContext();});await page.waitForTimeout(300);
 await page.evaluate(()=>window.testLoss.restoreContext());await page.waitForTimeout(1200);const restored=await pixels();console.log('restored context',await page.evaluate(()=>window.__codexAurora.getStatus()),restored);if(restored.values<10||restored.error)throw Error('Context recovery pixels failed');
 await page.evaluate(()=>window.__codexAurora.setSettings({paused:false,speed:.9,intensity:1.25,curtainScale:.8,turbulence:.58,glow:1.05,starDensity:.56,shade:.23}));await page.waitForTimeout(2600);await page.evaluate(()=>window.__codexAurora.show());
 await page.screenshot({path:path.resolve('test-results/preview.png')});
 await page.setViewportSize({width:640,height:620});await page.waitForTimeout(200);if(await page.locator('#codex-aurora-controls .panel').evaluate(e=>e.getBoundingClientRect().right>window.innerWidth))throw Error('Narrow panel overflow');
 await page.evaluate(()=>window.__codexAurora.dispose());if(await page.locator('#codex-aurora-controls,#codex-aurora-style,#codex-aurora-layer').count())throw Error('Dispose leak');
 console.log('page errors',errors);if(errors.length)throw Error(errors.join('\n'));
 await browser.close();console.log('PASS: GPU render, three qualities, preset, persistence, pause, resume, toggle, context recovery, resize, removal.');
})().catch(e=>{console.error(e);process.exit(1)});
