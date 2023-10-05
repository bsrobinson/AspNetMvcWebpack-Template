"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchRunFeedbackPlugin = void 0;
class WatchRunFeedbackPlugin {
    apply(compiler) {
        compiler.hooks.watchRun.tap('WatchRun', () => {
            if (compiler.modifiedFiles) {
                const changedFiles = Array.from(compiler.modifiedFiles, (file) => `\n  ${file}`).join('');
                console.log('Webpack rebuilding for:', changedFiles);
            }
        });
    }
}
exports.WatchRunFeedbackPlugin = WatchRunFeedbackPlugin;
