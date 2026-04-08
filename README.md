# Lumber

[![CI](https://github.com/ThalesGroup/lumber/actions/workflows/ci.yml/badge.svg)](https://github.com/ThalesGroup/lumber/actions/workflows/ci.yml)

Lumber is a collection of Visual Studio Code (VSC) extensions use to generate code with UML Diagrams and reverse source code to extract documentation (PlantUML).

This set of tools allows you to reverse source code for documentation & do source code generation in the following languages:

- [Java](./javaumltranslator/)
- [Protobuf](./protobufumltranslator/)

## Installation

Follow the instruction on each project to install it as a Visual Studio Code extension.

- [JavaUMLTranslator (Java <-> PlantUML)](./javaumltranslator/README.md)
- [ProtobufUMLTranslator (Protobuf <-> PlantUML)](./protobufumltranslator/README.md)

## Usage

See each project for usage

## Roadmap

This project started of several tools that were completly distinct from each others. Now, it's starting to look like a project **composed** of multiple components that each has its own purpose (parse/generate in Java, Protobuf, etc.).

Each language should have its own vscode extension for simplicity, but should also be available with a CLI for exemple.

In order to fullfill this, I created the following Roadmap that help visualize how far we are from this goal:

- [***DONE***] ~~Extract the datamodel and a Translator interface and put them in a specific project that all language project will use~~
- [**IDLE**] Publish extensions to the VSC marketplace
- [**IDLE**] Create a CLI that provides every possible combination (java <-> protobuf, plantuml <-> java, etc.)
- [**IDLE**] Create exemple data for testing purpose (E2E testing)
- [**IDLE**] Create some walkthrough guide on how to use the project
    - [**IDLE**] Extensions Walkthrough
    - [**IDLE**] CLI Walkthrough

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

See [LICENCE](./LICENSE)
