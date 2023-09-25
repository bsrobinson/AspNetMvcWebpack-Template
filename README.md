<!-- REMOVE_ON_RENAME_START -->

# AspNetMvcWebpack-Template

Base template for single stack web applications with a c# [asp.net/mvc]([Getting Started with ASP.NET MVC 5 | Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/mvc/overview/getting-started/introduction/getting-started)) and [mysql](https://www.mysql.com) backend, and [typescript](https://www.typescriptlang.org)/[sass](https://sass-lang.com)/[razor]([Introduction to Razor Pages in ASP.NET Core | Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/razor-pages/?view=aspnetcore-7.0&tabs=visual-studio)) frontend.  Using [Webpack](https://webpack.js.org) and [Gaspar]([GitHub - wckdrzr/Gaspar: A c# model to other language converter. Support includes Typescript, Angular and ProtoBuff](https://github.com/wckdrzr/Gaspar)) build tools.

## Structure

<img title="" src="https://github.com/bsrobinson/AspNetMvcWebpack-Template/blob/main/readme-assets/dir-stucture.png?raw=true" alt="" width="341" align="right"> This template follows the MVC pattern.  At the backend there are C# Models and Controllers (and other support files you need).  At the front end there are Razor Views each supported by a Typescript and SASS file.  There are also global Typescript and SASS files accessible to the whole application.

The end result is designed to be as compact and efficient as possible on the front end, minimising the number of HTTP calls, and ensuring the files downloaded are as minimal as possible.

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
      
      You can reference any other typescript in these `.ts` files, this will be packaged onto that page, unless it is already provided via `Site.ts`.
    
    - `/Template/Views/Shared/_Layout.cshtml` is the standard template for other razor files.  In here is all the code that combines js and css into the final file
  
  - `Template/wwwroot` contains images and other static assets.  You can reference images from sass files relative to the `.scss` file; the reference will be fixed by webpack.

- `/Template.Library` is for shared code shared between projects (for when you add a second project).  For now it contains the Data Access Layer models for mysql. 

## Rename the template

If you create a repository directly from this template in GitHub, or check in a copy of this to GitHub, everything will be automatically renamed for you thanks to the GitHub workflow.  You need to wait a couple of minutes for the action to run.

If you need to do it manually:

- Use Find and Replace to search within the files for 'Template' and replace with your project name; without spaces

- Rename the following file and folders, replacing 'Template' with your project name, as above:
  
  - `/Template.sln`
  
  - `/Template/Template.csproj`
  
  - `/Template.Library/Template.Library.csproj`
  
  - `/Template/`
  
  - `/Template.Library/`

<!-- REMOVE_ON_RENAME_END -->

## Running the Application Locally

Once you have created a new repository from this template you should run the template to make sure everything is working as you expect.

### Using Visual Studio Code

The best way to run the application is using Visual Studio Code.

To run, open the template root in a new Code window; then in the terminal type:

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

<!-- REMOVE_ON_RENAME_START -->

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

## Writing your code

### Typescript / Javascript

#### Global Scripts

Global scripts all start from `Template` class in the `/Scripts/Site.ts` folder (renamed to you solution name).  This file will be complied by webpack and loaded (and cached) separately by the browser.  Additional and supporting classes can all be added to the /Scripts folder (although will work from anywhere), these files will be complied into the final javascript file if they are referenced from `Site.ts`.

The loaded and initialised `Template` class can be accessed from anywhere as `window.site`, for example, see how the navigation link calls the global function on click:

```cshtml
<a href="/" onclick="site.navClicked(event)">Home</a>
```

This calls the `navClicked` function in `Site.ts`.  `event` is optional, but included to demonstrate what is possible.

#### Local Page Scripts

Each page can have it's own local typescript file, as shown in the structure above.  It should be included alongside it's `.cshtml` file and have the same filename, with a `.ts` extension.  *This file will be complied into javascript and injected into the loaded page.*

The file should include a starting class named after the controller and view.  See the sample file at `/Views/Home/Index.ts`:

```typescript
import { Template } from '../../Scripts/Site'

export class HomeIndex {
    constructor(private site: Template, private data: any | null) {
    }
}
```

The controller (view folder) is called `Home` and the action (or page/cshtml) is called `Index`, so the class is called `HomeIndex`

If the file exists, this class will be loaded and initialised on page load.  It's constructor is passed two arguments:

- `site` is a reference to the initialised global site class (same as `window.site`)

- `data` is the json data this page is loaded with (see below); you should update `any | null` to the correct type once you know it.

