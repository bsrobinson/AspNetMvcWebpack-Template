import { get } from 'https';

export function openUrl(url: string): void {
	var start = process.platform == 'darwin' ? 'open' : (process.platform == 'win32' ? 'start' : 'xdg-open');
	require('child_process').execSync(start + ' ' + url);
}

export function getJson<T>(url: string, cb: (json: T) => void): void {
	let options = {
		headers: { 'User-Agent': 'bsrobinson-Update-Template-Script' }
	};	  
	get(url, options, (r: any) => {
		let data = '';
		r.on('data', (chunk: string) => {
			data += chunk;
		});
		r.on('end', () => {
			cb(JSON.parse(data));
		});
	}).on('error', (err: string) => {
		console.error(err);
		process.exit(-1);
	});
}
