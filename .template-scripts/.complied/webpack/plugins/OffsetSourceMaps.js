"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffsetSourceMapsPlugin = void 0;
const glob_1 = require("glob");
const fs_1 = require("fs");
const path_1 = require("path");
const source_map_1 = require("source-map");
class OffsetSourceMapsPlugin {
    paths;
    embededJsMapOffset;
    constructor(paths, embededJsMapOffset) {
        this.paths = paths;
        this.embededJsMapOffset = embededJsMapOffset;
    }
    apply(compiler) {
        compiler.hooks.afterEmit.tap("OffsetEmbedableMaps", () => {
            glob_1.glob.sync(`./${this.paths.projectRoot}/wwwroot/dist/js/*/*.js.map`).forEach(mapPath => {
                let rawSourceMap = (0, fs_1.readFileSync)(mapPath, 'utf-8');
                source_map_1.SourceMapConsumer.with(rawSourceMap, null, consumer => {
                    let fileName = (0, path_1.parse)(mapPath).name;
                    let generator = new source_map_1.SourceMapGenerator({
                        file: fileName,
                        sourceRoot: (0, path_1.dirname)(mapPath)
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
                    outgoingSourceMap.sourcesContent = consumer.sourcesContent;
                    (0, fs_1.writeFileSync)(`${(0, path_1.dirname)(mapPath)}/${fileName}.offset.map`, JSON.stringify(outgoingSourceMap));
                });
            });
        });
    }
}
exports.OffsetSourceMapsPlugin = OffsetSourceMapsPlugin;
