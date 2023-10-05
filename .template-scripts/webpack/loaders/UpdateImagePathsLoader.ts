export default function UpdateImagePaths(this: any, source: string): string {

    return source.replace(/"[./]*wwwroot\//g, '"/');
    
}