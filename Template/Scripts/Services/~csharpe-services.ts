//**
//** This file was written by Gaspar
//**
//** It contains all controllers in:
//**     ../../**/*.cs
//**     only if attributed: [ExportFor] with GasparType.TypeScript or containing group
//**
//** full configuration in: ../../gaspar.config.json
//**

import { DemoObject } from "../Models/~csharpe-models";
import { ServiceErrorHandler } from "./service-error-handler";

export class ServiceResponse<T> {
    data: T | null;
    error: ActionResultError | null;
    success: boolean;
    hasError: boolean;
    constructor(data: T | null, error: ActionResultError | null) {
        this.data = data;
        this.error = error;
        this.success = error == null;
        this.hasError = error != null;
    }
}
export interface ActionResultError {
    detail: string,
    instance: string,
    status: number,
    title: string,
    traceId: string,
    type: string,
}
export enum ServiceErrorMessage {
    None,
    Generic,
    ServerResponse,
}
export class ServiceErrorHelper {
    async handler<T>(response: Response, showError: ServiceErrorMessage): Promise<ServiceResponse<T>> {
        let error: ActionResultError = await response.text().then((body: any) => {
            try {
                return JSON.parse(body);
            }
            catch {
                return { status: response.status, title: response.statusText, detail: body } as ActionResultError
            }
        });
        if (showError != ServiceErrorMessage.None) {
            new ServiceErrorHandler().showError(showError == ServiceErrorMessage.ServerResponse && (error?.detail || error?.title) ? error.detail || error.title : null);
        }
        return new ServiceResponse<T>(null, error);
    }
}

export namespace TemplateService {

    //File: ../../Controllers/APIDemoController.cs

    export class APIDemoController {
        get(showError = ServiceErrorMessage.None): Promise<ServiceResponse<string[]>> {
            return fetch(`/api/get`, { method: 'GET' }).then(async response => {
                return response.ok
                    ? new ServiceResponse(await response.json(), null)
                    : new ServiceErrorHelper().handler(response,  showError);
            });
        }
        post(obj: DemoObject, showError = ServiceErrorMessage.None): Promise<ServiceResponse<string[]>> {
            return fetch(`/api/post`, { method: 'POST', body: JSON.stringify(obj), headers: { 'Content-Type': 'application/json' } }).then(async response => {
                return response.ok
                    ? new ServiceResponse(await response.json(), null)
                    : new ServiceErrorHelper().handler(response,  showError);
            });
        }
        delete(id: number, showError = ServiceErrorMessage.None): Promise<ServiceResponse<boolean>> {
            return fetch(`/api/delete?id=${id}`, { method: 'DELETE' }).then(async response => {
                return response.ok
                    ? new ServiceResponse(await response.json(), null)
                    : new ServiceErrorHelper().handler(response,  showError);
            });
        }
    }
    
}