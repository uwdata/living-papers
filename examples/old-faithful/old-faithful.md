---
title: Old Faithful Eruptions
output:
  html:
    selfContained: true
---

::: { .margin }
[![](https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Bierstadt_Albert_Old_Faithful.jpg/337px-Bierstadt_Albert_Old_Faithful.jpg){ height=185 }](https://en.wikipedia.org/wiki/Old_Faithful#/media/File:Bierstadt_Albert_Old_Faithful.jpg)
:::

> _It spouted at regular intervals nine times during our stay, the columns of boiling water being thrown from ninety to one hundred and twenty-five feet at each discharge, which lasted from fifteen to twenty minutes. We gave it the name of "Old Faithful."_
> — Nathaniel P. Langford, 1871 [@langford1871]

The [Old Faithful](https://en.wikipedia.org/wiki/Old_Faithful) geyser in Yellowstone National Park is a highly predictable geothermal feature that erupts about every 45 minutes to two hours. Let's examine a dataset [@doi:10.2307/2347385] of the duration of `eruptions` (in minutes) and how that relates to the subsequent `waiting` time until the next eruption.

::: table { .margin }
``` js { .small }
import { aq, op } from '@uwdata/arquero'
---
dt = aq.loadCSV('faithful.tsv', { delimiter: '\t' })
---
dt.view()
```
| The Old Faithful dataset.
:::

::: figure
``` js
Plot.plot({
  width: 650,
  height: 100,
  x: { domain: [1.5, 5.5], inset: 20 },
  marks: [
    Plot.rectY(faithful, Plot.binX({y: "count", thresholds: 25}, {x: "eruptions", "fill": "steelblue"}))
  ]
})
```
``` js
faithful = FileAttachment('faithful.tsv').tsv({ typed: true })
---
bandwidth = 20
---
Plot.plot({
  x: { domain: [1.5, 5.5] },
  width: 650,
  inset: 20,
  marks: [
    Plot.density(faithful, {x: "eruptions", y: "waiting", stroke: "steelblue", strokeWidth: 0.25, bandwidth}),
    Plot.density(faithful, {x: "eruptions", y: "waiting", stroke: "steelblue", thresholds: 4, bandwidth}),
    Plot.dot(faithful, {x: "eruptions", y: "waiting", fill: "currentColor", r: 1.5})
  ]
})
```
| Histogram and density plot of eruption length vs. waiting time (bandwidth ($\sigma$) = [:range-text:]{min=0 max=40 step=1 bind=bandwidth}). Eruptions appear to cluster into shorter (~2 minute) and longer (~4.5 minute) groups.
:::

::: figure
``` js
Plot.plot({
  width: 650,
  inset: 20,
  marks: [
    Plot.linearRegressionY(faithful, {x: "eruptions", y: "waiting", stroke: "steelblue"}),
    Plot.dot(faithful, {x: "eruptions", y: "waiting", fill: "currentColor", r: 1.5})
  ]
})
```
| Linear regression of waiting time by eruption length, with 95% confidence interval. The length of the current eruption is highly predictive of the time until the next eruption.
:::

~~~ bibliography
@article{langford1871,
  author = {Langford, Nathaniel P.},
  title = {The Wonders of the Yellowstone},
  journal = {Scribner's Monthly},
  year = {1871},
  volume = {II},
  issue = {1--2},
  pages = {123}
}
~~~