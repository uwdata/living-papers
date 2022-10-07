---
title: Reactive Runtime Example
author:
  - name: Living Papers Team
    org: University of Washington
output:
  html: true
  latex: true
---

``` js { hide=true }
init = 128
```

``` js { hide=static }
viewof a = Inputs.range([0, 255], {step: 1, value: init})
```

::: figure
``` js
format = new Intl.NumberFormat().format
---
Plot.plot({
  marginLeft: 50,
  y: { grid: true },
  marks: [
    Plot.ruleX([a], { stroke: '#888' }),
    Plot.line(d3.range(0, Math.max(256, a)), { x: d => d, y: d => d * d, stroke: 'steelblue', strokeWidth: 2 }),
    Plot.dot([a], { x: d => d, y: d => d * d, fill: 'steelblue' })
  ],
  height: 300
})
```
| A plot of $$y = x^2$$ at $$x = ${a}$$, $$x^2 = ${a * a}$$.
:::

The square of `js a` is `js format(a * a)`.
