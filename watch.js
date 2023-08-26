const fs = require('fs');
var spawn = require('child_process').spawn;

var project = process.argv[2] || 'Template';
console.log(`Watching Project '${project}'`);

if (!fs.existsSync(`./${project}/`)) {

	console.log(`Project folder ./${project}/ does not exist`);

}
else {

	spawn('dotnet', ['clean', `./${project}/${project}.csproj`], {
		stdio: ['pipe', process.stdout, process.stderr]
	}).on('exit', () => {

		spawn('dotnet', ['watch', `--project=${project}`], {
			stdio: ['pipe', process.stdin, process.stdout, process.stderr]
		});
		spawn('npx', ['webpack', '--watch', '--env', `project=${project}`], {
			stdio: ['pipe', process.stdin, process.stdout, process.stderr]
		});
	});

}