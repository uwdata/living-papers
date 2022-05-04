---
title: Observable Integration
---

# Block and Inline Elements

``` js { hide=true }
init = 128
```

[Increment the initial value](`init = (a + 1) % 256` "Increment the initial value.")

``` js
viewof a = Inputs.range([0, 255], {step: 1, value: init})
```

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

$$x^2 = ${a*a}$$

The square of `js a` is `js format(a * a)`.

# Multi-Cell Code Blocks

``` js
import { aq } from '@uwdata/arquero'
---
dt = aq
  .table({
    k: ['a', 'b', 'c'],
    v: [1, 2, 3]
  })
  .pivot('k', 'v')
  .view()
```

# Hidden Cell

One plus one is `js plus1(1)`.

``` js { hide=true }
function plus1(x) { return x + 1; }
```

# Mutable State

``` js
mutable z = 4
---
md`The state value is ${z}.`
```

``` js {}
{
  const button = html`<button>Increment the state</button>`;
  button.addEventListener('click', () => (mutable z++));
  return button;
}
```

# Generators

The current time is `js
{
  for (let i = 0; ++i < 10;) {
    yield Promises.delay(1000, new Date().toLocaleTimeString());
  }
}
`
