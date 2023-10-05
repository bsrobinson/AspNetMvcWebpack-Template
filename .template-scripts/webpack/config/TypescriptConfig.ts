import { glob } from 'glob';
import { resolve } from 'path';
import { Configuration, EntryObject } from 'webpack';
import { WatchRunFeedbackPlugin } from '../plugins/WatchRunFeedback';
import { OffsetSourceMapsPlugin } from '../plugins/OffsetSourceMaps';
import { Paths } from '../../~shared/models/Paths';
import { ReadConfig } from '../../~shared/Config';

export function TypescriptConfig(paths: Paths): Configuration {

    let embededJsMapOffset = ReadConfig().embededJsMapOffset;

    return {

        mode: 'development',

        entry: () => {
            let obj: EntryObject = {
                scripts: { import: `${paths.projectRoot}/Scripts/Site.ts`, library: { name: paths.projectName.replace('.', ''), type: 'window' }, filename: 'Site.js' },
            };
            glob.sync(`${paths.projectRoot}/Views/**/*.ts`).forEach(path => {
                let file = path.slice(paths.projectName.length + 7);
                let library = file.slice(0, file.length - 3).replace('/', '');
                let exportFile = file.replace('.ts', '.js');
                obj[library] = { import: `./${path}`, library: { name: library, type: 'window' }, filename: exportFile, dependOn: 'scripts' };
            });
            return obj;
        },

        output: {
            path: resolve(process.cwd(), `${paths.projectRoot}/wwwroot/dist/js`),
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
            new WatchRunFeedbackPlugin(),
            new OffsetSourceMapsPlugin(paths, embededJsMapOffset),
        ],
    };
}