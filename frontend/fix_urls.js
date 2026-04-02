const fs = require('fs');
const path = require('path');

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

  const apiRegex = /'https:\/\/camarerio\.onrender\.com\/api'/g;
  if (apiRegex.test(content)) {
    content = content.replace(apiRegex, "(import.meta.env.VITE_API_URL || 'https://camarerio.onrender.com/api')");
    changed = true;
  }
  
  const socketRegex = /'https:\/\/camarerio\.onrender\.com'/g;
  if (socketRegex.test(content)) {
    content = content.replace(socketRegex, "(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://camarerio.onrender.com')");
    changed = true;
  }

  if (changed) {
     fs.writeFileSync(file, content);
     console.log('Fixed', file);
  }
});
