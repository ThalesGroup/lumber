# `Java / UML Translator`

## Intro

This project is an Visual Studio Code (VSC) extension that translate an UML Class Diagram into a Java source code or translate Java source code into an UML Class Diagram.

If you're not familiar with plantuml I suggest you to browse [their website](https://plantuml.com/fr/)

## Compatibility

Works on every version of VSC until 1.74.0, to see if your version is higher, you can open the About panel in the Help section :

![](images/version.png)

## Installation as an extension

This project is distributed in two format :

- A Visual Studio Code extension
- As two command executable in a CLI

If you just want to get the extension on your VSC you can download [the latest package](https://github.com/ThalesGroup/lumber/javaumltranslator/-/jobs/artifacts/main/download?job=package).

**Check out the [latest release](https://github.com/ThalesGroup/lumber/javaumltranslator/-/releases/permalink/latest) for more informations on the latest changes !**

Then install it via the extension panel :

![](images/install-vsix.png)

## Installation from source code

### \[Build\]

To install the dependencies of this project, you must first build the following dependency: [**datamodel project**](../datamodel/)

To do that, execute the following (assuming your CLI is located at the root of the javaumltranslator project):

```sh
cd ../datamodel
npm install # Install Datamodel's dependencies
npm run build # Build Datamodel project
```

Then, go back to this project (`cd ../javaumltranslator`), and build it:

```sh
npm install # Install dependencies
npm run build # Build project
```

After that you should have a **dist/** folder filled with the project scripts

### \[RUN\] Start the project

I assume that you have successfully installed all dependencies and build the projet.

If this doesn't work for you or if you wan't to start the project from the code you can simply clone the repo.
You can build the project with `npm run build` and start it by pressing `F5` on VSC with the workspace set on the root folder of the project, where the package.json is located.

## Usage

At this time you should have a working extension named Java / UML Translator on a VSC window, if not please refer to the section [Installation](#installation) section.

### PlantUML to Java

To use it just do a right click on an PlantUML file and you should see a `UML To Java` button just above the `rename...` button.

![](images/umlJavaExplorer.png)

Then a window will appear to asks you in which folder you want to save the java files.

![](images/umlJavaOutFolder.png)

If you are editing a plantUML diagram you can also translate this diagram by executing the commande `UML To Java` from the `Commande Palette (CTRL+SHIFT+P)`.

![](images/umlJavaPalette.png)

### Java to PlantUML

Reverse code into a diagram is as simple as generating code, you just have to do a right click on a folder and then click on Java To UML.

![](images/javaUmlExplorer.png)

You can also do that by executing the command from the `Commande Palette (CTRL+SHIFT+P)`, it will then asks you to select the start folder.

![](images/javaUmlPalette.png)
![](images/javaUmlInputFolders.png)

_The reverse engineering will recursivly retrieve all java files located in subdirectories !_

## Test

You can launch test by executing `npm test`
