const KEY = 'codex-aurora-wallpaper:v1';
const fields = [
 ['speed','漂移速度',0,3,.01,'×'],['intensity','极光强度',0,3,.01,'×'],
 ['curtainScale','光幕密度',.05,2,.01,''],['turbulence','湍流扰动',0,1.8,.01,''],
 ['glow','离子辉光',0,2.4,.01,''],['starDensity','星尘数量',0,1.5,.01,''],
 ['hue','极光色相',-180,180,1,'°'],['saturation','色彩饱和度',0,2,.01,'×'],
 ['opacity','壁纸透明度',0,1,.01,''],['shade','阅读遮罩',0,.9,.01,''],
 ['glass','面板不透明度',.1,.95,.01,''],['introDuration','开场时长',.6,6,.05,'秒'],
 ['introFeather','开场羽化',.03,.4,.01,''],['introStart','光幕起点',-.5,.25,.01,''],
 ['introEnd','光幕终点',.8,1.8,.01,''],['introSkyEnd','天空显现',.1,.9,.01,''],
 ['introStarStart','星尘延迟',0,.8,.01,'']
];
const defaults = {...DEFAULT_AURORA_IONOSPHERE_BACKGROUND_SETTINGS, opacity:.88, shade:.27, glass:.72, enabled:true};
const presets = {
 '默认': {...defaults,speed:3,intensity:1.43,curtainScale:2,turbulence:1.65,glow:1.4,starDensity:0,introDuration:4.95,introFeather:.4,introStart:.25,introEnd:1.8,shade:.16},
 '静谧工作': {...defaults,speed:.38,intensity:.85,starDensity:.3,shade:.46},
 '翡翠光幕': {...defaults,speed:.9,intensity:1.35,curtainScale:.8,glow:1.1,shade:.18},
 '紫色星海': {...defaults,hue:95,saturation:1.2,starDensity:1.2,intensity:1.15,shade:.2}
};
function normalize(raw) {
 const x = {...defaults,...normalizeAuroraIonosphereSettings(raw)};
 for (const [key,,min,max] of fields) if (['opacity','shade','glass'].includes(key)) x[key] = clampParticleNumber(raw?.[key],min,max,defaults[key]);
 x.enabled = typeof raw?.enabled === 'boolean' ? raw.enabled : true;
 return x;
}
let settings; try {settings=normalize(JSON.parse(localStorage.getItem(KEY)||'{}'));} catch {settings={...defaults};}
const root = document.documentElement;
const layer = document.createElement('div'); layer.id='codex-aurora-layer'; layer.setAttribute('aria-hidden','true');
layer.style.cssText='position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;background:#070e18;';
const canvas=document.createElement('canvas');canvas.style.cssText='width:100%;height:100%;display:block;';
const shade=document.createElement('div');shade.style.cssText='position:absolute;inset:0;background:#040b16;pointer-events:none;';
layer.append(canvas,shade);
const theme=document.createElement('style');theme.id='codex-aurora-style';
theme.textContent=`
html[data-codex-aurora] {background:#070e18!important;color-scheme:dark;}
html[data-codex-aurora] body {background:transparent!important;isolation:isolate;}
html[data-codex-aurora] #root {position:relative;z-index:1;background:transparent!important;}
html[data-codex-aurora],html[data-codex-aurora] #root,html[data-codex-aurora] #root [data-theme] {
 --lightningcss-light:initial;--lightningcss-dark: ;
 --app-color-background-surface:rgba(7,15,25,.23)!important;
 --app-color-background-surface-under:transparent!important;
 --app-color-background-elevated-primary:rgba(8,19,30,var(--aurora-glass,.72))!important;
 --app-color-background-elevated-primary-opaque:#102130!important;
 --app-color-background-elevated-secondary:rgba(11,24,37,.85)!important;
 --app-color-background-elevated-secondary-opaque:#132334!important;
 --app-color-background-card:rgba(9,20,32,var(--aurora-glass,.72))!important;
 --app-color-background-control:rgba(15,30,43,.85)!important;
 --app-color-background-editor-opaque:#0b1725!important;
 --app-color-background-application-menu:#101f2e!important;
 --color-token-main-surface-primary:rgba(7,15,25,.23)!important;
 --color-token-side-bar-background:rgba(6,14,24,.5)!important;
 --app-shell-panel-background:rgba(9,20,32,var(--aurora-glass,.72))!important;
 --color-text-emphasis:#e8f2f4!important;--color-text-primary:#e8f2f4!important;
 --color-text-secondary:#a9bbc7!important;--color-text-tertiary:#91a4b3!important;
 --color-token-foreground:#e8f2f4!important;
 --color-background-composer-primary:rgba(9,20,32,var(--aurora-glass,.72))!important;
 --composer-layout-surface-background:rgba(9,20,32,var(--aurora-glass,.72))!important;
}
html[data-codex-aurora] #root :is([role=dialog],[role=menu],[role=listbox]) {background:#102030!important;}
`;
const panelHost=document.createElement('div');panelHost.id='codex-aurora-controls';
panelHost.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:2147483600;';
const shadow=panelHost.attachShadow({mode:'open'});
shadow.innerHTML=`<style>
:host{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;color:#e6f5f0;font-size:13px;color-scheme:dark;line-height:1.45}
*{box-sizing:border-box}button,input,select{font:inherit}button,select{cursor:pointer}button{color:inherit}
.toggle{position:absolute;right:18px;top:82px;pointer-events:auto;border:1px solid #72e8cd55;background:#10251eeb;color:#befbe8;border-radius:20px;padding:8px 13px;box-shadow:0 4px 18px #0005;font-size:12px;}
.panel{position:absolute;right:18px;top:126px;bottom:24px;width:min(346px,calc(100vw - 36px));max-height:760px;background:#0b171fed;border:1px solid #aecfc126;border-radius:20px;box-shadow:0 20px 60px #0007;backdrop-filter:blur(24px);pointer-events:auto;display:flex;flex-direction:column;overflow:hidden}
[hidden]{display:none!important}header{padding:20px 22px 14px;border-bottom:1px solid #ffffff12}.eyebrow{color:#72dcc0;font-size:10px;letter-spacing:3px}h2{font-size:21px;font-weight:550;letter-spacing:1px;margin:5px 0}header p{color:#8199a7;font-size:11px;margin:0}.close{float:right;border:0;background:none;font-size:23px;color:#99b3c0;padding:0 2px}.content{padding:16px 22px;overflow-y:auto;scrollbar-width:thin}.presets{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:18px}button.preset,footer button,.actions button{border:1px solid #ffffff19;background:#ffffff06;border-radius:8px;padding:8px;font-size:12px}button:hover{background:#63e5be22;border-color:#63e5be88}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #80e9ce;outline-offset:3px}
h3{font-weight:500;color:#809aa8;font-size:11px;letter-spacing:2px;margin:20px 0 12px}.row{margin-bottom:15px}.rowline{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:7px}.value{display:flex;align-items:center;color:#6be6c6;font-size:11px;gap:3px}.num{width:57px;color:#8feace;background:#ffffff06;border:1px solid transparent;border-radius:4px;text-align:right;font-variant-numeric:tabular-nums;padding:3px;appearance:textfield}.num::-webkit-inner-spin-button{appearance:none}input[type=range]{display:block;width:100%;height:4px;margin:8px 0 2px;accent-color:#71dfc2;cursor:pointer}select{background:#17302f;border:1px solid #78dcb344;color:#c1eee0;padding:7px;border-radius:7px}input[type=checkbox]{accent-color:#70e0bf}.actions{display:flex;gap:8px;margin-top:14px}.actions>*{flex:1}summary{cursor:pointer;color:#9db4c0;font-size:12px;margin:20px 0 15px}.status{color:#7998a5;font-size:11px;margin-top:12px;min-height:16px}.error{color:#f4b9a0}footer{padding:13px 22px;border-top:1px solid #ffffff12;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:10px;color:#688391}footer a{color:#7fa89e;text-decoration:none}.import{display:none}
</style><button class="toggle" aria-expanded="false" aria-label="打开极光壁纸设置">✦ 极光</button>
<section class="panel" hidden aria-label="极光壁纸设置"><header><button class="close" aria-label="关闭设置">×</button><div class="eyebrow">AURORA / LIVE WALLPAPER</div><h2>极光电离层</h2><p>实时渲染 · 所有调整自动保存</p></header><div class="content">
<div class="presets"></div><div class="rowline"><label for="enabled">动态壁纸</label><input id="enabled" type="checkbox"></div>
<h3>渲染与播放</h3><div class="rowline"><label for="quality">渲染质量</label><select id="quality"><option value="low">轻量 · 32 层</option><option value="medium">均衡 · 50 层</option><option value="high">精细 · 72 层</option></select></div>
<div class="actions"><button id="pause">暂停</button><button id="replay">重播开场</button></div>
<h3>光幕与色彩</h3><div id="field"></div><h3>阅读舒适度</h3><div id="reading"></div><details><summary>开场动画参数</summary><div id="intro"></div></details>
<div class="actions"><button id="export">导出参数</button><button id="import">导入参数</button></div><input class="import" type="file" accept="application/json,.json"><div class="status" role="status">本地渲染 · 最高 30 FPS · 隐藏时暂停</div>
</div><footer><span><a href="https://www.shadertoy.com/view/XtGGRt" target="_blank" rel="noreferrer">Auroras / nimitz</a></span><button id="reset">恢复默认参数</button></footer></section>`;
let renderer=null, error=null, disposed=false, saveTimer;
const originalAttr=root.getAttribute('data-codex-aurora');
const oldGlass=root.style.getPropertyValue('--aurora-glass');
const oldGlassPriority=root.style.getPropertyPriority('--aurora-glass');
const $=s=>shadow.querySelector(s);
function status(message,bad=false){$('.status').textContent=message;$('.status').classList.toggle('error',bad);}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(settings));}catch{status('设置无法保存：本地存储不可用',true);}}
function apply(){
 if(disposed)return;
 if(settings.enabled){
  root.setAttribute('data-codex-aurora','');root.style.setProperty('--aurora-glass',String(settings.glass));
  if(!layer.isConnected)document.body.prepend(layer);
  if(!theme.isConnected)document.head.append(theme);
  canvas.style.opacity=String(settings.opacity);shade.style.opacity=String(settings.shade);
  if(!renderer){try{renderer=new AuroraIonosphereRenderer(layer,canvas,settings,msg=>{error=msg;status(msg?'图形状态：'+msg:'本地渲染 · 最高 30 FPS · 隐藏时暂停',!!msg);});}catch(e){error=e.message;settings.enabled=false;status('无法启动极光：'+e.message,true);apply();return;}}
  else renderer.setSettings(settings);
 }else{
  renderer?.dispose();renderer=null;layer.remove();theme.remove();
  if(originalAttr===null)root.removeAttribute('data-codex-aurora');else root.setAttribute('data-codex-aurora',originalAttr);
  if(oldGlass)root.style.setProperty('--aurora-glass',oldGlass,oldGlassPriority);else root.style.removeProperty('--aurora-glass');
 }
 $('#enabled').checked=settings.enabled;$('#pause').textContent=settings.paused?'继续动画':'暂停动画';
 clearTimeout(saveTimer);saveTimer=setTimeout(persist,160);
}
function sync(){for(const [key] of fields){shadow.querySelectorAll(`[data-key="${key}"]`).forEach(el=>el.value=settings[key]);}$('#quality').value=settings.quality;apply();}
for(const [name,value]of Object.entries(presets)){const b=document.createElement('button');b.className='preset';b.textContent=name;b.onclick=()=>{settings={...value};sync();renderer?.replay();};$('.presets').append(b);}
for(const [key,label,min,max,step,unit]of fields){
 const box=document.createElement('div');box.className='row';
 box.innerHTML=`<div class="rowline"><label for="range-${key}">${label}</label><span class="value"><input class="num" type="number" min="${min}" max="${max}" step="${step}" data-key="${key}" aria-label="${label}数值"><span>${unit}</span></span></div><input id="range-${key}" type="range" min="${min}" max="${max}" step="${step}" data-key="${key}" aria-label="${label}">`;
 $(key.startsWith('intro')?'#intro':['opacity','shade','glass'].includes(key)?'#reading':'#field').append(box);
 box.querySelectorAll('input').forEach(input=>input.addEventListener(input.type==='range'?'input':'change',()=>{const v=input.valueAsNumber;if(Number.isFinite(v)){settings[key]=Math.min(max,Math.max(min,v));sync();}}));
}
function show(on){$('.panel').hidden=!on;$('.toggle').setAttribute('aria-expanded',String(on));if(on)$('.close').focus();else $('.toggle').focus();}
$('.toggle').onclick=()=>show($('.panel').hidden);$('.close').onclick=()=>show(false);
shadow.addEventListener('keydown',e=>{if(e.key==='Escape')show(false);});
$('#enabled').onchange=e=>{settings.enabled=e.target.checked;apply();};
$('#quality').onchange=e=>{settings.quality=e.target.value;apply();};
$('#pause').onclick=()=>{settings.paused=!settings.paused;apply();};$('#replay').onclick=()=>renderer?.replay();
$('#reset').onclick=()=>{settings={...defaults};sync();renderer?.replay();};
$('#export').onclick=()=>{const a=document.createElement('a');const url=URL.createObjectURL(new Blob([JSON.stringify({format:'codex-aurora-v1',settings},null,2)],{type:'application/json'}));a.href=url;a.download='极光壁纸参数.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);};
$('#import').onclick=()=>$('.import').click();$('.import').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>100000)throw Error('文件过大');const v=JSON.parse(await f.text());if(v.format!=='codex-aurora-v1'||!isObjectRecord(v.settings))throw Error('不是有效的极光参数文件');settings=normalize(v.settings);sync();status('参数已导入并保存');}catch(e){status('导入失败：'+e.message,true);}finally{$('.import').value='';}};
function storage(e){if(e.key===KEY){try{settings=normalize(JSON.parse(e.newValue||'{}'));sync();}catch{}}}
window.addEventListener('storage',storage);
document.body.append(panelHost);
window.__codexAurora={version:'1.0.0',getSettings:()=>({...settings}),getStatus:()=>({enabled:settings.enabled,error,canvas:[canvas.width,canvas.height],renderer:!!renderer}),setSettings:v=>{settings=normalize({...settings,...v});sync();},show:()=>show(true),dispose:()=>{if(disposed)return;settings.enabled=false;apply();clearTimeout(saveTimer);persist();disposed=true;window.removeEventListener('storage',storage);panelHost.remove();delete window.__codexAurora;}};
sync();
