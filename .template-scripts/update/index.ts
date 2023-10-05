//
// Script to check for and apply changes from the orginal template
//

import { AnyChunk, AnyFileChange, AnyLineChange, BinaryFilesChunk, GitDiff, RenamedFile, UnchangedLine } from 'parse-git-diff/build/cjs/types';
import { getJson } from '../~shared/Web';
import { GitHubRepo } from '../~shared/models/Github';
import { executeCommand, git } from '../~shared/Command';
import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync, rmSync, unlinkSync } from 'fs';
import { join, extname, dirname } from 'path';

const parseGitDiff = require('parse-git-diff').default;
const { Input, Select, Confirm } = require('enquirer');



if (git(`diff HEAD`) != '') {
	console.log(`\nPlease commit or stash all changes before running this script\n`);
	process.exit(0)
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


let solutionName = executeCommand(`ls *.sln | sed -e 's/\.sln$//'`).trim();

getJson<GitHubRepo>(`https://api.github.com/repos/bsrobinson/AspNetMvcWebpack-Template`, response => {

	let templateUpdated = new Date(response.pushed_at);
	console.log(`Template last updated ${templateUpdated}\n`);

	getStartDate(date => {
		if (date >= templateUpdated) {
			console.log(`\nThere have been no changes in the template the last update ${date}`);
			console.log(`Delete the ./.template-scripts/update/updateTemplateDate file to force an alternative date\n`)
			updateSolutionUpdateDate(templateUpdated)
			process.exit(0);
		}

		let folderPath = cloneTemplate();
		applyChanges(date, solutionName, folderPath);

		deleteTempFolder(folderPath)
		updateSolutionUpdateDate(templateUpdated);

		console.log(``);
		console.log(`------------------------------------------------------------`);
		console.log(`Done, carefully review changes in the current branch        `);
		console.log(`------------------------------------------------------------`);
		console.log(``);


	});
});


function getStartDate(cb: (startDate: Date) => void): void {

	let updateTemplateDateFile = join(process.cwd(), `./.template-scripts/update/updateTemplateDate`);
	if (existsSync(updateTemplateDateFile)) {
		
		let date = new Date(readFileSync(updateTemplateDateFile, { encoding: 'utf8' }))
		console.log(`Last updated from Template ${date}\n`);

		new Confirm({
			message: 'Continue updating?'
		}).run().then((answer: boolean) => {
			if (answer) {
				cb(date);
			} else {
				process.exit();
			}
		}).catch(() => {});

	} else {

		let intialCommitDateStr = git(`log --pretty=format:'%cd' --reverse | head -1`);

		console.log(`Last update from Template unknown`);

		new Select({
			message: 'What would you like to do?',
			choices: [
				{ value: 0, name: `Get updates since inital commit (${new Date(intialCommitDateStr)})` },
				{ value: 1, name: `Get updates since specific commit...` },
				{ value: 2, name: `Get updates since specific date...` },
				{ value: 3, name: `Cancel` },
			],
			result(choice: number) { return this.map(choice)[choice] },
		}).run().then(async (answer: number) => {
			if (answer == 0) {
				cb(new Date(intialCommitDateStr))
			}
			if (answer == 1) {
				new Input({
					message: `Enter commit hash from this repo that marks the last Template update`,
				}).run().then((answer: string) => {
					let response = git(`show '${answer}' --no-patch --no-notes --pretty='%ad'`)
					if (response) {
						cb(new Date(response));
					} else {
						console.log(`\nHash not found`);
						process.exit();
					}
				}).catch(() => {});
			}
			if (answer == 2) {
				console.log('Coming soon...');
				process.exit();
				// new InputDate({
				// 	message: `Enter date after last commit that marks the last Template update`,
				// }).run().then(answer => {
				// 	cb(answer)
				// }).catch(() => {})
			}
			if (answer == 3) {
				process.exit(0);
			}
		}).catch(() => {});
	}
}

function cloneTemplate(): string {

	console.log('\nDownloading lastest template');

	let folderPath = join(process.cwd(), `./${`tmp-template-update-${new Date().valueOf()}`}`)
	mkdirSync(folderPath, { recursive: true });
	
	git(`clone https://github.com/bsrobinson/AspNetMvcWebpack-Template ${folderPath}`, true);

	return folderPath;

}

function applyChanges(date: Date, solutionName: string, folderPath: string): void {

	console.log(`Applying changes in Template`);

	let firstCommitAfterDate = git(`-C ${folderPath} log --pretty='%H' --since='${date.toISOString()}' --reverse | head -1`, true);
	
	let diff: GitDiff = parseGitDiff(git(`-C ${folderPath} diff ${firstCommitAfterDate.trim()}^..`));
	
	if (diff.files.find(f => !isRenamedFile(f) && (f.path == '.template-scripts/update/index.ts' || f.path == '.template-scripts/.complied/update/index.js')) != null) {
		
		let templateFileContents = readFileSync(`${folderPath}/.template-scripts/update/index.ts`, { encoding: 'utf8' });
		let compliedTemplateFileContents = readFileSync(`${folderPath}/.template-scripts/.complied/update/index.js`, { encoding: 'utf8' });

		let solutionFileContents = readFileSync(join(process.cwd(), `./.template-scripts/update/index.ts`), { encoding: 'utf8' });
		let compliedSolutionFileContents = readFileSync(join(process.cwd(), `./.template-scripts/.complied/update/index.js`), { encoding: 'utf8' });

		if (templateFileContents != solutionFileContents || compliedTemplateFileContents != compliedSolutionFileContents) {
			writeFileSync('./.template-scripts/update/index.ts', templateFileContents, { encoding: 'utf8' });
			writeFileSync('./.template-scripts/.complied/update/index.js', compliedTemplateFileContents, { encoding: 'utf8' });
			console.log(`\nUpdate Template script has been updated.`);
			console.log(`Commit that change and run again.\n`);

			deleteTempFolder(folderPath);
			process.exit();
		}

	}

	let filesToIgnore = [ '.template-scripts/update/index.ts', '.template-scripts/.complied/update/index.js', 'README.md' ]
	diff.files.filter(f => !isRenamedFile(f) && !filesToIgnore.includes(f.path)).forEach(file => {

		let templatePath = isRenamedFile(file) ? file.pathAfter : file.path;
		let solutionPath = join(process.cwd(), (isRenamedFile(file) ? file.pathBefore : file.path).replace(/Template/g, `${solutionName}`));
		let extension = extname(templatePath);

		if (file.type == 'DeletedFile') {

			if (existsSync(solutionPath)) {
				unlinkSync(solutionPath);
			}

		} 
		else {

			let unchangedLinesRemainUnchanged = true;
			if (existsSync(solutionPath)) {
				
				let solutionFileContents = readFileSync(solutionPath, { encoding: 'utf8' });
				let solutionFileLines = solutionFileContents.split('\n');

				file.chunks.forEach(chunk => {
					if (!isBinaryFilesChunk(chunk)) {
						chunk.changes.forEach(change => {
							if (isUnchangedLine(change) && change.content != solutionFileLines[change.lineBefore -1]) {
								unchangedLinesRemainUnchanged = false;
							}
						});
					}
				});
			}

			let shouldReplaceInFile = ['.cs', '.cshtml', '.json', '.csproj', '.js', '.sln'].indexOf(extension) >= 0
			if (templatePath.includes('.template-scripts/')) {
				shouldReplaceInFile = false;
			}
			let templateFileContents = readFileSync(`${folderPath}/${templatePath}`, { encoding: 'utf8' });
			
			unchangedLinesRemainUnchanged = false; //delete this line when code written below
			if (unchangedLinesRemainUnchanged) {
				
				file.chunks.forEach(chunk => {
					if (!isBinaryFilesChunk(chunk)) {
						chunk.changes.filter(c => c.type != 'UnchangedLine').forEach(change => {

							//TODO
							//apply line change to file in solution
								//!! rename Template refs

						});
					}
				});
				
			} else {

				// copy whole contents of file (to allow for manual merge)
				if (shouldReplaceInFile) {
					templateFileContents = templateFileContents.replace(/Template/g, solutionName);
				}

				mkdirSync(dirname(solutionPath), { recursive: true });
				writeFileSync(solutionPath, templateFileContents, { encoding: 'utf8' });

			}

			if (file.type == 'RenamedFile') {
				let oldPath = join(__dirname, file.pathBefore.replace(/Template/g, `${solutionName}`));
				let newPath = join(__dirname, file.pathAfter.replace(/Template/g, `${solutionName}`));
				renameSync(oldPath, newPath);
			}

		}
	});
}

function deleteTempFolder(folderPath: string): void {

	rmSync(folderPath, { recursive: true, force: true });

}

function updateSolutionUpdateDate(date: Date): void {

	writeFileSync(join(process.cwd(), `./.template-scripts/update/updateTemplateDate`), date.toISOString(), { encoding: 'utf8' });

}


function isRenamedFile(file: AnyFileChange): file is RenamedFile {
    return (<RenamedFile>file).pathAfter !== undefined;
}
function isBinaryFilesChunk(chunk: AnyChunk): chunk is BinaryFilesChunk {
    return (<BinaryFilesChunk>chunk).pathAfter !== undefined;
}
function isUnchangedLine(line: AnyLineChange): line is UnchangedLine {
    return (<UnchangedLine>line).lineBefore !== undefined && (<UnchangedLine>line).lineAfter !== undefined;
}