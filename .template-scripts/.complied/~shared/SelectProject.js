"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProjectPaths = exports.GetProjectOptions = exports.SelectProject = void 0;
const Config_1 = require("./Config");
function SelectProject(cb) {
    let projectOptions = GetProjectOptions();
    if (projectOptions.length == 0) {
        console.log('No project found!');
        process.exit();
    }
    else if (projectOptions.length == 1) {
        cb(GetProjectPaths(projectOptions[0]));
    }
    else {
        let config = (0, Config_1.ReadConfig)();
        if (config.defaultProject) {
            let defaultProject = projectOptions.find(p => p.name == config.defaultProject);
            if (defaultProject) {
                return cb(GetProjectPaths(defaultProject));
            }
            else {
                console.log(`Cannot find your default project (${config.defaultProject})\n`);
            }
        }
        new (require('enquirer').Select)({
            message: 'Which project?',
            choices: projectOptions.concat({ value: '*', name: (projectOptions.length > 2 ? 'All' : 'Both') + ' Projects' }),
            result(choice) { return { name: choice, value: this.map(choice)[choice] }; },
        }).run().then(async (choice) => {
            cb(GetProjectPaths(choice, projectOptions));
        }).catch(() => {
            console.log('');
        });
    }
}
exports.SelectProject = SelectProject;
function GetProjectOptions() {
    let projectOptions = [];
    require('glob').sync("**/*.csproj").forEach((path) => {
        let nameStart = path.lastIndexOf('/') + 1;
        let nameEnd = path.length - 7;
        let projName = path.slice(nameStart, nameEnd);
        if (projName.indexOf('.Library') != projName.length - 8) {
            projectOptions.push({ value: `./${path}`, name: projName });
        }
    });
    projectOptions.sort((a, b) => {
        return a.value.length - b.value.length;
    });
    return projectOptions;
}
exports.GetProjectOptions = GetProjectOptions;
function GetProjectPaths(selectedProjects, allProjects = null) {
    let paths = [];
    let projects = allProjects && selectedProjects.value == '*' ? allProjects : [selectedProjects];
    projects.forEach(project => {
        let pathElements = project.value.split('/');
        let projectRoot = pathElements.slice(0, pathElements.length - 1).join('/');
        let solutionRoot = pathElements.slice(0, pathElements.length - 2).join('/');
        paths.push({
            projectName: project.name,
            projectRoot: projectRoot,
            csprojFilePath: project.value,
            publishFolder: `${projectRoot}/bin/publish/`,
            publishZipFilePath: `${projectRoot}/bin/publish.zip`,
            solutionRoot: solutionRoot,
        });
    });
    return paths;
}
exports.GetProjectPaths = GetProjectPaths;
