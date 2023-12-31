//**
//** This file was written by Gaspar
//**
//** It contains all models and enums in:
//**     ../../**/*.cs
//**     ../../../Template.Library/**/*.cs
//**     only if attributed: [ExportFor] with GasparType.TypeScript or containing group
//**
//** full configuration in: ../../gaspar.config.json
//**

//File: ../../Controllers/APIDemoController.cs

export interface DemoObject {
    start: number;
    count: number;
}

//File: ../../../Template.Library/DAL/Table.cs

export interface Table {
    id: number;
    str: string;
}
