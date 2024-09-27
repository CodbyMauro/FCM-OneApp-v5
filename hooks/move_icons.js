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

    // Verifica se o arquivo ZIP existe
    if (!fs.existsSync(zipFilePath)) {
        console.error('--- ❌ --- NotificationIcons.zip não encontrado no diretório do projeto.');
        deferral.reject();
        return deferral.promise;
    }

    // Faz o unzip e move os arquivos PNG para os diretórios correspondentes
    console.log('--- 📦 -- Descompactando NotificationIcons.zip e movendo arquivos PNG...');

    fs.createReadStream(zipFilePath)
        .pipe(unzipper.Extract({ path: projectRoot }))
        .on('close', function () {
            const drawableSourcePath = path.join(projectRoot, 'NotificationIcons');

            // Lista das pastas drawable que serão processadas
            const drawableFolders = [
                'drawable-hdpi',
                'drawable-mdpi',
                'drawable-xhdpi',
                'drawable-xxhdpi',
                'drawable-xxxhdpi'
            ];

            // Processa cada pasta drawable e move o arquivo PNG
            drawableFolders.forEach(folder => {
                const sourceFolder = path.join(drawableSourcePath, folder);
                const destinationFolder = path.join(platformRoot, folder);

                // Verifica se a pasta de origem existe e contém um arquivo PNG
                if (fs.existsSync(sourceFolder)) {
                    // Obtém os arquivos PNG dentro da pasta
                    const pngFiles = fs.readdirSync(sourceFolder).filter(file => path.extname(file) === '.png');

                    if (pngFiles.length > 0) {
                        pngFiles.forEach(pngFile => {
                            const sourceFile = path.join(sourceFolder, pngFile);
                            const destinationFile = path.join(destinationFolder, pngFile);

                            // Cria a pasta de destino, se não existir
                            if (!fs.existsSync(destinationFolder)) {
                                fs.mkdirSync(destinationFolder);
                                console.log(`----- 📁 --- Criada a pasta ${destinationFolder}`);
                            }

                            // Verifica se o arquivo PNG já existe no destino
                            if (fs.existsSync(destinationFile)) {
                                // Se o arquivo existir, remove o arquivo antigo antes de mover o novo
                                rimraf.sync(destinationFile);
                                console.log(`----- 🚮 --- Arquivo existente removido: ${destinationFile}`);
                            }

                            // Move o novo arquivo PNG para a pasta de destino
                            fs.renameSync(sourceFile, destinationFile);
                            console.log(`----- ✅ --- Arquivo ${pngFile} movido para ${destinationFolder}`);
                        });
                    } else {
                        console.log(`----- ⚠️ --- Nenhum arquivo PNG encontrado em ${sourceFolder}`);
                    }
                } else {
                    console.log(`----- ⚠️ --- Pasta ${sourceFolder} não encontrada.`);
                }
            });

            // Limpa a pasta NotificationIcons após a movimentação
            rimraf.sync(drawableSourcePath);
            console.log(' ----- ✅ --- Limpeza concluída.');

            deferral.resolve();
        })
        .on('error', function (err) {
            console.error(' ----- ❌ --- Erro durante a descompactação:', err);
            deferral.reject(err);
        });

    return deferral.promise;
};