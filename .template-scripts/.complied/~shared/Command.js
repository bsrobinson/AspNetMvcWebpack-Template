"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spawnCommand = exports.executeCommand = exports.git = exports.getJsonFromCommand = void 0;
const child_process_1 = require("child_process");
function getJsonFromCommand(command) {
    let response = executeCommand(command, false);
    try {
        return JSON.parse(response);
    }
    catch {
        return null;
    }
}
exports.getJsonFromCommand = getJsonFromCommand;
function git(command, throwError = false) {
    return executeCommand(`git ${command}`, throwError);
}
exports.git = git;
function executeCommand(command, throwError = true) {
    try {
        return (0, child_process_1.execSync)(command, { encoding: 'utf8' });
    }
    catch (e) {
        if (throwError) {
            throw e;
        }
        else {
            return '';
        }
    }
}
exports.executeCommand = executeCommand;
function spawnCommand(command, args) {
    (0, child_process_1.spawn)(command, args, {
        stdio: ['pipe', process.stdin, process.stdout, process.stderr]
    });
}
exports.spawnCommand = spawnCommand;
