library(tidyverse)

# variables to compute
confidence_level <- c(0.5, 0.68, 0.8, 0.9, 0.95, 0.99, 0.999)
bootstrap <- c(T, F)
log_transform <- c(T, F)
bonferroni <- c(F, T)
n_comparisons <- 3

# resolution for jpg
dpi <- 150

all_combinations <- expand.grid(confidence_level = confidence_level, bootstrap = bootstrap, log_transform = log_transform, bonferroni = bonferroni, n_comparisons = n_comparisons)


#' Read the data.
d <- read.csv("userlogs.csv")

d1 <- d %>% group_by(subject, modality, modalityname) %>% 
  summarise(logtime = mean(logtime), time = mean(time)) %>% arrange(subject)
d1$anti_time = exp(d1$logtime)

source("CI.helpers.R")
source("plotting functions.R")

# assign the data we want to use to a dedicated column in the data frame; this is necessary since the data in the data frame is already aggregated by participant and thus uses log transform or not

for (i in 1:nrow(all_combinations)){

  # factors for this round
  conf_level <- all_combinations$confidence_level[i]
  bonf <- all_combinations$bonferroni[i]
  adjusted_level <- 1 - (1 - conf_level) / all_combinations$n_comparisons[i]
  boots <- all_combinations$bootstrap[i]
  l_transform <- all_combinations$log_transform[i]
  
  filename <- conf_level
  filename <- ifelse(boots, paste(filename, "bootstrapped", sep = "-"), filename)
  filename <- ifelse(l_transform, paste(filename, "log-transformed", sep = "-"), filename)
  filename <- ifelse(bonf, paste(filename, "bonferroni-adjusted", sep = "-"), filename)
  
if(l_transform){
  d1$time_used <- d1$logtime
  trans <- exp
} else {
  d1$time_used <- d1$time
  trans <- identity
}

# extract the vectors for times for each condition
phys_touch <- d1$time_used[d1$modalityname=="physical-touch"]
phys_notouch <- d1$time_used[d1$modalityname=="physical-notouch"]
virtual_mouse <- d1$time_used[d1$modalityname=="virtual-mouse"]
virtual_prop <- d1$time_used[d1$modalityname=="virtual-prop"]


# compute confidence intervals for each condition
ci_phys_touch <- meanCI.bootstrap(phys_touch, conf_level, boots)
ci_phys_notouch <- meanCI.bootstrap(phys_notouch, conf_level, boots)
ci_virtual_prop <- meanCI.bootstrap(virtual_prop, conf_level, boots)
ci_virtual_mouse <- meanCI.bootstrap(virtual_mouse, conf_level, boots)


d2 <- NULL
d2 <- add.ci.to.df(trans(ci_virtual_mouse), "virtual mouse", "virtual mouse", d2)
d2 <- add.ci.to.df(trans(ci_virtual_prop), "virtual prop", "virtual prop", d2)
d2 <- add.ci.to.df(trans(ci_phys_notouch), "physical no touch", "physical no touch", d2)
d2 <- add.ci.to.df(trans(ci_phys_touch), "physical touch", "physical touch", d2)

p <- ci.plot(d2, x.low = 0, x.high = 70, tick.distance = 10, y.labels = T)
ggsave(paste("figures/fig1-", filename, ".jpg", sep = ""), p, width = 4, height = 1.5, dpi = dpi)


# now the pairwise comparison plot

adj_conf_level <- ifelse(bonf, adjusted_level, conf_level)
touch_notouch <- meanCI.bootstrap(phys_touch - phys_notouch, adj_conf_level, boots)
notouch_prop <- meanCI.bootstrap(phys_notouch - virtual_prop, adj_conf_level, boots)
prop_mouse <- meanCI.bootstrap(virtual_prop - virtual_mouse, adj_conf_level, boots)

d3 <- NULL
d3 <- add.ci.to.df(trans(prop_mouse), "virtual prop / virtual mouse", "virtual prop / virtual mouse", d3)
d3 <- add.ci.to.df(trans(notouch_prop), "physical no touch / virtual prop", "physical no touch / virtual prop", d3)
d3 <- add.ci.to.df(trans(touch_notouch), "physical touch / no touch", "physical touch / no touch", d3)

p2 <- left_right_diff_plot(d3, scale.min = ifelse(l_transform, 0.8, -10), scale.max = ifelse(l_transform, 1, 0), x.low = ifelse(l_transform, 0.62, -19), x.high = ifelse(l_transform, 1.18, 9), tick.distance = ifelse(l_transform, 0.2, 10), intercept = ifelse(l_transform, 1, 0), x.label = ifelse(l_transform, "Ratio", "Difference"), y.labels = F, left.labels = c("physical touch", "physical no touch", "virtual prop"), right.labels = c("physical no touch", "virtual prop", "virtual mouse"), unit.label = ifelse(l_transform, F, T))
ggsave(paste("figures/fig2-", filename, ".jpg", sep = ""), p2, width = 4, height = 1.5, dpi = dpi)
}