Your local typescript file can reference any other script files in the solution.  If the referenced script has already been used by the global script, it will simply use that pre-loaded version; however if it is only referenced in the page it will be injected onto the page with the rest of the javascript (thanks to [WebPack magic](https://webpack.js.org/configuration/entry-context/#dependencies)!).

If you are only referencing external files on local pages, but want to code in the global script file, import the file in `Site.ts` as `import './filename';`

The loaded and initialised page class can be accessed from anywhere as `window.page`, for example, see how the demo button calls the local function on click:

```cshtml
<input type="button" value="Demo Button" onclick="page.buttonClick(event)" />
```

This calls the `buttonClick` function in `HomeIndex.ts`. `event` is optional, but included to demonstrate what is possible.

`window.page` is defined in `Site.ts` so page functions can be accessed from global scripts.  As the type will change it is defined as `any` and functions should always be tested for before called - see the `windowResize` code

#### Passing data to the page on load

You can collect data at anytime after the page has loaded using API's and the Gaspar service classes (see the `APIDemoController` and the call to it's post method in `Site.ts`); although often its nice to have some data preloaded from the server on page load.

There are two options for passing data to the page; the first is following the standard MVC model; returning `View(model)` from the action and receiving it in the `cshtml` file using the `@model` declaration at the top of the page (see [Views in ASP.NET Core MVC](https://learn.microsoft.com/en-us/aspnet/core/mvc/views/overview?view=aspnetcore-7.0#strongly-typed-data-viewmodel))

However if you want the data available for typescript to manipulate or act on; you can pass it to the data argument of the page constructor (see above).  To do this, add your model/data to a `jsData` property in `ViewData` as follows:

```csharp
public IActionResult Index()
{
    ViewData["jsData"] = new MyModel();
    return View();
}
```

Simply doing this, will populate the data property; for the above.  You should change the constructor data type as follows:

```typescript
constructor(private site: Template, private data: MyModel) {
```

*In C#, MyModel should have the [ExportFor(Gaspar.TypeScript)] declaration to make MyModel available within Typescript.*

#### Node Modules

Node modules can be added and referenced in your typescript files as you would expect; they follow the above rules and will only be packed if referenced.

*Note; while there are a large number of node packages in the template, they are all only used for build processes and not included in the final app.  This template exports significantly less code than other webpack implementations; especially around the css.

#### Source Maps

Source Maps are generated for all complied typescript files during development (not in a published app).

The local page javascript that is injected into the page is slightly more complicated than usual due to where it appears in the source html.  It is injected in `_Layout.cshtml` with the line `@Html.Raw(embededJs)`

**If you edit the `_Layout.cshtml` file**, adding lines above `@Html.Raw(embededJs)` (pushing it down the page); you will need to update the offset value in the webpack config.  In `webpack.config.js` update this line near the top of the file:

```javascript
var embededJsMapOffset = 15;
```

#### Window Resizes

Some designs require element sizing based on the window size; and resizing if the window size changes.  In `Site.ts` you will see a `windowResize()` function, this will be called on load and whenever the window is resized; put your resizing logic in that function.  It will check for and call (if found) `windowResize()` on the page; implement this if you have page specific elements that need to be sized.

### SCSS / CSS

CSS should be added as SCSS into one of these locations:

- `/Styles/Site.scss` to be available for the whole application.
  *The compiled css version of this file will be loaded (and cached) separately by the browser.*

- `/Views/{section}/{page}.scss` to be available only to a given page in the application (see the example in `/Views/Home/Index.scss`).
  *The complied css version of this file will be injected into the loaded page*

The contents of the local page scss file will all be prefixed with the page name on build to ensure css in here doesn't affect global content; this works using the class declaration on the content section in `Layout.cshtml`:

```cshtml
<div id="content" class="@(controller)@(view)">        
    @RenderBody()
</div>
```

So for the default home page (`/Views/Home/Index.cshtml`), the class will be `HomeIndex` and all the css generated from `/Views/Home/Index.scss` will be prefixed with `.HomeIndex`.

If you would like to adjust the styling of the content div from within the local page scss file, you can do so as follows:

```scss
&#content {
    padding-top: 120px;
    //...
}
```

### Images

Images should be added to the wwwroot folder (or subfolders) in their web-ready form.  The template doesn't currently use any webpack image tools (although may do in the future).

To reference the **images from scss** files use the relative local path from the scss file; this will help Visual Studio Code autocomplete paths as you type.  The paths will be corrected on build.

To reference the **images from cshtml**, or other locations, paths should start with `/` to reference the wwwroot folder.

## Adding MySql

The template is ready to connect to MySql, simply:

- Add a new file in the project root (alongside `appsettings.json`) called `secrets.json` and add your connection string into that file:
  
  ```json
  {
    "ConnectionStrings": {
      "MySql": "server=1.1.1.1;userid=XX;pwd=XX;port=3306;database=DB"
    }
  }
  ```
  
  *secrets.json is included in the .gitignore file, so will not be checked in, and can safely be used for other passwords and access tokens.* 

- Add the database context to your controllers; in the existing `HomeController.cs` file, you will find the code commented out ready to use.  Uncomment lines 14, 19 and 24.

- Finally add your tables as classes with the library `DAL` folder (`Table.cs` is an example that will need to be deleted) and add your tables to `~MySqlContext.cs`
  *I need to find a way to automate this*...

## Publishing the Application

To publish the application, run the following from the command line:

```bash
dotnet publish
```

When publishing, webpack will be run in production mode which will minify the javascript and css, and remove map files and debugger statements.

<!-- REMOVE_ON_RENAME_END -->

## Updating from the Template

If this template is updated, you can copy the changes into your application by running:

```node
npm run update-template
```

This process is still quite manual, but the script hopes to make it as easy as possible.  You should only run it in a source controlled environment, as the changes will be made directly to your project, and will need careful manual review.

The first time you run the script you'll be asked when to update from; which will default to your first commit.  The date last updated will be saved to a file; commit this file to make future updates simpler.
