const fs = require('fs');
const path = require('path');

const cmakePath = path.join(
  __dirname,
  '..',
  'android',
  'app',
  'build',
  'generated',
  'autolinking',
  'src',
  'main',
  'jni',
  'Android-autolinking.cmake'
);

if (!fs.existsSync(cmakePath)) {
  console.warn('⚠️  Android-autolinking.cmake not found. Skipping patch.');
  process.exit(0);
}

let content = fs.readFileSync(cmakePath, 'utf8');
let patched = false;

const patchedContent = content.replace(
  /^add_subdirectory\(([^)]+)\)$/gm,
  (match, folderPath) => {
    patched = true;
    return `if(EXISTS ${folderPath})\n  ${match}\nendif()`;
  }
);

if (patched) {
  fs.writeFileSync(cmakePath, patchedContent, 'utf8');
  console.log('✅ Patched Android-autolinking.cmake with conditional guards');
} else {
  console.log('ℹ️  No add_subdirectory() calls found to patch.');
}