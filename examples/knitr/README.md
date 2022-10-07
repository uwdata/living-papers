# R Code with Knitr Example

An article with R code cells that are evaluated at compile time.

Run `npm run build` to compile the article. This example requires a working R installation: `Rscript` must be accessible via the command line. In addition the R packages `knitr`, `ggplot2`, `jsonlite`, and `svglite` must be installed.

To install these packages, run the following within R:

``` r
install.packages(c("knitr", "tidyverse", "jsonlite", "svglite"))
```

This example demonstrates:

- Evaluation of R code using the knitr library
- Passing output JSON from R to JavaScript using the `bind` attribute