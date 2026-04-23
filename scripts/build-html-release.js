const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));
const distHtml = path.join(root, 'dist-html');
const src = path.join(root, 'index.html');
const output = path.join(distHtml, `Breast-Followup-System-${pkg.version}.html`);

fs.mkdirSync(distHtml, { recursive: true });
fs.copyFileSync(src, output);

console.log(output);
