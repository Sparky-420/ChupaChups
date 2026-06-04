const fs = require('node:fs');
const path = require('node:path');

const outputDirectory = path.resolve('dist');
const webAssets = [
    'index.html',
    'styles.css',
    'app.js',
    'sw.js',
    'manifest.json',
    'icono-192.png',
    'icono-512.png'
];

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

webAssets.forEach((asset) => {
    fs.copyFileSync(path.resolve(asset), path.join(outputDirectory, asset));
});
