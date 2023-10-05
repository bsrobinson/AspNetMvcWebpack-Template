"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadConfig = exports.SecretsFilePath = exports.ConfigFilePath = void 0;
const fs_1 = require("fs");
const configRoot = `${process.cwd()}/.template-scripts/`;
exports.ConfigFilePath = `${configRoot}config.json`;
exports.SecretsFilePath = `${configRoot}secrets.json`;
function ReadConfig() {
    if (!(0, fs_1.existsSync)(exports.ConfigFilePath)) {
        console.log('\nConfig file missing, cannot continue');
        console.log(`Expecting to find: ${exports.ConfigFilePath}\n`);
        process.exit();
    }
    let config = parse(exports.ConfigFilePath);
    if ((0, fs_1.existsSync)(exports.SecretsFilePath)) {
        config = { ...config, ...parse(exports.SecretsFilePath) };
    }
    return config;
}
exports.ReadConfig = ReadConfig;
function parse(filePath) {
    try {
        let content = (0, fs_1.readFileSync)(filePath, { encoding: 'utf8' });
        return JSON.parse(content.trim());
    }
    catch (e) {
        console.log(`\nFailed to parse config file (${filePath})`);
        console.log(e);
        console.log('Cannot continue\n');
        process.exit();
    }
}
