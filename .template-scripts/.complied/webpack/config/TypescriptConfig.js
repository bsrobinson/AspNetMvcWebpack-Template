"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypescriptConfig = void 0;
const glob_1 = require("glob");
const path_1 = require("path");
const WatchRunFeedback_1 = require("../plugins/WatchRunFeedback");
const OffsetSourceMaps_1 = require("../plugins/OffsetSourceMaps");
const Config_1 = require("../../~shared/Config");
function TypescriptConfig(paths) {
    let embededJsMapOffset = (0, Config_1.ReadConfig)().embededJsMapOffset;
    return {
        mode: 'development',
        entry: () => {
            let obj = {
                scripts: { import: `${paths.projectRoot}/Scripts/Site.ts`, library: { name: paths.projectName.replace('.', ''), type: 'window' }, filename: 'Site.js' },
            };
            glob_1.glob.sync(`${paths.projectRoot}/Views/**/*.ts`).forEach(path => {
                let file = path.slice(paths.projectName.length + 7);
                let library = file.slice(0, file.length - 3).replace('/', '');
                let exportFile = file.replace('.ts', '.js');
                obj[library] = { import: `./${path}`, library: { name: library, type: 'window' }, filename: exportFile, dependOn: 'scripts' };
            });
            return obj;
        },
        output: {
            path: (0, path_1.resolve)(process.cwd(), `${paths.projectRoot}/wwwroot/dist/js`),
            enabledLibraryTypes: ['window'],
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        devtool: process.argv[process.argv.indexOf('--mode') + 1] === 'production' ? undefined : 'source-map',
        module: {
            rules: [{
                    test: /\.tsx?/,
                    use: ['ts-loader'],
                    exclude: /node_modules/,
                }]
        },
        plugins: [
            new WatchRunFeedback_1.WatchRunFeedbackPlugin(),
            new OffsetSourceMaps_1.OffsetSourceMapsPlugin(paths, embededJsMapOffset),
        ],
    };
}
exports.TypescriptConfig = TypescriptConfig;
