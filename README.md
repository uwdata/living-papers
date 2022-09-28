# Living Papers

Authoring tools for scholarly communication. Create interactive web pages or formal research papers from markdown source.

This repo is a prototyping testbed for Living Papers development.

## Setup Instructions

1. Install [pandoc](https://pandoc.org/installing.html). You should be able to run `pandoc` from the command line.
2. Install other software packages as needed:
  - To use R code blocks, you must have [R](https://cloud.r-project.org/) installed with the `knitr` package and any other libraries you wish to use. To run the Living Papers test suite, install the following in R:
    - `install.packages(c("knitr", "tidyverse", "svglite"))`
  - To publish LaTeX / PDF output, you must install a TeX distribution, such as [TeX Live](https://www.tug.org/texlive/).
3. Clone this repo, run `npm install` to install JavaScript dependencies.

Once installed,
- Run `npm run test` to run the test cases across all sub-packages.
- Run `npm run lint` to lint the source code across all sub-packages.
- Run `{package-dir}/bin/lpub.js filename.md` to compile a source file in the current working directory.
