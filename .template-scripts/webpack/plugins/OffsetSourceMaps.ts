import { glob } from 'glob';
import { readFileSync, writeFileSync } from 'fs';
import { parse, dirname } from 'path';
import { BasicSourceMapConsumer, SourceMapConsumer, SourceMapGenerator } from 'source-map';
import { Compiler } from 'webpack';
import { Paths } from '../../~shared/models/Paths';

export class OffsetSourceMapsPlugin {

    constructor(private paths: Paths, private embededJsMapOffset: number) {
    }

    apply(compiler: Compiler) {

        compiler.hooks.afterEmit.tap("OffsetEmbedableMaps", () => { 
        
            glob.sync(`./${this.paths.projectRoot}/wwwroot/dist/js/*/*.js.map`).forEach(mapPath => {

                let rawSourceMap = readFileSync(mapPath, 'utf-8');
                SourceMapConsumer.with(rawSourceMap, null, consumer => {
                            
                    let fileName = parse(mapPath).name;
                    let generator = new SourceMapGenerator({
                        file: fileName,
                        sourceRoot: dirname(mapPath)
                    });
        
                    consumer.eachMapping(m => {
                        if (m.source && !isNaN(m.originalLine) && !isNaN(m.originalColumn)) {
                            generator.addMapping({
                                source: m.source,
                                name: m.name,
                                original: { line: m.originalLine, column: m.originalColumn },
                                generated: { line: m.generatedLine + this.embededJsMapOffset, column: m.generatedColumn }
                            });
                        }
                    });
        
                    let outgoingSourceMap = generator.toJSON();
                    outgoingSourceMap.sourcesContent = (consumer as BasicSourceMapConsumer).sourcesContent;
                    writeFileSync(`${dirname(mapPath)}/${fileName}.offset.map`, JSON.stringify(outgoingSourceMap));
        
                });
            });        
        });
    }
}