#!/usr/bin/env node
// Sets versionCode in app.json to yyMMddHH (e.g. 26042214 for 2026-04-22 14h)
const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

const now = new Date();
const yy = String(now.getFullYear()).slice(-2);
const MM = String(now.getMonth() + 1).padStart(2, '0');
const dd = String(now.getDate()).padStart(2, '0');
const HH = String(now.getHours()).padStart(2, '0');
const versionCode = parseInt(`${yy}${MM}${dd}${HH}`, 10);

appJson.expo.android.versionCode = versionCode;
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
console.log(`versionCode → ${versionCode}`);

// Also patch android/app/build.gradle versionName
const version = appJson.expo.version;
const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');
let gradle = fs.readFileSync(buildGradlePath, 'utf8');
gradle = gradle.replace(/versionName\s+"[^"]+"/, `versionName "${version}"`);
fs.writeFileSync(buildGradlePath, gradle);
console.log(`versionName → ${version}`);
