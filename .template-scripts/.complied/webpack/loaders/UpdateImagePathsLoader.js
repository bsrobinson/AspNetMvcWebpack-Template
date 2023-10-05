"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function UpdateImagePaths(source) {
    return source.replace(/"[./]*wwwroot\//g, '"/');
}
exports.default = UpdateImagePaths;
