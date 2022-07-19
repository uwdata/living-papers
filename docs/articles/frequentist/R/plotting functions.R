########################################################################
# Plotting functions to generate the various charts used in the article 
##
# 2017 Anonymous Octopus
# Created March 2017, cleaned up January 2018,
# Note: this file was reused from a different project (see http://aviz.fr/blinded)
########################################################################

library('ggplot2')
library("gridExtra")
library("cowplot")


# ggplot theme for the histograms
histtheme <-     theme_bw() +
  theme( 
    plot.background = element_blank(),
    plot.margin = margin(t = 0, r = 0, b = 0, l = 0, unit = "pt"),
    legend.position = 'none',
    axis.ticks = element_blank(),
    axis.title.y = element_blank(),
    axis.title.x = element_blank(),
    axis.text.y = element_blank(),
    axis.text.x = element_text(size=10, colour="black", margin=margin(-2,0,0,0,"pt")),
    panel.border = element_blank(),
    panel.grid = element_blank(),
    axis.line = element_blank(),
    panel.grid.minor.x = element_blank(),
    panel.grid.major.x = element_blank(),
    strip.background = element_blank(),
    strip.text.y = element_blank()
  )

# ggplot theme for the CI plots
citheme <- theme_bw() +
  theme(
    plot.background = element_blank(),
    plot.margin = margin(t = 0, r = 0, b = 0, l = 0, unit = "pt"),
    legend.position = "none",
    legend.title = element_blank(),
    legend.margin = margin(t = 0, r = 0, b = 0, l = 0, unit = "pt"),
    legend.text = element_text(size=8),
    legend.key.size = unit(c(3.5, 3.5),'mm'),
    legend.key.width = unit(c(0.3, 0.3),'cm'),
    # axis.ticks.margin=unit(c(1.5,-1.0),'mm'),
    axis.title.y = element_blank(),
    axis.title.x = element_blank(),
    axis.text.y = element_blank(),
    axis.text.x = element_text(size=10, colour="#888888"),
    panel.spacing = unit(1.5, "lines"),
    panel.border = element_blank(),
    axis.line = element_blank(),
    axis.ticks = element_blank(),
    axis.line.x = element_blank(),
    panel.grid.minor.x = element_line(size=0.1, color="#CCCCCC"),
    panel.grid.major.x = element_line(size=0.2, color="#BBBBBB"),
    panel.grid.major.y = element_blank(),
    strip.background = element_blank(),
    strip.text.y = element_blank()
  )



##########################################################################
######################## Plotting functions ##############################
##########################################################################

#
# Function to create a histogram; works to visualize Likert scale histograms 
# takes either a vector or a dataframe as input
#
histo <- function(dt, scale.min, scale.max, max.y, xlabel, step.width = 1, bar.color = "black") {
  # set up parameters according to which type of histogram the passed data requires
  scalerange <- factor(seq(from = scale.min, to = scale.max, by = step.width))
  color.scale <- rep(bar.color, length(scalerange))
  names(color.scale) <- scalerange 

  if (!is.data.frame(dt)) {
    dt <- data.frame(measure = as.numeric(dt))
  }
  p <- ggplot(dt, aes(x = measure)) + 
    geom_bar(aes(fill=factor(measure))) +
   scale_fill_manual(values=color.scale) +
    scale_x_discrete(name = xlabel, breaks= scalerange, labels = scalerange, limits = scalerange, expand = c(0,0)) +
    expand_limits(x=c(scale.min-0.5, scale.max+0.5), y = c(0, max.y)) +
    histtheme 
  
  
  return(p)
  
}

############
#
# Generic function to plot CIs around an estimate
# takes a dataframe constructed using the add_ci_to_dataframe function in CI.helpers.R
#
ci.plot <- function(ci.df, x.low = 0, x.high = 1, xLabel = " ", tick.distance = 1, color.scale = NULL, scale.factor = 1, scale.min = x.low, scale.max = x.high, y.labels = FALSE) {
  p <- ggplot(data=ci.df) + 
    expand_limits(y=c(x.low, x.high)) +
    citheme +
    coord_flip()  +
    geom_pointrange(aes(
          y=estimate * scale.factor, 
          x=reorder(study, order), 
          ymin=ci.low * scale.factor, 
          ymax=ci.high * scale.factor), fatten = 3) + 
    #facet_grid(name~.) +
    #scale_x_discrete(expand = c(0,2)) +
    labs(x = "", y = xLabel) +
    scale_y_continuous(
      breaks= seq(from=scale.min, to=scale.max, by=tick.distance), 
      labels = paste(seq(from=scale.min, to=scale.max, by=tick.distance), "s"), 
      limits = c(x.low, x.high)) 
  
  if (y.labels){
    p <- p + theme(axis.text.y = element_text(size=10, colour="#888888", hjust = 1))
  }
  return(p)
}

##########
#
# Generic function to plot differences (like the ci plot function above but with 0 emphasized)

