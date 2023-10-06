import { executeCommand, getJsonFromCommand } from "../../../~shared/Command";
import { PublishService } from "../../../~shared/enums/PublishService";
import { Paths } from "../../../~shared/models/Paths";
import { PublishConfig } from "../../../~shared/models/Config";
import { IDeployment } from "../IDeployment";
import { AzureAccount } from "./Models/AzureAccount";
import { AzureDeployment } from "./Models/AzureDeployment";
import { AzurePublishConfig } from "./Models/AzurePublishConfig";

export class AzureWebApp implements IDeployment {

	paths: Paths;
	config: AzurePublishConfig;

	configValid = false;

	constructor(paths: Paths, config: PublishConfig) {
		
		this.paths = paths;
		this.config = config as AzurePublishConfig;

		if (!this.config.resourceGroup) {
			console.log(`\n${PublishService.AzureWebApp} publish requires a 'resourceGroup' element in the 'publish' config\n`);
		} else if (!this.config.appNames) {
			console.log(`\n${PublishService.AzureWebApp} publish requires a 'appNames' element in the 'publish' config\n`);
		} else if (!this.config.appNames[paths.projectName]) {
			console.log(`\n${PublishService.AzureWebApp} publish requires a 'appNames' entry for '${paths.projectName}' in the 'publish' config\n`);
		} else {
			this.configValid = true;
		}
	}

	ContainerName(): string {
		return this.config.appNames[this.paths.projectName];
	}

	Publish(cb: (url: string) => void): void {
		this.Login();
		let r = getJsonFromCommand<AzureDeployment>(`az webapp deploy --type zip --resource-group ${this.config.resourceGroup} --name ${this.config.appNames[this.paths.projectName]} --src-path ${this.paths.publishZipFilePath}`);
		if (r && r.site_name) {
			cb(`http://${r.site_name}.azurewebsites.net/`)
		} else {
			console.log('Publish failed with config', this.config, r);
			process.exit();
		}
	}

	private Login(): void {

		if (!getJsonFromCommand<AzureAccount>('az account show')) {

			console.log('Login to Azure in your browser');
			executeCommand('az login');

			console.log('\nLogin successful, publishing...');

		}
	}
}