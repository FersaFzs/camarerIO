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
     if (line.trim().startsWith('const API_URL = import.meta.env.VITE_API_URL ||')) {
         lines[i] = "const API_URL = import.meta.env.VITE_API_URL ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : import.meta.env.VITE_API_URL + '/api') : 'https://camarerio.onrender.com/api';";
         changed = true;
     }
  }

  if (changed) {
     fs.writeFileSync(file, lines.join('\n'));
     console.log('Fixed', file);
  }
});
