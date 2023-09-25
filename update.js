//
// Script to check for and apply changes from the orginal template
//

const fs = require('fs')
const path = require('path')
const https = require("https");
const exec = require('child_process').exec;
const parseGitDiff = require('parse-git-diff').default;
const { Input, Select, Confirm } = require('enquirer');

let utf8 = { encoding: 'utf8' };


git(`diff HEAD`, r => {

	if (r != '') {
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


	executeCommand(`ls *.sln | sed -e 's/\.sln$//'`, solutionName => {

		solutionName = solutionName.trim();
		
		getJson(`https://api.github.com/repos/bsrobinson/AspNetMvcWebpack-Template`, response => {

			let templateUpdated = new Date(response.pushed_at);
			console.log(`Template last updated ${templateUpdated}\n`);

			getStartDate(date => {
				if (date >= templateUpdated) {
					console.log(`\nThere have been no changes in the template the last update ${date}`);
					console.log(`Delete the ./updateTemplateDate file to force an alternative date\n`)
					updateSolutionUpdateDate(templateUpdated)
					process.exit(0);
				}

				cloneTemplate(folderName => {

					applyChanges(date, solutionName, folderName, _ => {

						deleteTempFolder(folderName)
						updateSolutionUpdateDate(templateUpdated);

						console.log(``);
						console.log(`------------------------------------------------------------`);
						console.log(`Done, carefully review changes in the current branch        `);
						console.log(`------------------------------------------------------------`);
						console.log(``);
					});
				});
			});
		});
	});
});


function getStartDate(cb) {

	let updateTemplateDateFile = path.join(__dirname, `./updateTemplateDate`);
	if (fs.existsSync(updateTemplateDateFile)) {
		
		let date = new Date(fs.readFileSync(updateTemplateDateFile, utf8))
		console.log(`Last updated from Template ${date}\n`);

		new Confirm({
			message: 'Continue updating?'
		}).run().then(answer => {
			if (answer) {
				cb(date);
			} else {
				process.exit();
			}
		});

	} else {

		git(` log --pretty=format:'%cd' --reverse | head -1`, intialCommitDateStr => {

			console.log(`Last update from Template unknown`);

			new Select({
				message: 'What would you like to do?',
				choices: [
					{ value: 0, name: `Get updates since inital commit (${new Date(intialCommitDateStr)})` },
					{ value: 1, name: `Get updates since specific commit...` },
					{ value: 2, name: `Get updates since specific date...` },
					{ value: 3, name: `Cancel` },
				],
				result(choice) { return this.map(choice)[choice] },
			}).run().then(async answer => {
				if (answer == 0) {
					cb(new Date(intialCommitDateStr))
				}
				if (answer == 1) {
					new Input({
						message: `Enter commit hash from this repo that marks the last Template update`,
					}).run().then(answer => {
						git(`show '${answer}' --no-patch --no-notes --pretty='%ad'`, response => {
							if (response) {
								cb(new Date(response));
							} else {
								console.log(`\nHash not found`);
								process.exit();
							}
						})
					});
				}
				if (answer == 2) {
					console.log('Coming soon...');
					process.exit();
					// new InputDate({
					// 	message: `Enter date after last commit that marks the last Template update`,
					// }).run().then(answer => {
					// 	cb(answer)
					// })
				}
				if (answer == 3) {
					process.exit(0);
				}
			});
		});
	}
}

function cloneTemplate(cb) {

	console.log('\nDownloading lastest template');

	let folderName = `tmp-template-update-${new Date().valueOf()}`;
	fs.mkdirSync(path.join(__dirname, `./${folderName}`), { recursive: true });
	
	git(`clone https://github.com/bsrobinson/AspNetMvcWebpack-Template ./${folderName}`, () => {
		
		cb(folderName);

	}, true);
	
}

function applyChanges(date, solutionName, folderName, cb) {

	console.log(`Applying changes in Template`);

	git(`-C ./${folderName} log --pretty='%H' --since='${date.toISOString()}' --reverse | head -1`, firstCommitAfterDate => {
		git(`-C ./${folderName} diff ${firstCommitAfterDate.trim()}^..`, response => {
			
			let diff = parseGitDiff(response);

			if (diff.files.find(f => f.path == 'update.js') != null) {
				
				let templateFileContents = fs.readFileSync(path.join(__dirname, `./${folderName}/update.js`), utf8);
				let solutionFileContents = fs.readFileSync(path.join(__dirname, `./update.js`), utf8);

				if (templateFileContents != solutionFileContents) {
					fs.writeFileSync('./update.js', templateFileContents, utf8);	
					console.log(`\nUpdate Template script has been updated.`);
					console.log(`Commit that change and run again.\n`);

					deleteTempFolder(folderName);
					process.exit();
				}

			}

			let filesToIgnore = [ 'update.js', 'README.md' ]
			diff.files.filter(f => !filesToIgnore.includes(f.path)).forEach(file => {

				let templatePath = file.path || file.pathAfter;
				let solutionPath = path.join(__dirname, (file.path || file.pathBefore).replace(/Template/g, `${solutionName}`));
				let extension = path.extname(templatePath);

				if (file.type == 'DeletedFile') {

					if (fs.existsSync(solutionPath)) {
						fs.unlinkSync(solutionPath);
					}

				} 
				else {

					let unchangedLinesRemainUnchanged = true;
					if (fs.existsSync(solutionPath)) {
						
						let solutionFileContents = fs.readFileSync(solutionPath, utf8);
						let solutionFileLines = solutionFileContents.split('\n');
		
						file.chunks.forEach(chunk => {
							chunk.changes.filter(c => c.type == 'UnchangedLine').forEach(change => {
								if (change.content != solutionFileLines[change.lineBefore -1]) {
									unchangedLinesRemainUnchanged = false;
								}
							});
						});
					}

					let shouldReplaceInFile = ['.cs', '.ts', '.cshtml', '.json', '.csproj', '.js', '.sln'].indexOf(extension) >= 0
					let templateFileContents = fs.readFileSync(path.join(__dirname, `./${folderName}/${templatePath}`), utf8);
					
					unchangedLinesRemainUnchanged = false; //delete this line when code written below
					if (unchangedLinesRemainUnchanged) {
						
						file.chunks.forEach(chunk => {
							chunk.changes.filter(c => c.type != 'UnchangedLine').forEach(change => {

								//TODO
								//apply line change to file in solution
									//!! rename Template refs

							});
						});
						
					} else {

						// copy whole contents of file (to allow for manual merge)
						if (shouldReplaceInFile){
							templateFileContents = templateFileContents.replace(/Template/g, solutionName);
						}

						fs.mkdirSync(path.dirname(solutionPath), { recursive: true });
						fs.writeFileSync(solutionPath, templateFileContents, utf8);

					}

					if (file.type == 'RenamedFile') {
						let oldPath = path.join(__dirname, file.pathBefore.replace(/Template/g, `${solutionName}`));
						let newPath = path.join(__dirname, file.pathAfter.replace(/Template/g, `${solutionName}`));
						fs.renameSync(oldPath, newPath);
					}

				}
			});
			cb();
		});
	});
}

function deleteTempFolder(folderName) {

	fs.rmSync(`./${folderName}`, { recursive: true, force: true });

}

function updateSolutionUpdateDate(date) {

	fs.writeFileSync(`./updateTemplateDate`, date.toISOString(), utf8);

}



function git(command, cb, throwError = false) {
	executeCommand(`git ${command}`, cb, throwError);
}
function executeCommand(command, cb, throwError = true) {
	exec(command, function(err, stdout, stderr) {
		if (err != null) {
			if (throwError) {
				console.error(err);
				process.exit(-1)
			}
			return cb('');
		} else if (typeof(stderr) != "string") {
			if (throwError) {
				console.error(err);
				process.exit(-1)
			}
			return cb('');
		} else {
			return cb(stdout);
		}
	});
}

function getJson(url, cb) {
	let options = {
		headers: { 'User-Agent': 'bsrobinson-Update-Template-Script' }
	};	  
	https.get(url, options, r => {
		let data = '';
		r.on('data', chunk => {
			data += chunk;
		});
		r.on('end', () => {
			cb(JSON.parse(data));
		});
	}).on('error', err => {
		console.error(err);
		process.exit(-1);
	});
}