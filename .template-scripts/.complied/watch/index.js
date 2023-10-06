"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../~shared/Command");
const SelectProject_1 = require("../~shared/SelectProject");
const fs_1 = require("fs");
if (!(0, fs_1.existsSync)(process.cwd() + '/node_modules')) {
    console.log('Node modules missing - installing');
    (0, Command_1.executeCommand)('npm install');
}
(0, SelectProject_1.SelectProject)(paths => {
    paths.forEach(path => {
        console.log(`\nWatching Project '${path.projectName}'`);
    });
    paths.forEach(path => {
        console.log(`\nCleaning ${path.projectName}`);
        (0, Command_1.executeCommand)(`dotnet clean ${path.csprojFilePath}`);
    });
    paths.forEach(path => {
        (0, Command_1.spawnCommand)('dotnet', ['watch', `--non-interactive`, `--project=${path.projectName}`]);
        (0, Command_1.spawnCommand)('npx', ['webpack', '--watch', '--env', `project=${path.projectName}`]);
    });
});
