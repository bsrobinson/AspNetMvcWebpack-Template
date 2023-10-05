import { PublishService } from "../enums/PublishService";

export interface Config {
    
	defaultProject: string,
    embededJsMapOffset: number;
    publish: PublishConfig;

}

export interface PublishConfig {
	service: PublishService,
	replacements?: {
		file: string,
		replace: string,
		with: string,
	}[],
}