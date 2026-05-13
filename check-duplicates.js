const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else if (filepath.endsWith('.ts') || filepath.endsWith('.tsx')) {
      filelist.push(filepath);
    }
  });
  return filelist;
};

const files = walkSync('./src/app');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const regex = /export const dynamic = ['"]force-dynamic['"];/g;
  const matches = content.match(regex);
  if (matches && matches.length > 1) {
    console.log('Duplicate in', file, matches.length);
    let first = true;
    content = content.replace(regex, () => {
      if (first) {
        first = false;
        return "export const dynamic = 'force-dynamic';";
      }
      return '';
    });
    fs.writeFileSync(file, content);
  }
});
console.log('Checked all files');
