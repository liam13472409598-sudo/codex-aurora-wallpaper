import fs from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const renderer=stripTypeScriptTypes(fs.readFileSync(path.join(dir,'src/renderer.ts'),'utf8')).replace(/export \{[^}]+\};?\s*$/,'').replace(/[ \t]+$/gm,'').trimEnd()+'\n';
fs.writeFileSync(path.join(dir,'renderer.js'),renderer);
const controls=fs.readFileSync(path.join(dir,'controls.js'),'utf8');
fs.writeFileSync(path.join(dir,'wallpaper.js'),`(()=>{if(window.__codexAurora)return;\n${renderer}\n${controls}\n})();`);
