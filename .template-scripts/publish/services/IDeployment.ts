import { PublishService } from "../../~shared/enums/PublishService";
import { Paths } from "../../~shared/models/Paths";
import { PublishConfig } from "../../~shared/models/Config";
import { AzureWebApp } from "./AzureWebApp/AzureWebApp";
import { ConfigFilePath, ReadConfig, SecretsFilePath } from "../../~shared/Config";

export function getDeploymentService(paths: Paths): IDeployment {

	let config = ReadConfig();
	if (config.publish && config.publish.service) {
	
		if (config.publish.service == PublishService.AzureWebApp) {
			return new AzureWebApp(paths, config.publish);
		}
		else {
			console.log(`Unsupported publish service (${config.publish.service}), please add to the publish scripts!`)
		}
	}
	 else {
		console.log(`\nA 'publish' object is required with a defined 'service' in ${ConfigFilePath} or ${SecretsFilePath}\n`);
	}
	
	process.exit(-2);
}

export interface IDeployment {

	config: PublishConfig;
	configValid: boolean;

	ContainerName: () => string;
	Publish: (cb: (url: string) => void) => void;
	
}