"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeploymentService = void 0;
const PublishService_1 = require("../../~shared/enums/PublishService");
const AzureWebApp_1 = require("./AzureWebApp/AzureWebApp");
const Config_1 = require("../../~shared/Config");
function getDeploymentService(paths) {
    let config = (0, Config_1.ReadConfig)();
    if (config.publish && config.publish.service) {
        if (config.publish.service == PublishService_1.PublishService.AzureWebApp) {
            return new AzureWebApp_1.AzureWebApp(paths, config.publish);
        }
        else {
            console.log(`Unsupported publish service (${config.publish.service}), please add to the publish scripts!`);
        }
    }
    else {
        console.log(`\nA 'publish' object is required with a defined 'service' in ${Config_1.ConfigFilePath} or ${Config_1.SecretsFilePath}\n`);
    }
    process.exit(-2);
}
exports.getDeploymentService = getDeploymentService;
