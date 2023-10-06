import { PublishConfig } from "../../../../~shared/models/Config";

export interface AzurePublishConfig extends PublishConfig {
	resourceGroup: string,
	appNames: Record<string, string>,
}
