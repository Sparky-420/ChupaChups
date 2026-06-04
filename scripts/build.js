const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'www');
const assets = [
    'index.html',
    'app.js',
    'styles.css',
    'manifest.json',
    'sw.js',
    'icono-192.png',
    'icono-512.png'
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
assets.forEach((asset) => fs.copyFileSync(path.join(root, asset), path.join(output, asset)));
console.log(`Archivos web copiados a ${output}`);
