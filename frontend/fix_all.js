import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(file));
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    });
  } catch(e){}
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let lines = content.split('\n');
  let changed = false;

  for(let i=0; i<lines.length; i++) {
     let line = lines[i];
     if (line.trim().startsWith('const API_URL =')) {
         lines[i] = line.replace(/const API_URL =.*/, "const API_URL = import.meta.env.VITE_API_URL || 'https://camarerio.onrender.com/api';");
         changed = true;
     } else if (line.trim().startsWith('const SOCKET_URL =')) {
         lines[i] = line.replace(/const SOCKET_URL =.*/, "const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://camarerio.onrender.com';");
         changed = true;
     } else if (line.includes("baseURL:")) {
         lines[i] = "  baseURL: import.meta.env.VITE_API_URL || 'https://camarerio.onrender.com/api',";
         changed = true;
     } else if (line.includes("'${import.meta.env")) {
         // Fix broken single quotes template literals
         lines[i] = line.replace(/'\$\{import\.meta\.env([^}]*)\}([^']*)'/g, "`$$$${import.meta.env$1}$2`");
         changed = true;
     }
  }

  // Quick fix for the `${API_URL}/api/tables` issue in roundService
  if (file.includes('roundService.js')) {
      let merged = lines.join('\n');
      if (merged.includes('${API_URL}/api/tables')) {
          merged = merged.replace(/\$\{API_URL\}\/api\/tables/g, '${API_URL}/tables');
          lines = merged.split('\n');
          changed = true;
      }
  }

  if (changed) {
     fs.writeFileSync(file, lines.join('\n'));
     console.log('Fixed', file);
  }
});
