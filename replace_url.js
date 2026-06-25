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

const replaceUrl = () => {
  const files = walkSync(directory);
  let changedFilesCount = 0;
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('http://localhost:8000/api')) {
      // First, replace standard const API = "http://localhost:8000/api" or similar
      content = content.replace(/["']http:\/\/localhost:8000\/api["']/g, "import.meta.env.VITE_API_URL");
      
      // Then, replace embedded template literals like `http://localhost:8000/api/turistas/${id}`
      content = content.replace(/`http:\/\/localhost:8000\/api\//g, "`${import.meta.env.VITE_API_URL}/");
      
      // Also catch any non-backtick occurrences that might be left
      content = content.replace(/http:\/\/localhost:8000\/api/g, "${import.meta.env.VITE_API_URL}");

      fs.writeFileSync(file, content, 'utf8');
      changedFilesCount++;
      console.log(`Updated: ${file}`);
    }
  });
  
  console.log(`\nFinished replacing URLs. Total files updated: ${changedFilesCount}`);
};

replaceUrl();
