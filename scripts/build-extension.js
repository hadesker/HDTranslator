#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const target = process.argv[2] || 'chrome';
const targets = new Set(['chrome', 'firefox']);

if(!targets.has(target)){
    console.error('Usage: node scripts/build-extension.js <chrome|firefox>');
    process.exit(1);
}

const root = path.resolve(__dirname, '..');
const outputDir = path.join(root, 'dist', target);
const manifestSource = path.join(root, `manifest.${target}.json`);

function shouldSkip(name) {
    return name === '.git' ||
        name === '.gitignore' ||
        name === '.idea' ||
        name === 'dist' ||
        name === 'scripts' ||
        name === 'store' ||
        name === 'manifest.json' ||
        name === 'manifest.chrome.json' ||
        name === 'manifest.firefox.json' ||
        name.endsWith('.zip');
}

function copyRecursive(source, destination) {
    const stats = fs.statSync(source);
    if(stats.isDirectory()){
        fs.mkdirSync(destination, { recursive: true });
        for(const entry of fs.readdirSync(source)){
            if(shouldSkip(entry)){
                continue;
            }
            copyRecursive(path.join(source, entry), path.join(destination, entry));
        }
        return;
    }
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for(const entry of fs.readdirSync(root)){
    if(shouldSkip(entry)){
        continue;
    }
    copyRecursive(path.join(root, entry), path.join(outputDir, entry));
}

fs.copyFileSync(manifestSource, path.join(outputDir, 'manifest.json'));
console.log(`Built ${target} extension in ${path.relative(root, outputDir)}`);
