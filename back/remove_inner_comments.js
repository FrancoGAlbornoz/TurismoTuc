import fs from 'fs';
import path from 'path';

const controllersDir = path.join(process.cwd(), 'controllers');

const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.controller.js'));

for (const file of files) {
  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Regex to remove any line that has 1 or more spaces followed by //
  // We use the 'm' flag so ^ matches the start of a line.
  // It matches: start of line, one or more whitespace, //, then anything until the end of line.
  const initialLength = content.length;
  content = content.replace(/^\s+\/\/.*$/gm, '');
  
  // Also remove empty lines that might have been left behind (optional, maybe leave them or clean them)
  // Let's just do a simple replace of multiple empty lines.
  content = content.replace(/\n{3,}/g, '\n\n');

  if (content.length !== initialLength) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Cleaned inner comments in ${file}`);
  }
}
