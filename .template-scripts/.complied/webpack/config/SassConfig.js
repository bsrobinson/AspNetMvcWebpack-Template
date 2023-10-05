"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SassConfig = void 0;
const glob_1 = require("glob");
const path_1 = require("path");
const WatchRunFeedback_1 = require("../plugins/WatchRunFeedback");
function SassConfig(paths) {
    return {
        mode: 'development',
        entry: () => {
            let obj = {
                styles: { import: `${paths.projectRoot}/Styles/Site.scss` },
            };
            glob_1.glob.sync(`${paths.projectRoot}/Views/**/*.scss`).forEach(path => {
                let file = path.slice(paths.projectName.length + 7);
                let library = file.slice(0, file.length - 5).replace('/', '');
                obj[library] = { import: `./${path}` };
            });
            return obj;
        },
        output: {
            path: (0, path_1.resolve)(process.cwd(), `${paths.projectRoot}/wwwroot/dist/css/~js`),
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
                    use: [
                        (0, path_1.resolve)(__dirname, "../loaders/UpdateImagePathsLoader.js"),
                        'sass-loader',
                        (0, path_1.resolve)(__dirname, "../loaders/WrapViewCssLoader.js"),
                    ]
                }]
        },
        plugins: [
            new WatchRunFeedback_1.WatchRunFeedbackPlugin(),
        ],
    };
}
exports.SassConfig = SassConfig;
