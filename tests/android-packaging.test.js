const assert = require('node:assert/strict');
const fs = require('node:fs');

const capacitor = JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8'));
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const androidBuild = fs.readFileSync('android/app/build.gradle', 'utf8');
const androidManifest = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
const mainActivity = fs.readFileSync('android/app/src/main/java/com/sparky/longaniza/MainActivity.java', 'utf8');
const workflow = fs.readFileSync('.github/workflows/android-debug-apk.yml', 'utf8');

assert.deepEqual(capacitor, {
    appId: 'com.sparky.longaniza',
    appName: 'Calculadora de Longaniza',
    webDir: 'www'
});
assert.equal(packageJson.scripts.build, 'node scripts/build.js');
assert.ok(packageJson.scripts['cap:sync'].includes('cap sync android'));
assert.ok(packageJson.scripts['android:debug'].includes('gradle -p android assembleDebug'));
assert.ok(androidBuild.includes('applicationId "com.sparky.longaniza"'));
assert.ok(androidManifest.includes('@drawable/icono_longaniza'));
assert.ok(fs.existsSync('android/app/src/main/res/drawable/icono_longaniza.xml'));
assert.ok(!fs.existsSync('android/app/src/main/res/drawable/icono_longaniza.png'));
assert.ok(!fs.existsSync('android/gradle/wrapper/gradle-wrapper.jar'));
assert.ok(mainActivity.includes('package com.sparky.longaniza;'));
assert.ok(mainActivity.includes('extends BridgeActivity'));
assert.ok(workflow.includes('npm run cap:sync'));
assert.ok(workflow.includes('gradle/actions/setup-gradle@v4'));
assert.ok(workflow.includes('gradle -p android assembleDebug'));
assert.ok(!workflow.includes('./gradlew'));
assert.ok(workflow.includes('android/app/build/outputs/apk/debug/app-debug.apk'));

console.log('La configuración de empaquetado Android es válida.');
