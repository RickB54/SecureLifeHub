const fs = require('fs');
const path = require('path');

const categories = ['weights', 'cardio', 'no-equipment'];

categories.forEach(cat => {
  const src = path.join(__dirname, '..', 'public', 'icons', cat, 'animated');
  const dest = path.join(__dirname, '..', 'public', 'icons', '_detailed-backup', cat);
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  if (fs.existsSync(src)) {
    const files = fs.readdirSync(src);
    files.forEach(file => {
      fs.copyFileSync(path.join(src, file), path.join(dest, file));
    });
    console.log(`Backed up ${files.length} detailed files for ${cat}`);
  }
});
