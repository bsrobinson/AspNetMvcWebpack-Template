"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJson = exports.openUrl = void 0;
const https_1 = require("https");
function openUrl(url) {
    var start = process.platform == 'darwin' ? 'open' : (process.platform == 'win32' ? 'start' : 'xdg-open');
    require('child_process').execSync(start + ' ' + url);
}
exports.openUrl = openUrl;
function getJson(url, cb) {
    let options = {
        headers: { 'User-Agent': 'bsrobinson-Update-Template-Script' }
    };
    (0, https_1.get)(url, options, (r) => {
        let data = '';
        r.on('data', (chunk) => {
            data += chunk;
        });
        r.on('end', () => {
            cb(JSON.parse(data));
        });
    }).on('error', (err) => {
        console.error(err);
        process.exit(-1);
    });
}
exports.getJson = getJson;
