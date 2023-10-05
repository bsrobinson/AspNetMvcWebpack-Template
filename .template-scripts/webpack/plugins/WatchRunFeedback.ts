import { Compiler } from 'webpack';

export class WatchRunFeedbackPlugin {

    apply(compiler: Compiler) {

        compiler.hooks.watchRun.tap('WatchRun', () => {

            if (compiler.modifiedFiles) {
                const changedFiles = Array.from(compiler.modifiedFiles, (file) => `\n  ${file}`).join('');
                console.log('Webpack rebuilding for:', changedFiles);
        
            }
            
        });       
    }
}