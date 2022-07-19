###########################################################################
# CI helper functions, mostly based on bootstrap CIs.
#
# For more details on bootstrap CIs see http://www.mayin.org/ajayshah/KB/R/documents/boot.html and
# and (Kirby and Gerlanc, 2013) http://web.williams.edu/Psychology/Faculty/Kirby/bootes-kirby-gerlanc-in-press.pdf.
#
# 2017 Anonymous Capybara, Anonymous Octopus
# Created March 2017, cleaned up August 2017
###########################################################################

library(boot)
library(simpleboot)
library(PropCIs)

conf.level <- 0.95

###########################################################################
# Functions for computing confidence intervals
###########################################################################

#
# Returns the mean of observations and its 95% BCa bootstrap CI.
#
meanCI.bootstrap <- function(observations, conf = conf.level, bootstrap = T) {
  samplemean <- function(x, d) {return(mean(x[d]))}
  pointEstimate <- samplemean(observations)
  result <- NULL
  if (bootstrap){
    set.seed(0) # make deterministic
    bootstrap_samples <- boot(data = observations, statistic = samplemean, R = 5000)
    bootci <- boot.ci(bootstrap_samples, type = "bca", conf)
    result <- c(pointEstimate,  bootci$bca[4], bootci$bca[5])
  } else {
    t <- t.test(observations, conf.level = conf)
    result <- c(pointEstimate, t$conf.int[1], t$conf.int[2])
  }
  return(result)
}

#
# Returns the geometric mean of observations and its 95% BCa bootstrap CI.
#
geomMeanCI.bootstrap <- function(observations) {
  observations <- log(observations)
  samplemean <- function(x, d) {return(mean(x[d]))}
  pointEstimate <- samplemean(observations)
  set.seed(0) # make deterministic
  bootstrap_samples <- boot(data = observations, statistic = samplemean, R = 5000)
  bootci <- boot.ci(bootstrap_samples, type = "bca", conf = conf.level)
  exp(c(pointEstimate,  bootci$bca[4], bootci$bca[5]))
}

#
# Returns the difference between the means of two independent samples and its
# 95% BCa bootstrap CI.
#
diffMeanCI.bootstrap <- function(group1, group2) {
  samplemean <- function(x, d) {return(mean(x[d]))}
  pointEstimate <- samplemean(group1) - samplemean(group2)
  set.seed(0) # make deterministic
  bootstrap_samples <- two.boot(sample1 = group1, sample2 = group2, FUN = samplemean, R = 5000)
  bootci <- boot.ci(bootstrap_samples, type = "bca", conf = conf.level)
  c(pointEstimate,  bootci$bca[4], bootci$bca[5])
}

#
# Returns the ratio between the geometric means of two independent samples and its
# 95% BCa bootstrap CI.
#
ratioGeomMeanCI.bootstrap <- function(group1, group2) {
  group1 <- log(group1)
  group2 <- log(group2)
  samplemean <- function(x, d) {return(mean(x[d]))}
  pointEstimate <- samplemean(group1) - samplemean(group2)
  set.seed(0) # make deterministic
  bootstrap_samples <- two.boot(sample1 = group1, sample2 = group2, FUN = samplemean, R = 5000)
  bootci <- boot.ci(bootstrap_samples, type = "bca", conf = conf.level)
  exp(c(pointEstimate,  bootci$bca[4], bootci$bca[5]))
}

#
# Returns the 95% confidence interval of a single proportion using the Wilson score interval.
#
propCI <- function(numberOfSuccesses, sampleSize) {
  CI <- scoreci(x = numberOfSuccesses, n = sampleSize, conf.level = conf.level) 
  c(numberOfSuccesses/sampleSize, CI$conf.int[1], CI$conf.int[2]) 
}

#
# Returns the difference between two independent proportions and its 95% confidence interval,
# using the score interval for difference of proportions and independent samples.
#
diffpropCI <- function(x1, n1, x2, n2) {
  diffprop <- x1/n1 - x2/n2
  CI <- diffscoreci(x1 = x1, n1 = n1, x2 = x2, n2 = n2, conf.level = conf.level)
  c(diffprop, CI$conf.int[1], CI$conf.int[2])
}

