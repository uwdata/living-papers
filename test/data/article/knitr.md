---
title: R knitr Integration
plugins:
  knitr:
    import: [ggplot2, jsonlite]
    dev: svglite
---

Version: `r R.version.string`{.bold}

# Plots

Let's make some plots.

::: figure { .margin }
``` r { figwidth=5 figheight=3 }
hist(rnorm(1000))
```
| Histogram of random variates.
:::

::: figure
``` r { asp=0.5 }
ggplot(faithfuld, aes(waiting, eruptions, z = density)) +
  geom_contour_filled()
```
| Density plot of Old Faithful
:::

# Linear Model

``` r { hide=true }
m <- lm(hwy ~ displ, data = mpg)
```

Let's fit a model: `lm(hwy ~ displ, data = mpg)`{.r}

::: figure { .page }
``` r { keep="high" figwidth=6 asp=0.6 width="50%" }
ggplot(data = mpg, aes(x = displ, y = hwy)) +
  geom_point() +
  geom_smooth(method='lm') +
  xlab('Displacement') + ylab('Highway Fuel Efficiency')

ggplot(m, aes(x = mpg$displ, y = .resid)) +
  geom_point() +
  geom_hline(yintercept = 0) +
  xlab('Displacement') + ylab('Residual Values')
```
| (Left) Displacement vs. highway efficiency. (Right) Residual plot.
:::

``` r { .small }
summary(m)
```

``` r { bind="coef" }
toJSON(coefficients(m))
```

The fitted line is $$y = ${coef[1]} x + ${coef[0]}$$.

# Et Cetera

The square root of 5 is `r sqrt(5)`{.italic}.
