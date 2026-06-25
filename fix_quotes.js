const fs = require('fs');
const path = require('path');

const directory = 'd:/Backupw11/TUP/Proyecto Final/front-turismo/src';

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith('.js') || dirFile.endsWith('.jsx')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const fixQuotes = () => {
  const files = walkSync(directory);
  let changedFilesCount = 0;
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace "\${import.meta.env.VITE_API_URL}..." with `\${import.meta.env.VITE_API_URL}...`
    const regexDoubleQuotes = /"\$\{import\.meta\.env\.VITE_API_URL\}([^"]*)"/g;
    const regexSingleQuotes = /'\$\{import\.meta\.env\.VITE_API_URL\}([^']*)'/g;
    
    let changed = false;
    
    if (regexDoubleQuotes.test(content) || regexSingleQuotes.test(content)) {
      content = content.replace(regexDoubleQuotes, "`\${import.meta.env.VITE_API_URL}$1`");
      content = content.replace(regexSingleQuotes, "`\${import.meta.env.VITE_API_URL}$1`");
      
      fs.writeFileSync(file, content, 'utf8');
      changedFilesCount++;
      console.log(`Fixed quotes in: ${file}`);
    }
  });
  
  console.log(`\nFinished fixing quotes. Total files updated: ${changedFilesCount}`);
};

fixQuotes();