# 
# Returns the difference between two linear regression slopes and its 95% BCa bootstrap CI.
#
diff.slopes.bootstrap <- function(x1, y1, x2, y2) {
  groups <- c(rep(1, length(x1)), rep(2, length(y1)), rep(3, length(x2)), rep(4, length(y2)))
  data <- data.frame(obs = c(x1, y1, x2, y2), group = groups)
  diffslope <- function(d, i) {
    db <- d[i,]
    x1 <- db[db$group==1,]$obs
    y1 <- db[db$group==2,]$obs
    x2 <- db[db$group==3,]$obs
    y2 <- db[db$group==4,]$obs
    fit1 <- lm(y1 ~ x1)
    a1 <- fit1$coefficients[[2]]
    fit2 <- lm(y2 ~ x2)
    a2 <- fit2$coefficients[[2]]
    a2 - a1
  }

  a1 <- lm(y1 ~ x1)$coefficients[[2]]
  a2 <- lm(y2 ~ x2)$coefficients[[2]]
  pointEstimate <- a2 - a1
  set.seed(0) # make deterministic
  bootstrap_samples <- boot(data = data, statistic = diffslope, stype = "i", strata = data$group, R = 5000)
  bootci <- boot.ci(bootstrap_samples, type = "bca")
  c(pointEstimate, bootci$bca[4], bootci$bca[5])
}

#
# A function to compute a confidence interval for a difference from a p-value using 
# D.G.Altman, J.M.Bland. How to obtain the confidence interval from a p value. 
# BMJ, 343:d2090, 2011. https://doi.org/10.1136/bmj.d2090
#
ci_from_p <- function(est, p){
  z <-  -0.862 + sqrt(0.743 - 2.404 * log(p))
  se <- abs(est/z)
  ci.low <- est - 1.96 * se
  ci.high <- est + 1.96 * se
  return(c(est, ci.low, ci.high))
}

###########################################################################
# Functions for the textual presentation of confidence intervals
###########################################################################

#
# Internal function for rounding a number for textual presentation (addresses problems with prettyNum)
#
format_number_ <- function(n, sigdigits, width = NA) {
  pad(formatC(signif(n, digits=sigdigits), digits=sigdigits, format="fg", flag="#", big.mark = " "), width)
}

#
# Pad a string with white spaces. Use width=NA for no padding, and a negative width to pad right (align left).
#
pad <- function(s, width) {
  if (is.na(width))
    s
  else
    sprintf(paste('%', width, 's', sep=''), s)
}

#
# Rounds a number for textual presentation
# 
format_number <- function(n, sigdigits = NA, width = NA, percent = FALSE) {
  if (percent)
    n <- n * 100
  suffix <- ifelse(percent, '%', '')
  
  if (!is.na(sigdigits)) {
    s <- format_number_(n, width, sigdigits = sigdigits)
  } else {
    # When sigdigits = NA, we use a manual heuristic for deciding on the number of significant digits
    # (still working on that one)
    if (abs(n) >= 10)
      s <- format_number_(n, sigdigits = 2, width = width)
    else if (abs(n) >= 2)
      s <- format_number_(n, sigdigits = 2, width = width)
    else if (abs(n) >= 1)
      s <- format_number_(n, sigdigits = 3, width = width)
    else
      s <- format_number_(n, sigdigits = 2, width = width)
#    s <- format_number_(n, sigdigits = 4, width = width)
  } 
  paste(s, suffix, sep='')
}

sep <- function(ci, H0) {
  if (sign(ci[2]-H0) != sign(ci[3]-H0)) {
    '***'
  } else {
    format_number(min(abs(ci[2]-H0),abs(ci[3]-H0)) / abs(ci[3]-ci[2]))
  }
}

#
# Presents a point estimate and its CI in human-readable text form.
#
# H0 is used for displaying the relative distance to the null hypothesis and can be ignored.
#
format_ci <- function(x, sigdigits = NA, width = NA, percent = FALSE, H0 = NA) {
  nwidth <- floor((width - 8) / 3)
  pad(paste(
    format_number(x[1], sigdigits = sigdigits, width = nwidth, percent = percent),
    ', CI [',
    format_number(x[2], sigdigits = sigdigits, width = nwidth, percent = percent),
    ', ',
    format_number(x[3], sigdigits = sigdigits, width = nwidth, percent = percent),
    ']',
    ifelse(is.na(H0), '', paste(' (sep ', sep(x,H0), ')', sep='')),
    sep=''), width = width)
}

###########################################################################
# Functions to compile confidence intervals into data frames for plotting #
###########################################################################

#
# Adds a vector "ci" containing CI (as returned by the functions above) 
# with the name "name" to a dataframe "df"; "study" indicates the study from which
# the data stems
#
add.ci.to.df <- function(ci, name, study = " ", df = NULL) {
  new_df_required <- is.null(df)
  df_new <- data.frame(
    name = name, 
    study = study,
    estimate = ci[1], 
    ci.low = ci[2], 
    ci.high = ci[3], 
    order = ifelse(new_df_required, 1, nrow(df)+1))
  if (!new_df_required) 
    df_new <- rbind(df, df_new)
  return(df_new)

}
