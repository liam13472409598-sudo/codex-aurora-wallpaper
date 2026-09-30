import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const files=['src','scripts/node-runtime.zsh','build.mjs','renderer.js','controls.js','wallpaper.js','runtime.mjs','preview.html','启用极光壁纸.command','恢复原界面.command','预览壁纸.command','README.md','使用说明.md','SOURCES.md','LICENSE.md','LICENSE-Code-Codex.txt','THIRD_PARTY_NOTICES.md','docs/preview.png'];
const root=process.cwd();const name='Codex-Aurora-Wallpaper-macOS';
const stage=path.join(root,'dist',name);
fs.mkdirSync(stage,{recursive:true});
for(const file of files){const dest=path.join(stage,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.cpSync(path.join(root,file),dest,{recursive:true});}
const result=spawnSync('/usr/bin/ditto',['-c','-k','--norsrc','--keepParent',stage,path.join(root,'dist',name+'.zip')],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status||1);
console.log('dist/'+name+'.zip');
