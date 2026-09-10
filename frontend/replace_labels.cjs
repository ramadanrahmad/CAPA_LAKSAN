const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/pages');

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let changed = false;
      if (content.includes('>Nama Penanggung Jawab<')) {
        content = content.replace(/>Nama Penanggung Jawab</g, '>Nama Petugas<');
        changed = true;
      }
      if (content.includes('>Penanggung Jawab<')) {
        content = content.replace(/>Penanggung Jawab</g, '>Petugas<');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated:', file);
      }
    }
  }
}

processDir(dir);
console.log('Done replacing labels.');
