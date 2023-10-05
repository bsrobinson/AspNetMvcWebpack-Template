"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Web_1 = require("../~shared/Web");
const Command_1 = require("../~shared/Command");
const fs_1 = require("fs");
const path_1 = require("path");
const parseGitDiff = require('parse-git-diff').default;
const { Input, Select, Confirm } = require('enquirer');
if ((0, Command_1.git)(`diff HEAD`) != '') {
    console.log(`\nPlease commit or stash all changes before running this script\n`);
    process.exit(0);
}
console.log(``);
console.log(`    ***************************************************************`);
console.log(`    *                                                             *`);
console.log(`    *           Updating from AspNetMvcWebpack-Template           *`);
console.log(`    *                                                             *`);
console.log(`    ***************************************************************`);
console.log(`    |                                                             |`);
console.log(`    | Please ensure you have pulled latest and commited or        |`);
console.log(`    | stashed any pending chnages before continuing               |`);
console.log(`    |                                                             |`);
console.log(`    |-------------------------------------------------------------|`);
console.log(`    |                                                             |`);
console.log(`    | Changes will be made to the active branch for you to review |`);
console.log(`    |                                                             |`);
console.log(`    ***************************************************************`);
console.log(``);
let solutionName = (0, Command_1.executeCommand)(`ls *.sln | sed -e 's/\.sln$//'`).trim();
(0, Web_1.getJson)(`https://api.github.com/repos/bsrobinson/AspNetMvcWebpack-Template`, response => {
    let templateUpdated = new Date(response.pushed_at);
    console.log(`Template last updated ${templateUpdated}\n`);
    getStartDate(date => {
        if (date >= templateUpdated) {
            console.log(`\nThere have been no changes in the template the last update ${date}`);
            console.log(`Delete the ./.template-scripts/update/updateTemplateDate file to force an alternative date\n`);
            updateSolutionUpdateDate(templateUpdated);
            process.exit(0);
        }
        let folderPath = cloneTemplate();
        applyChanges(date, solutionName, folderPath);
        deleteTempFolder(folderPath);
        updateSolutionUpdateDate(templateUpdated);
        console.log(``);
        console.log(`------------------------------------------------------------`);
        console.log(`Done, carefully review changes in the current branch        `);
        console.log(`------------------------------------------------------------`);
        console.log(``);
    });
});
function getStartDate(cb) {
    let updateTemplateDateFile = (0, path_1.join)(process.cwd(), `./.template-scripts/update/updateTemplateDate`);
    if ((0, fs_1.existsSync)(updateTemplateDateFile)) {
        let date = new Date((0, fs_1.readFileSync)(updateTemplateDateFile, { encoding: 'utf8' }));
        console.log(`Last updated from Template ${date}\n`);
        new Confirm({
            message: 'Continue updating?'
        }).run().then((answer) => {
            if (answer) {
                cb(date);
            }
            else {
                process.exit();
            }
        }).catch(() => { });
    }
    else {
        let intialCommitDateStr = (0, Command_1.git)(`log --pretty=format:'%cd' --reverse | head -1`);
        console.log(`Last update from Template unknown`);
        new Select({
            message: 'What would you like to do?',
            choices: [
                { value: 0, name: `Get updates since inital commit (${new Date(intialCommitDateStr)})` },
                { value: 1, name: `Get updates since specific commit...` },
                { value: 2, name: `Get updates since specific date...` },
                { value: 3, name: `Cancel` },
            ],
            result(choice) { return this.map(choice)[choice]; },
        }).run().then(async (answer) => {
            if (answer == 0) {
                cb(new Date(intialCommitDateStr));
            }
            if (answer == 1) {
                new Input({
                    message: `Enter commit hash from this repo that marks the last Template update`,
                }).run().then((answer) => {
                    let response = (0, Command_1.git)(`show '${answer}' --no-patch --no-notes --pretty='%ad'`);
                    if (response) {
                        cb(new Date(response));
                    }
                    else {
                        console.log(`\nHash not found`);
                        process.exit();
                    }
                }).catch(() => { });
            }
            if (answer == 2) {
                console.log('Coming soon...');
                process.exit();
            }
            if (answer == 3) {
                process.exit(0);
            }
        }).catch(() => { });
    }
}
function cloneTemplate() {
    console.log('\nDownloading lastest template');
    let folderPath = (0, path_1.join)(process.cwd(), `./${`tmp-template-update-${new Date().valueOf()}`}`);
    (0, fs_1.mkdirSync)(folderPath, { recursive: true });
    (0, Command_1.git)(`clone https://github.com/bsrobinson/AspNetMvcWebpack-Template ${folderPath}`, true);
    return folderPath;
}
function applyChanges(date, solutionName, folderPath) {
    console.log(`Applying changes in Template`);
    let firstCommitAfterDate = (0, Command_1.git)(`-C ${folderPath} log --pretty='%H' --since='${date.toISOString()}' --reverse | head -1`, true);
    let diff = parseGitDiff((0, Command_1.git)(`-C ${folderPath} diff ${firstCommitAfterDate.trim()}^..`));
    if (diff.files.find(f => !isRenamedFile(f) && (f.path == '.template-scripts/update/index.ts' || f.path == '.template-scripts/.complied/update/index.js')) != null) {
        let templateFileContents = (0, fs_1.readFileSync)(`${folderPath}/.template-scripts/update/index.ts`, { encoding: 'utf8' });
        let compliedTemplateFileContents = (0, fs_1.readFileSync)(`${folderPath}/.template-scripts/.complied/update/index.js`, { encoding: 'utf8' });
        let solutionFileContents = (0, fs_1.readFileSync)((0, path_1.join)(process.cwd(), `./.template-scripts/update/index.ts`), { encoding: 'utf8' });
        let compliedSolutionFileContents = (0, fs_1.readFileSync)((0, path_1.join)(process.cwd(), `./.template-scripts/.complied/update/index.js`), { encoding: 'utf8' });
        if (templateFileContents != solutionFileContents || compliedTemplateFileContents != compliedSolutionFileContents) {
            (0, fs_1.writeFileSync)('./.template-scripts/update/index.ts', templateFileContents, { encoding: 'utf8' });
            (0, fs_1.writeFileSync)('./.template-scripts/.complied/update/index.js', compliedTemplateFileContents, { encoding: 'utf8' });
            console.log(`\nUpdate Template script has been updated.`);
            console.log(`Commit that change and run again.\n`);
            deleteTempFolder(folderPath);
            process.exit();
        }
    }
    let filesToIgnore = ['.template-scripts/update/index.ts', '.template-scripts/.complied/update/index.js', 'README.md'];
    diff.files.filter(f => !isRenamedFile(f) && !filesToIgnore.includes(f.path)).forEach(file => {
        let templatePath = isRenamedFile(file) ? file.pathAfter : file.path;
        let solutionPath = (0, path_1.join)(process.cwd(), (isRenamedFile(file) ? file.pathBefore : file.path).replace(/Template/g, `${solutionName}`));
        let extension = (0, path_1.extname)(templatePath);
        if (file.type == 'DeletedFile') {
            if ((0, fs_1.existsSync)(solutionPath)) {
                (0, fs_1.unlinkSync)(solutionPath);
            }
        }
        else {
            let unchangedLinesRemainUnchanged = true;
            if ((0, fs_1.existsSync)(solutionPath)) {
                let solutionFileContents = (0, fs_1.readFileSync)(solutionPath, { encoding: 'utf8' });
                let solutionFileLines = solutionFileContents.split('\n');
                file.chunks.forEach(chunk => {
                    if (!isBinaryFilesChunk(chunk)) {
                        chunk.changes.forEach(change => {
                            if (isUnchangedLine(change) && change.content != solutionFileLines[change.lineBefore - 1]) {
                                unchangedLinesRemainUnchanged = false;
                            }
                        });
                    }
                });
            }
            let shouldReplaceInFile = ['.cs', '.cshtml', '.json', '.csproj', '.js', '.sln'].indexOf(extension) >= 0;
            if (templatePath.includes('.template-scripts/')) {
                shouldReplaceInFile = false;
            }
            let templateFileContents = (0, fs_1.readFileSync)(`${folderPath}/${templatePath}`, { encoding: 'utf8' });
            unchangedLinesRemainUnchanged = false;
            if (unchangedLinesRemainUnchanged) {
                file.chunks.forEach(chunk => {
                    if (!isBinaryFilesChunk(chunk)) {
                        chunk.changes.filter(c => c.type != 'UnchangedLine').forEach(change => {
                        });
                    }
                });
            }
            else {
                if (shouldReplaceInFile) {
                    templateFileContents = templateFileContents.replace(/Template/g, solutionName);
                }
                (0, fs_1.mkdirSync)((0, path_1.dirname)(solutionPath), { recursive: true });
                (0, fs_1.writeFileSync)(solutionPath, templateFileContents, { encoding: 'utf8' });
            }
            if (file.type == 'RenamedFile') {
                let oldPath = (0, path_1.join)(__dirname, file.pathBefore.replace(/Template/g, `${solutionName}`));
                let newPath = (0, path_1.join)(__dirname, file.pathAfter.replace(/Template/g, `${solutionName}`));
                (0, fs_1.renameSync)(oldPath, newPath);
            }
        }
    });
}
function deleteTempFolder(folderPath) {
    (0, fs_1.rmSync)(folderPath, { recursive: true, force: true });
}
function updateSolutionUpdateDate(date) {
    (0, fs_1.writeFileSync)((0, path_1.join)(process.cwd(), `./.template-scripts/update/updateTemplateDate`), date.toISOString(), { encoding: 'utf8' });
}
function isRenamedFile(file) {
    return file.pathAfter !== undefined;
}
function isBinaryFilesChunk(chunk) {
    return chunk.pathAfter !== undefined;
}
function isUnchangedLine(line) {
    return line.lineBefore !== undefined && line.lineAfter !== undefined;
}
