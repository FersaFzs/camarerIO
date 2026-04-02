import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir) {
  let results = [];
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
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace all api URLs with a dynamic getter to handle trailing /api or not
  const apiRegex = /'https:\/\/camarerio\.onrender\.com\/api'/g;
  if (apiRegex.test(content)) {
    content = content.replace(apiRegex, "`${import.meta.env.VITE_API_URL?.includes('/api') ? import.meta.env.VITE_API_URL : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api' : 'https://camarerio.onrender.com/api')}`");
    changed = true;
  }
  
  const socketRegex = /'https:\/\/camarerio\.onrender\.com'/g;
  if (socketRegex.test(content)) {
    content = content.replace(socketRegex, "`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://camarerio.onrender.com'}`");
    changed = true;
  }

  // Also fix the case where VITE_API_URL was used directly but might be missing /api
  const viteApiRegex = /import\.meta\.env\.VITE_API_URL\s*\|\|\s*'https:\/\/camarerio\.onrender\.com(\/api)?'/g;
  if (viteApiRegex.test(content) && !changed) {
    content = content.replace(viteApiRegex, "`${import.meta.env.VITE_API_URL?.includes('/api') ? import.meta.env.VITE_API_URL : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api' : 'https://camarerio.onrender.com/api')}`");
    changed = true;
  }

  if (changed) {
     fs.writeFileSync(file, content);
     console.log('Fixed', file);
  }
});

// Fix hardcoded links in Settings.jsx
const settingsPath = './src/pages/admin/Settings.jsx';
if(fs.existsSync(settingsPath)) {
  let settingsContent = fs.readFileSync(settingsPath, 'utf8');
  settingsContent = settingsContent.replace(/https:\/\/camarerio\.onrender\.com\/api/g, '${import.meta.env.VITE_API_URL?.includes("/api") ? import.meta.env.VITE_API_URL : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + "/api" : "https://camarerio.onrender.com/api")}');
  fs.writeFileSync(settingsPath, settingsContent);
}

// Fix Accounting.jsx
const accountingPath = './src/pages/admin/Accounting.jsx';
if(fs.existsSync(accountingPath)) {
  let accountingContent = fs.readFileSync(accountingPath, 'utf8');
  accountingContent = accountingContent.replace(/https:\/\/camarerio\.onrender\.com\/api/g, '${import.meta.env.VITE_API_URL?.includes("/api") ? import.meta.env.VITE_API_URL : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + "/api" : "https://camarerio.onrender.com/api")}');
  fs.writeFileSync(accountingPath, accountingContent);
}

console.log('URLs replaced');
