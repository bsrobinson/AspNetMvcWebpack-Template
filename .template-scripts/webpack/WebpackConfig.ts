import { existsSync } from 'fs';
import { TypescriptConfig } from './config/TypescriptConfig'
import { SassConfig } from './config/SassConfig'
import { GetProjectOptions, GetProjectPaths } from '../~shared/SelectProject';

export function config() {

    let argProject = process.argv.find(a => a.slice(0, 8) == 'project=')?.slice(8);
    let allProjects = GetProjectOptions();

    let projectPaths = GetProjectPaths(allProjects.find(p => p.name == argProject) ?? allProjects[0])[0];


    if (!existsSync(`./${projectPaths.projectName}/`)) {

        console.log(`Project folder ./${projectPaths.projectName}/ does not exist`);
        process.exit(1);

    } else {

        return [ 
            TypescriptConfig(projectPaths),
            SassConfig(projectPaths)
        ];
        
    }
}