"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const fs_1 = require("fs");
const TypescriptConfig_1 = require("./config/TypescriptConfig");
const SassConfig_1 = require("./config/SassConfig");
const SelectProject_1 = require("../~shared/SelectProject");
function config() {
    let argProject = process.argv.find(a => a.slice(0, 8) == 'project=')?.slice(8);
    let allProjects = (0, SelectProject_1.GetProjectOptions)();
    let projectPaths = (0, SelectProject_1.GetProjectPaths)(allProjects.find(p => p.name == argProject) ?? allProjects[0])[0];
    if (!(0, fs_1.existsSync)(`./${projectPaths.projectName}/`)) {
        console.log(`Project folder ./${projectPaths.projectName}/ does not exist`);
        process.exit(1);
    }
    else {
        return [
            (0, TypescriptConfig_1.TypescriptConfig)(projectPaths),
            (0, SassConfig_1.SassConfig)(projectPaths)
        ];
    }
}
exports.config = config;
