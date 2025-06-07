const fs = require('fs');
const path = require('path');

function updateImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const updatedContent = content.replace(
    /import connectDB from ['"]@\/lib\/mongodb['"];/g,
    'import { connectDB } from \'@/lib/mongodb\';'
  );
  fs.writeFileSync(filePath, updatedContent);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
      walkDir(filePath);
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      updateImports(filePath);
    }
  });
}

walkDir(path.join(__dirname, '..', 'src'));
