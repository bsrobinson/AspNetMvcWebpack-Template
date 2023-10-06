import { AzureUser } from "./AzureUser";

export interface AzureAccount {
	environmentName: string,
	homeTenantId: string,
	id: string,
	isDefault: boolean,
	name: string,
	state: string,
	tenantId: string,
	user: AzureUser,
}