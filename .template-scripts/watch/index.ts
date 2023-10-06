import { executeCommand, spawnCommand } from "../~shared/Command";
import { SelectProject } from "../~shared/SelectProject";
import { existsSync } from 'fs';

if (!existsSync(process.cwd() + '/node_modules')) {
	console.log('Node modules missing - installing');
	executeCommand('npm install')
}

SelectProject(paths => {

	paths.forEach(path => {
		console.log(`\nWatching Project '${path.projectName}'`);
	});

	paths.forEach(path => {
		console.log(`\nCleaning ${path.projectName}`);
		executeCommand(`dotnet clean ${path.csprojFilePath}`);
	});

	paths.forEach(path => {
		spawnCommand('dotnet', ['watch', `--non-interactive --project=${path.projectName}`]);
		spawnCommand('npx', ['webpack', '--watch', '--env', `project=${path.projectName}`]);
	});
	
});