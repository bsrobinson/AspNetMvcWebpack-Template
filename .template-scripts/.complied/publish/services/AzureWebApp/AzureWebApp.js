"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureWebApp = void 0;
const Command_1 = require("../../../~shared/Command");
const PublishService_1 = require("../../../~shared/enums/PublishService");
class AzureWebApp {
    paths;
    config;
    configValid = false;
    constructor(paths, config) {
        this.paths = paths;
        this.config = config;
        if (!this.config.resourceGroup) {
            console.log(`\n${PublishService_1.PublishService.AzureWebApp} publish requires a 'resourceGroup' element in the 'publish' config\n`);
        }
        else if (!this.config.appNames) {
            console.log(`\n${PublishService_1.PublishService.AzureWebApp} publish requires a 'appNames' element in the 'publish' config\n`);
        }
        else if (!this.config.appNames[paths.projectName]) {
            console.log(`\n${PublishService_1.PublishService.AzureWebApp} publish requires a 'appNames' entry for '${paths.projectName}' in the 'publish' config\n`);
        }
        else {
            this.configValid = true;
        }
    }
    ContainerName() {
        return this.config.appNames[this.paths.projectName];
    }
    Publish(cb) {
        this.Login();
        let r = (0, Command_1.getJsonFromCommand)(`az webapp deploy --type zip --resource-group ${this.config.resourceGroup} --name ${this.config.appNames[this.paths.projectName]} --src-path ${this.paths.publishZipFilePath}`);
        if (r && r.site_name) {
            cb(`http://${r.site_name}.azurewebsites.net/`);
        }
        else {
            console.log('Publish failed with config', this.config, r);
            process.exit();
        }
    }
    Login() {
        if (!(0, Command_1.getJsonFromCommand)('az account show')) {
            console.log('Login to Azure in your browser');
            (0, Command_1.executeCommand)('az login');
        }
    }
}
exports.AzureWebApp = AzureWebApp;
