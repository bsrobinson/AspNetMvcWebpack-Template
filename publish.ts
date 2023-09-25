const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec;
const glob = require("glob")
const { Select } = require('enquirer');
const zip = require('bestzip');


new Select({
	message: 'Confirm project to publish',
	choices: getProjectOptions(),
	result(choice: string) { return this.map(choice)[choice] },
}).run().then(async (csprojPath: string) => {

	let paths = getProjectPaths(csprojPath);
	if (paths) {
		
		let publishConfig = readPublishConfig(paths.secrets)
		if (publishConfig) {

			dotnetPublish(paths, publishConfig, () => {

				publishToService(paths!.zip, publishConfig!, url => {
					console.log(`\nPublished to ${url}, opening...\n`);
					openUrl(url);
				});

			});
		}
	}
});



function getProjectOptions(): Record<string, string>[] {

	let projectOptions: Record<string, string>[] = [];

	glob.sync("**/*.csproj").forEach((path: string) => {
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
	
	projectOptions.push({ value: '-', name: 'Cancel' });

	return projectOptions;
}
function getProjectPaths(csprojPath: string): Paths | null {
	if (csprojPath && csprojPath != '-') {

		let pathElements = csprojPath.split('/');
		let root = pathElements.slice(0, pathElements.length - 1).join('/');
		
		return {
			csproj: csprojPath,
			root: root,
			publish: `${root}/bin/publish/`,
			zip: `${root}/bin/publish.zip`,
			secrets: `${root}/secrets.json`,
		}
	}
	return null;
}


function readPublishConfig(secretsPath: string): PublishConfig | null {
	if (!fs.existsSync(secretsPath)) {
		console.log('\nCannot find the secrets file.');
		console.log(`Add a file called '${secretsPath}' to the root of your project with a 'Publish' object at the root.\n`);
	} else {
		try {
			let secretsFile = JSON.parse(fs.readFileSync(secretsPath)) as SecretsFile;
			if (secretsFile.Publish && secretsFile.Publish.Service) {
			
				if (secretsFile.Publish.Service == Service.AzureWebApp) {
					if (secretsFile.Publish.ResourceGroup && secretsFile.Publish.AppName) {
						return secretsFile.Publish;
					} else {
						console.log(`${Service.AzureWebApp} publish requires ResourceGroup and AppName in the Publish config`);
					}
				}
				else {
					console.log(`Unsupported publish service (${secretsFile.Publish.Service}), please add to the publish script!`)
				}
			} else {
				console.log(`\n${secretsPath} requires a Publish object with a defined Service\n`);
			}
		}
		catch {
			console.log(`\nCannot parse ${secretsPath}\n`);
		}
	}
	return null;
}


function dotnetPublish(paths: Paths, publishConfig: PublishConfig, cb: () => void): void {
	console.log(`\nBuilding ${paths.csproj}`);
	executeCommand(`dotnet clean ${paths.csproj}`, () => {
		executeCommand(`dotnet publish ${paths.csproj} -c Release -o ${paths.publish}`, () => {
			replaceInPublish(publishConfig, paths);
			zip({
				source: './*',
				destination: `../${paths.zip.split('/').reverse()[0]}`,
				cwd: paths.publish,
			}).then(() => cb());
		});
	});
}

function replaceInPublish(publishConfig: PublishConfig, paths: Paths) {
	(publishConfig.Replacements || []).forEach(replacement => {
		let filePath = `${paths.publish}${replacement.File}`;
		if (fs.existsSync(filePath)) {
			let fileContents = fs.readFileSync(path.join(__dirname, filePath), { encoding: 'utf8' });
			fileContents = fileContents.replace(new RegExp(replacement.Replace, 'g'), replacement.With);
			fs.writeFileSync(filePath, fileContents, { encoding: 'utf8' });
		}
	});
}


function publishToService(zipFile: string, config: PublishConfig, cb: (url: string) => void): void {
	console.log(`\nPublishing to ${config.Service}...`);
	if (config.Service == Service.AzureWebApp) {
		azWebAppPublish(zipFile, config, (url: string) => cb(url));
	}
}

function azWebAppPublish(zipFile: string, config: PublishConfig, cb: (url: string) => void): void {
	azLogin(() => {
		getJsonFromCommand<AzureDeployment>(`az webapp deploy --type zip --resource-group ${config.ResourceGroup} --name ${config.AppName} --src-path ${zipFile}`, r => {
			if (r && r.site_name) {
				cb(`http://${r.site_name}.azurewebsites.net/`)
			} else {
				console.log('Publish failed with config', config, r);
				process.exit();
			}
		});
	});
}
function azLogin(cb: () => void): void {
	getJsonFromCommand<AzureAccount>('az account show', azAccount => {
		if (!azAccount) {
			console.log('Login to Azure in your browser');
			executeCommand('az login', () => {
				cb();
			})
		} else {
			cb();
		}
	}, false);
}


function openUrl(url: string): void {
	var start = process.platform == 'darwin' ? 'open' : (process.platform == 'win32' ? 'start' : 'xdg-open');
	require('child_process').execSync(start + ' ' + url);
}


function getJsonFromCommand<T>(command: string, cb: (json: T | null) => void, throwError = true): void {
	executeCommand(command, r => {
		try {
			cb(JSON.parse(r) as T)
		}
		catch {
			cb(null);
		}
	}, throwError);
}
function executeCommand(command: string, cb: (response: string) => void, throwError = true) {
	exec(command, (err: string, stdout: string, stderr: string) => {
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


interface Paths {
	csproj: string,
	root: string,
	publish: string,
	zip: string,
	secrets: string,
}
interface SecretsFile {
	Publish: PublishConfig;
}
interface PublishConfig {
	Service: Service,
	Replacements?: PublishConfigReplacement[],
	ResourceGroup?: string,
	AppName?: string,
}
interface PublishConfigReplacement {
	File: string,
	Replace: string,
	With: string,
}
enum Service {
	AzureWebApp = 'AzureWebApp',
}

interface AzureAccount {
	environmentName: string,
	homeTenantId: string,
	id: string,
	isDefault: boolean,
	name: string,
	state: string,
	tenantId: string,
	user: AzureUser,
}
interface AzureUser {
	name: string,
	type: string,
}
interface AzureDeployment {
	active: boolean,
	author: string,
	author_email: string,
	complete: boolean,
	deployer: string,
	end_time: string,
	id: string,
	is_readonly: boolean,
	is_temp: boolean,
	last_success_end_time: string,
	log_url: string,
	message: string,
	progress: string,
	provisioningState: string,
	received_time: string,
	site_name: string,
	start_time: string,
	status: number,
	status_text: string,
	url: string,
}