---
title: Multi-Way Input Binding
---

Variable: `js x = 128`

Drag me: [:range-text:]{min=0 max=255 step=1 bind=x}

Or me: [:range-text:]{min=0 max=255 step=1 bind=x}

``` js { bind=x }
viewof a = Inputs.range([0, 255], {step: 1})
```

`js viewof b = Inputs.range([0, 255], {step: 1})`{ bind=x }

[Reset](`x = 0`)
