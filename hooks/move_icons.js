#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const rimraf = require('rimraf');
const Q = require('q');

module.exports = function (context) {
    const deferral = new Q.defer();

    const projectRoot = context.opts.projectRoot;
    const platformRoot = path.join(projectRoot, 'platforms/android/app/src/main/res');
    const zipFilePath = path.join(projectRoot, 'www', 'NotificationIcons.zip');

    // Check if the ZIP file exists
    if (!fs.existsSync(zipFilePath)) {
        console.error('--- ❌ --- NotificationIcons.zip not found in project root.');
        deferral.reject();
        return deferral.promise;
    }

    // Unzip the file and move drawable folders to Android platform directory
    console.log('--- 📦 -- Unzipping NotificationIcons.zip and moving drawable folders...');

    fs.createReadStream(zipFilePath)
        .pipe(unzipper.Extract({ path: projectRoot }))
        .on('close', function () {
            const drawableSourcePath = path.join(projectRoot, 'NotificationIcons');
            
            // List of drawable folders to move
            const drawableFolders = [
                'drawable-hdpi',
                'drawable-mdpi',
                'drawable-xhdpi',
                'drawable-xxhdpi',
                //'drawable-xxxhdpi'
            ];

            // Move each drawable folder to the Android res folder
            drawableFolders.forEach(folder => {
                const source = path.join(drawableSourcePath, folder);
                const destination = path.join(platformRoot, folder);

                // Remove the destination folder if it already exists
                rimraf.sync(destination);

                // Move the folder
                fs.renameSync(source, destination);
                console.log(`-----  ✅ --- Moved ${folder} to ${destination}`);
            });

            // Clean up the unzipped NotificationIcons folder
            rimraf.sync(drawableSourcePath);
            console.log(' -----  ✅ ---  Cleanup done.');

            deferral.resolve();
        })
        .on('error', function (err) {
            console.error(' -----  ❌ ---  Error during unzip:', err);
            deferral.reject(err);
        });

    return deferral.promise;
};