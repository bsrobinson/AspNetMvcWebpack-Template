const fs = require('fs');
const path = require('path');
const glob = require('glob');
const sourceMap = require('source-map');
const { ModifySourcePlugin, ConcatOperation, ReplaceOperation } = require('modify-source-webpack-plugin');



var embededJsMapOffset = 16;


var project = process.argv.find(a => a.slice(0, 8) == 'project=')?.slice(8) || 'Template';
console.log(`Running Webpack for '${project}'`);

if (!fs.existsSync(`./${project}/`)) {

	console.log(`Project folder ./${project}/ does not exist`);
	process.exit(1);

} else {

	module.exports = [{
		mode: 'development',
		entry: () => {
			let obj = {
				scripts: { import: `./${project}/Scripts/Site.ts`, library: { name: 'Template', type: 'window' }, filename: 'Site.js' },
			};
			glob.sync(`./${project}/Views/**/*.ts`).forEach(path => {
				let file = path.slice(project.length + 7);
				let library = file.slice(0, file.length - 3).replace('/', '');
				let exportFile = file.replace('.ts', '.js');
				obj[library] = { import: `./${path}`, library: { name: library, type: 'window' }, filename: exportFile, dependOn: 'scripts' };
			});
			return obj;
		},
		output: {
			path: path.resolve(__dirname, `${project}/wwwroot/dist/js`),
			enabledLibraryTypes: [ 'window' ],
		},
		resolve: {
			extensions: [ '.ts', '.js' ],
		},
		devtool: process.argv[process.argv.indexOf('--mode') + 1] === 'production' ? undefined : 'source-map',
		module: {
			rules: [{
				test: /\.tsx?/,
				use: [ 'ts-loader' ],
				exclude: /node_modules/,
			}]
		},
		plugins: [{
			apply: (compiler) => {
				compiler.hooks.watchRun.tap('WatchRun', watchRunFeedback);
				compiler.hooks.afterEmit.tap("OffsetEmbedableMaps", offsetSourceMaps);
			},
		}],
	}, {
		mode: 'development',
		entry: () => {
			let obj = {
				styles: { import: `./${project}/Styles/Site.scss` },
			};
			glob.sync(`./${project}/Views/**/*.scss`).forEach(path => {
				let file = path.slice(project.length + 7);
				let library = file.slice(0, file.length - 5).replace('/', '');
				obj[library] = { import: `./${path}` };
			});
			return obj;
		},
		output: {
			path: path.resolve(__dirname, `${project}/wwwroot/dist/css/~js`),
		},
		module: {
			rules: [{
				test: /\.scss$/,
				type: 'asset/resource',
				generator: {
					filename: (module) => {
						let filename = module.filename;
						filename = filename.slice(Math.max(filename.indexOf('/Styles') + 7, filename.indexOf('/Views') + 6));
						filename = filename.replace('.scss', '.css');
						return `../${filename}`;
					},
				},
				use: [ 'sass-loader' ]
			}]
		},
		plugins: [{
			apply: (compiler) => {
				compiler.hooks.watchRun.tap('WatchRun', watchRunFeedback);
			}},		
			new ModifySourcePlugin({
				rules: [{
					test: () => true,
					operations: [
						new ReplaceOperation('all', '\'[./]*wwwroot\/', '\'/'),
					]
				}, {
					test: /Views\//,
					operations: [
						new ConcatOperation('start', '$FILE_PATH{'),
						new ReplaceOperation('all', '^/.*?/Views/(.*?)/(.*?)\.scss', '.$1$2'),
						new ConcatOperation('end', '}'),
					]
				}],
			})
		]
	}];
}



function watchRunFeedback(comp) {
	if (comp.modifiedFiles) {
		const changedFiles = Array.from(comp.modifiedFiles, (file) => `\n  ${file}`).join('');
		console.log('Webpack rebuilding for:', changedFiles);
	}
}

function offsetSourceMaps() {
	glob.sync(`./${project}/wwwroot/dist/js/*/*.js.map`).forEach(mapPath => {
		let rawSourceMap = fs.readFileSync(mapPath, 'utf-8');
		sourceMap.SourceMapConsumer.with(rawSourceMap, null, consumer => {
			var fileName = path.parse(mapPath).name;
			var generator = new sourceMap.SourceMapGenerator({
				file: fileName,
				sourceRoot: path.dirname(mapPath)
			});
			consumer.eachMapping(m => {
				if (m.source && !isNaN(m.originalLine) && !isNaN(m.originalColumn)) {
					generator.addMapping({
						source: m.source,
						name: m.name,
						original: { line: m.originalLine, column: m.originalColumn },
						generated: { line: m.generatedLine + embededJsMapOffset, column: m.generatedColumn }
					});
				}
			});
			var outgoingSourceMap = JSON.parse(generator.toString());
			outgoingSourceMap.sourcesContent = consumer.sourcesContent;
			fs.writeFileSync(`${path.dirname(mapPath)}/${fileName}.offset.map`, JSON.stringify(outgoingSourceMap));
		});
	});
}