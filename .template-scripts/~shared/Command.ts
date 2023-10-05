import { execSync, spawn } from 'child_process';

export function getJsonFromCommand<T>(command: string, throwError = true): T | null {
	let response = executeCommand(command, throwError);
	try {
		return JSON.parse(response) as T;
	}
	catch {
		return null;
	}
}

export function git(command: string, throwError = false): string {
	return executeCommand(`git ${command}`, throwError);
}

export function executeCommand(command: string, throwError = true): string {
	try {
		return execSync(command, { encoding: 'utf8' });
	}
	catch (e) {
		if (throwError) {
			throw e;
		} else {
			return '';
		}
	}
 }

export function spawnCommand(command: string, args: string[]) {
	spawn(command, args, {
		stdio: ['pipe', process.stdin, process.stdout, process.stderr]
	});	
}