import { openUrl } from "../~shared/Web";
import { executeCommand } from "../~shared/Command";
import { SelectProject } from "../~shared/SelectProject";
import { Paths } from "../~shared/models/Paths";
import { PublishConfig } from "../~shared/models/Config";
import { getDeploymentService } from "./services/IDeployment";
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'fs';

const zip = require('bestzip');


SelectProject(paths => {
	paths.forEach(path => {
		let deployment = getDeploymentService(path);
		if (deployment.configValid) {

			dotnetPublish(path, deployment.config, () => {

				console.log(`\nPublishing to ${deployment.ContainerName()} on ${deployment.config.service}...`);

				deployment.Publish(url => {
					console.log(`\nPublished to ${url}, opening...\n`);
					openUrl(url);
				});

			});
		}
	});
});



function dotnetPublish(paths: Paths, publishConfig: PublishConfig, cb: () => void): void {
	
	console.log(`\nCleaning ${paths.csprojFilePath}...`);
	executeCommand(`dotnet clean ${paths.csprojFilePath}`);

	console.log(`Building ${paths.csprojFilePath}...`);
	executeCommand(`dotnet publish ${paths.csprojFilePath} -c Release -o ${paths.publishFolder}`);

	console.log(`Packaging ${paths.csprojFilePath}...`);
	replaceInPublish(publishConfig, paths);
	copySecretsFile(paths);
	zip({
		source: './*',
		destination: `../${paths.publishZipFilePath.split('/').reverse()[0]}`,
		cwd: paths.publishFolder,
	}).then(() => cb());
	
}

function replaceInPublish(publishConfig: PublishConfig, paths: Paths) {
	(publishConfig.replacements || []).forEach(replacement => {
		let filePath = `${paths.publishFolder}${replacement.file}`
		if (existsSync(filePath)) {
			let fileContents = readFileSync(join(__dirname, filePath), { encoding: 'utf8' });
			fileContents = fileContents.replace(new RegExp(replacement.replace, 'g'), replacement.with);
			writeFileSync(filePath, fileContents, { encoding: 'utf8' });
		}
	});
}

function copySecretsFile(paths: Paths) {
	copyFileSync('secrets.json', `${paths.publishFolder}secrets.json`);
}