ci.diff.plot <- function(ci.diff.df, x.low, x.high, x.label, tick.distance = 1, intercept = 0, intercept.color = "black", color.scale = ci.color.scale, scale.factor = 1, scale.min = x.low, scale.max = x.high , y.labels= FALSE, unit.label = F) {
  # the axis label vector
  axis_labels <- seq(from=scale.min, to=scale.max, by= tick.distance)
  if (unit.label){
  axis_labels <- paste(axis_labels, "s")
  }
  p <- ggplot(data= ci.diff.df) +
    citheme +
    geom_hline(yintercept = intercept, color = intercept.color) +
    coord_flip() +
    expand_limits(y = c(x.low, x.high)) +
    geom_pointrange(aes(
      y = estimate * scale.factor, 
      x=reorder(study, order), 
      ymin= ci.low * scale.factor, 
      ymax = ci.high * scale.factor), fatten = 3) + 
    labs(x = "", y = x.label) +
    theme(axis.text.y = element_blank(), legend.position = "none") +
    scale_y_continuous(
      breaks= seq(from=scale.min, to=scale.max, by= tick.distance), 
      labels = axis_labels, 
      limits = c(x.low, x.high), expand = c(0,0))# +
    #scale_x_discrete(expand = c(0,1.5))
  
  if (y.labels){
    p <- p + theme(axis.text.y = element_text(size=10, colour="black", hjust = 0.95))
  }
  
  return(p)
}

left_right_diff_plot <- function(ci.diff.df, x.low, x.high, x.label, tick.distance = 1, intercept = 0, intercept.color = "black", color.scale = ci.color.scale, scale.factor = 1, scale.min = x.low, scale.max = x.high , y.labels= FALSE, left.labels, right.labels, unit.label = F) {
  
  p <- ci.diff.plot(ci.diff.df, x.low, x.high, x.label, tick.distance, intercept, intercept.color = "black", color.scale, scale.factor, scale.min, scale.max, y.labels= FALSE, unit.label)
  
  ggdraw() +
    draw_plot(p, x = 0.26, width = 0.5) +
    draw_text(left.labels, x = c(0.27,0.27,0.27), y=c(0.84, 0.54, 0.28), hjust = 1, size = 10, colour="#888888") +
    draw_text(right.labels, x = c(0.73,0.73,0.73), y=c(0.84, 0.54, 0.28), hjust = 0, size = 10, colour="#888888")
  
}

####################################################################
##################### Plot layout functions ########################
####################################################################


drawVertical <- function(hist1, hist2, cis, cis1.label, cis2.label)  {
  ggdraw() +
    draw_plot(hist1,          0.025, 0.48, 0.2, 0.48) +
    draw_plot(hist2,          0.025, 0, 0.2, 0.48) +
    draw_plot(cis[[2]],     0.65, 0.17, 0.35, 0.55) +
    draw_plot(cis[[1]],     0.28, 0, 0.33, 0.85) +
    draw_label(cis1.label, x = 0.15, y = 0.995,
               vjust = 1, hjust=0.5, size = 10) +
    draw_label("Mean", x = 0.45, y = 0.995,
               vjust = 1, hjust = 0.5, size = 10) +
    draw_label(cis2.label, x = 0.825, y = 0.995,
               vjust = 1, hjust = 0.5, size = 10) +
    draw_label("Chart", x = 0, y = 0.25, vjust=1, angle = 90, size = 12, fontface = "bold" ) +
    draw_label("No chart", x = 0, y = 0.75, vjust=1, angle = 90, size = 12, fontface = "bold" )
}

drawVerticalComp <- function(hist1, hist2, cis, hist1.label, hist2.label, cis1.label, cis2.label)  {
  ggdraw() +
    draw_plot(hist1,          0.025, 0.5, 0.3, 0.5) +
    draw_plot(hist2,          0.025, 0, 0.3, 0.5) +
    draw_plot(cis[[2]],     0.7375, 0.3, 0.2625, 0.35) +
    draw_plot(cis[[1]],     0.315, 0.17, 0.4125, 0.6) +
    draw_label("Responses", x = 0.2, y = 1,
               vjust = 1, size = 10) +
    draw_label(cis1.label, x = 0.53125, y = 1,
               vjust = 1, size = 10) +
    draw_label(cis2.label, x = 0.84375, y = 1,
               vjust = 1, hjust = 0.5, size = 10) +
    draw_label(hist2.label, x = 0, y = 0.25, vjust=1, angle = 90, size = 10, fontface = "bold" ) +
    draw_label(hist1.label, x = 0, y = 0.75, vjust=1, angle = 90, size = 10, fontface = "bold" )
  
}

drawHorizontalEfficiency <- function(cis, labelL, labelR) {
  ggdraw() +
    draw_plot(cis[[1]],   0.025, 0, 0.54, 0.9) +
    draw_plot(cis[[2]], 0.56, 0.225, 0.44, 0.45) +
    draw_label(labelL, x = 0.275, y= 1, vjust = 1, hjust = 0.5, size=10) +
    draw_label(labelR, x = 0.775, y= 1, vjust = 1, hjust = 0.5, size=10) +
    draw_label("Chart", x = 0, y = 0.25, vjust=1, angle = 90, size = 12, fontface = "bold" ) +
    draw_label("No chart", x = 0, y = 0.75, vjust=1, angle = 90, size = 12, fontface = "bold" )
}
