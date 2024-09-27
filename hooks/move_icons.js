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
    console.log('--- 📦 -- Unzipping NotificationIcons.zip and processing drawable folders...');

    fs.createReadStream(zipFilePath)
        .pipe(unzipper.Extract({ path: projectRoot }))
        .on('close', function () {
            const drawableSourcePath = path.join(projectRoot, 'NotificationIcons');

            console.log('--- 📂 -- Listing contents of NotificationIcons folder:');

            fs.readdir(drawableSourcePath, (err, files) => {
                if (err) {
                    console.error('----- ❌ --- Error reading unzipped directory:', err);
                    deferral.reject(err);
                    return;
                }

                files.forEach(folder => {
                    const sourceFolder = path.join(drawableSourcePath, folder);
                    console.log(`----- ✅ --- sourceFolder >>>>> ${sourceFolder} -- folder ${folder}`);
                    
                    // Only process drawable folders
                    if (fs.lstatSync(sourceFolder).isDirectory() && folder.startsWith('drawable')) {
                        const destinationFolder = path.join(platformRoot, folder);
                        console.log(`----- ✅ --- destinationFolder >>>>> ${destinationFolder}`);


                        // Ensure the destination drawable folder exists, if not, create it
                        if (!fs.existsSync(destinationFolder)) {
                            fs.mkdirSync(destinationFolder);
                            console.log(`----- 📁 --- Created ${destinationFolder}`);
                        }

                        // Read the content of the drawable folder
                        fs.readdir(sourceFolder, (err, drawableFiles) => {
                            if (err) {
                                console.error(`----- ❌ --- Error reading folder ${sourceFolder}:`, err);
                                return;
                            }

                            // Move each file in the drawable folder
                            drawableFiles.forEach(drawableFile => {
                                const sourceFile = path.join(sourceFolder, drawableFile);
                                console.log(`----- ✅ --- Source FILE TO DRAWABLE ${sourceFile}`);

                                const destinationFile = path.join(destinationFolder, drawableFile);

                                // Move the file to the destination drawable folder
                                fs.renameSync(sourceFile, destinationFile);
                                console.log(`----- ✅ --- Moved ${drawableFile} to ${destinationFolder}`);
                            });
                        });
                    }
                });
            });

            // Clean up the unzipped NotificationIcons folder
            rimraf.sync(drawableSourcePath);
            console.log(' -----  ✅ --- Cleanup done.');

            deferral.resolve();
        })
        .on('error', function (err) {
            console.error(' -----  ❌ --- Error during unzip:', err);
            deferral.reject(err);
        });

    return deferral.promise;
};