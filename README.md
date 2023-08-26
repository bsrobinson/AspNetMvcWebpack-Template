# AspNetMvcWebpack-Template

Base template for single stack web applications with a c# asp.net/mvc and mysql backend, and typescript/sass/razor frontend.  Using Webpack and Gaspar build tools.

## Structure

This template follows the MVC pattern.  At the backend there are C# Models and Controllers (and other support files you need).  At the front end there are Razor Views each supported by a Typescript and SASS file.  There are also global Typescript and SASS files accessable to the whole application.

The end result is designed to be as compact and efficiant as possible on the front end, minimising the number of HTTP calls, and ensureing the files downloaded are as minimal as possible.

This is the contents of the Template, with config and minor support files removed.

- `/Template` is the main project folder.
  
  - `/Template/Controllers` contains the MVC controller classes.
  
  - `/Template/Models` contains the MVC model classes.
  
  - `/Template/Scripts` contains global site-wide typescript. 
    
    - `/Template/Scripts/BRLibraries` contains some basic javascript libraries.
    
    - `/Template/Scripts/Models` can be used for `.ts` models
      
      - `/Template/Scripts/Models/~csharpe.ts` is the Gaspar export of c# models for use in typescript.
    
    - `/Template/Scripts/Site.ts` is the main entry point for the application, this will be complied into Javascript along with any files it references other unreferenced ts files will not be included).  This will be loaded as a separate javascript file and (hopefully) cached by the browser for the whole site.
  
  - `/Template/Styles/Site.scss` contains global site-wide scss.  This will be loaded as a separate css file and (hopefully) cached by the browser for the whole site.
  
  - `/Templates/Views` contains the MVC view files
    
    - `/Template/Views/Home/` contains the files for the HomeController.  For every page should have a `.cshtml` file (as usual) plus a`.ts`and`.scss` file.  The three files will be reassembled into the final html delivered to the browser.
      
      You can reference any other typescript in these `.ts` files
      
      , this will be packaged onto that page, unless it is already provided via `Site.ts`.
    
    - `/Template/Views/Shared/_Layout.cshtml` is the standard template for other razor files.  In here is all the code that combines js and css into the final file
  
  - `Template/wwwroot` contains images and other static assets.  You can reference images from sass files relative to the `.scss` file; the reference will be fixed by webpack.

- `/Template.Library` is for shared code shared between projects (for when you add a second project).  For now it contains the Data Access Layer models for mysql. 

<img src="file:///Users/ben/Library/Application%20Support/marktext/images/2023-08-20-17-45-14-image.png" title="" alt="" width="294">

## Rename the template

Before building your application you will need to replace all the references to 'Template' with the name of your app.  To do this:

- Use Find and Replace to search within the files for 'Template' and replace with your project name; without spaces

- Rename the following file and folders, replacing 'Template' with your project name, as above:
  
  - `/Template.sln`
  
  - `/Template/Template.csproj`
  
  - `/Template.Library/Template.Library.csproj`
  
  - `/Template`
  
  - `/Template.Library`

## Running the Application Locally

Once you have created a new repository from this template you should run the template to make sure everything is working as you expect.

### Using Visual Studio Code

The best way to run the application is using Visual Studio Code.

To run, open the template root in a new Code window; then in the teminal type:

```bash
npm start
```

This will:

- Install required nuget and npm packages (on the first run or if they go missing)
  *npm install is triggered by the dotnet build*

- Clean the build output, deleting files generated during a build.

- Build the .Net (BE) and Webpack (FE) parts of the application.

- Trigger `dotnet watch` and `webpack watch` to monitor for changes and rebuild on the fly *(this step triggers the build step above)*.

- Launch the application in your default browser *(triggered by dotnet watch)*

### Using Visual Studio

You can also run the application using Visual Studio, and this is often easier when debugging the c# backend code.

To run in Visual Studio, open the `Template.sln` file and run the project as you would normally.   The build process with trigger a Webpack build and ensure all the frontend files are ready.

### Using the Command Line

You can run the following commands from the root of the template:

- **`npm start`**
  To clean, build and watch the default project with dotnet and webpack.

- **`npm start -- [project_name]`**
  To clean, build and watch a specific project (e.g. `npm start -- Template`).

- **`npx webpack`**
  To build webpack resources (js/css) for the default project.

- **`npx webpack --watch`**
  To build and watch webpack resources (js/css) for the default project.

- **`npx webpack --env project=[project_name]`**
  To build webpack resources (js/css) for the named project (e.g. `npx webpack --env project=Template`).

- **`npx webpack --watch --env project=[project_name]`**
  To build and watch webpack resources (js/css) for the named project (e.g. `npx webpack --watch --env project=Template`).

- **`dotnet [ build | clean | run | watch | publish ] --project=[project_name]`**
  To run dotnet commands as usual, project must be supplied from the root.
  `dotnet build` also builds webpack resources.
  `dotnet clean` cleans webpack resources.
  `dotnet publish` builds webpack resources for production.

## Publishing the Application

To publish the application, run the following from the command line:

```bash
dotnet publish
```

When publishing, webpack will be run in production mode which will minify the javascript and css, and remove map files and debuger statements.
