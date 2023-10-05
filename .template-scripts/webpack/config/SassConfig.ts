import { glob } from 'glob';
import { resolve } from 'path';
import { Configuration, EntryObject } from 'webpack';
import { WatchRunFeedbackPlugin } from '../plugins/WatchRunFeedback';
import { Paths } from '../../~shared/models/Paths';

export function SassConfig(paths: Paths): Configuration {

    return {

        mode: 'development',

        entry: () => {
            let obj: EntryObject = {
                styles: { import: `${paths.projectRoot}/Styles/Site.scss` },
            };
            glob.sync(`${paths.projectRoot}/Views/**/*.scss`).forEach(path => {
                let file = path.slice(paths.projectName.length + 7);
                let library = file.slice(0, file.length - 5).replace('/', '');
                obj[library] = { import: `./${path}` };
            });
            return obj;
        },
    
        output: {
            path: resolve(process.cwd(), `${paths.projectRoot}/wwwroot/dist/css/~js`),
        },
        
        module: {
            rules: [{
                test: /\.scss$/,
                type: 'asset/resource',
                generator: {
                    filename: (module: any) => {
                        let filename = module.filename;
                        filename = filename.slice(Math.max(filename.indexOf('/Styles') + 7, filename.indexOf('/Views') + 6));
                        filename = filename.replace('.scss', '.css');
                        return `../${filename}`;
                    },
                },
                use: [
                    resolve(__dirname, "../loaders/UpdateImagePathsLoader.js"),
                    'sass-loader',
                    resolve(__dirname, "../loaders/WrapViewCssLoader.js"),
                ]
            }]
        },

        plugins: [
            new WatchRunFeedbackPlugin(),
        ],
    };
}