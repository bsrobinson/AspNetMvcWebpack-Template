"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Web_1 = require("../~shared/Web");
const Command_1 = require("../~shared/Command");
const SelectProject_1 = require("../~shared/SelectProject");
const IDeployment_1 = require("./services/IDeployment");
const path_1 = require("path");
const fs_1 = require("fs");
const zip = require('bestzip');
(0, SelectProject_1.SelectProject)(paths => {
    paths.forEach(path => {
        let deployment = (0, IDeployment_1.getDeploymentService)(path);
        if (deployment.configValid) {
            dotnetPublish(path, deployment.config, () => {
                console.log(`\nPublishing to ${deployment.ContainerName()} on ${deployment.config.service}...`);
                deployment.Publish(url => {
                    console.log(`\nPublished to ${url}, opening...\n`);
                    (0, Web_1.openUrl)(url);
                });
            });
        }
    });
});
function dotnetPublish(paths, publishConfig, cb) {
    console.log(`\nCleaning ${paths.csprojFilePath}...`);
    (0, Command_1.executeCommand)(`dotnet clean ${paths.csprojFilePath}`);
    console.log(`Building ${paths.csprojFilePath}...`);
    (0, Command_1.executeCommand)(`dotnet publish ${paths.csprojFilePath} -c Release -o ${paths.publishFolder}`);
    console.log(`Packaging ${paths.csprojFilePath}...`);
    replaceInPublish(publishConfig, paths);
    copySecretsFile(paths);
    zip({
        source: './*',
        destination: `../${paths.publishZipFilePath.split('/').reverse()[0]}`,
        cwd: paths.publishFolder,
    }).then(() => cb());
}
function replaceInPublish(publishConfig, paths) {
    (publishConfig.replacements || []).forEach(replacement => {
        let filePath = `${paths.publishFolder}${replacement.file}`;
        if ((0, fs_1.existsSync)(filePath)) {
            let fileContents = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, filePath), { encoding: 'utf8' });
            fileContents = fileContents.replace(new RegExp(replacement.replace, 'g'), replacement.with);
            (0, fs_1.writeFileSync)(filePath, fileContents, { encoding: 'utf8' });
        }
    });
}
function copySecretsFile(paths) {
    (0, fs_1.copyFileSync)('secrets.json', `${paths.publishFolder}secrets.json`);
}
