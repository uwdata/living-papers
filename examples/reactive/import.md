---
title: Reactive Runtime Imports
author:
  - name: Living Papers Team
    org: University of Washington
output:
  html: true
---

``` js
viewof a = Inputs.range([0, 255], {step: 1, value: 200})
```

::: figure
``` js
import { plot } with { a } from './build/runtime.mjs'
---
plot
```
| A plot imported from another article runtime, with injected reactive variables!
:::
