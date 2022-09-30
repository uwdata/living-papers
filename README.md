# Living Papers

Authoring tools for scholarly communication. Create interactive web pages or formal research papers from markdown source.

This repo is a research testbed for Living Papers development. There will be bugs. Contributions (issues, PRs, etc) are welcome!

## Setup

### Pre-Requisites

Before working with Living Papers, set up your local environment:

1. Install [pandoc](https://pandoc.org/installing.html). You should be able to run `pandoc` from the command line.
2. Install other software packages as needed:
  - To use R code blocks, install [R](https://cloud.r-project.org/) along with the `knitr` package and other libraries you wish to use. To run the Living Papers development test suite, install R then run the following within R:
    - `install.packages(c("knitr", "tidyverse", "svglite"))`
  - To publish LaTeX / PDF output,  install a TeX distribution such as [TeX Live](https://www.tug.org/texlive/).

### Usage Instructions

To use Living Papers for a new publishing project, install the `@living-papers/cli` npm package, which provides the `lpub` utility to convert source to output documents.

### Developer Instructions

Clone this monorepo, run `npm install` to install JavaScript dependencies.

Once installed, you can:
- Run `npm run test` to run test cases across monorepo packages.
- Run `npm run lint` to lint source code across monorepo packages.
- Run `packages/cli/bin/lpub.js filename.md` to compile a source file in the current directory.
