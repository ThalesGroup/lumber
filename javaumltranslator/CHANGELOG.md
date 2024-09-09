# Change Log

All notable changes to the "javaumltranslator" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Added

-   Improve README with images

### Changed

-   showOpenDialog's title for folder selection in Java To UML

## [1.1.0]

### Added

-   Parse associations when possible (instead of parsing fields)

    Unfortunatly, extends & implements, when not explicitly referenced, are not parsed as it should

### Fixed

-   Parse Dims, Exemple : integer[] was parsed as Integer
-   Parse typeArguments : ArrayList<string> was parsed as ArrayList only
-   Invert leftToRight and rightToLeft association multiplicity

    "\*" --> "1" => "\*" = rightToLeft and "1" = leftToRight
    I see them as, form the right, when I look at the left, I see many objects

-   Association translation : show multiplicity surrounded by " when available

## [1.0.0] - 2023-04-20

This is the first release, all changes are not described here but will be in the futur

### Added

-   PlantUML To Java
-   Java To PlantUML
-   Add README documentation for Java To PlantUML

### Fixed

-   Java To PlantUML from explorer
-   Use of fs promises instead of native fs
