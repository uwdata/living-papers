---
title: R knitr Integration
plugins:
  knitr: true
---

::: figure
| Histogram of random variates.
``` r
hist(rnorm(1000))
```
:::

::: figure
| Plot of one to ten.
``` r { asp=0.75 }
plot(1:10)
```
:::

``` r
u <- c(1, 3, 5, 7, 9, 11)
v <- c(2, 10, 6, 4, 8, 12)
u
t <- wilcox.test(u, v, paired = TRUE, conf.int = TRUE)
t
```

``` r
a <- c(1,2,3)
b <- c(4,5,6)
a + b
```

Inline text: sqrt(5) = `r sqrt(5)` and p = `r t$p.value`.

Also, a + b = `r c(1,2,3) + b + b`{.bold}
