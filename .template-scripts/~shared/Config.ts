import { readFileSync, existsSync } from 'fs';
import { Config } from './models/Config';

const configRoot = `${process.cwd()}/.template-scripts/`;
export const ConfigFilePath = `${configRoot}config.json`;
export const SecretsFilePath = `${configRoot}secrets.json`;

export function ReadConfig(): Config {

	if (!existsSync(ConfigFilePath)) {
		console.log('\nConfig file missing, cannot continue');
		console.log(`Expecting to find: ${ConfigFilePath}\n`);
		process.exit();
	}

	let config = parse(ConfigFilePath);
	
	if (existsSync(SecretsFilePath)) {
		config = { ...config, ...parse(SecretsFilePath) };
	}
	
	return config;

}

function parse(filePath: string): Config {

	try {
		let content = readFileSync(filePath, { encoding: 'utf8' });
		return JSON.parse(content.trim());
	}
	catch (e) {
		console.log(`\nFailed to parse config file (${filePath})`);
		console.log(e);
		console.log('Cannot continue\n');
		process.exit();
	}

}