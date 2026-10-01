import fs from 'node:fs';

// Antigravity serves its UI on a new origin each launch. Keep wallpaper-only
// settings outside browser storage; unchanged windows cannot overwrite edits.
export function createSettingsStore(file) {
 const seen=new Map();
 function load(){try{const value=JSON.parse(fs.readFileSync(file,'utf8'));return value&&typeof value==='object'&&!Array.isArray(value)?value:undefined;}catch{return undefined;}}
 function save(id,value){
  if(!value||typeof value!=='object'||Array.isArray(value))return;
  const json=JSON.stringify(value),before=seen.get(id);seen.set(id,json);
  if(before===json || (before===undefined && fs.existsSync(file)))return;
  fs.writeFileSync(file+'.tmp',json+'\n',{mode:0o600});fs.renameSync(file+'.tmp',file);
 }
 return {load,save};
}
