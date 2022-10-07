---
title: Python Pyodide Integration
author:
  - name: Living Papers Team
    org: University of Washington
plugins:
  pyodide:
    micropip: [altair, vega_datasets]
---

_Warning: It may take a few seconds to load the Python interpreter and libraries._

``` py { hide=true }
import sys
```

Python version `py ${sys}.version`{.bold}

``` py
import altair as alt
from vega_datasets import data
cars = data.cars.url

chart = alt.Chart(cars).mark_point().encode(
  x='Horsepower:Q',
  y='Miles_per_Gallon:Q',
  color='Origin:N',
).interactive()
chart
```

::: figure
``` js
vl.spec(JSON.parse(chart.to_json())).render()
```
| Miles per gallon as a function of horsepower. (Altair + Vega-Lite)
:::

``` py { hide=true }
import numpy as np
~~~
from matplotlib import pyplot as plt
import types
import io
import base64
from js import document

def png(self):
  buf = io.BytesIO()
  self.savefig(buf, format='png')
  buf.seek(0)
  img_str = 'data:image/png;base64,' + base64.b64encode(buf.read()).decode('UTF-8')
  el = document.createElement('img')
  el.src = img_str
  return el

def svg(self):
  buf = io.BytesIO()
  self.savefig(buf, format='svg')
  buf.seek(0)
  div = document.createElement('div')
  div.innerHTML = buf.getvalue().decode('UTF-8')
  return div.querySelector('svg')

plt._show = types.MethodType(plt.show, plt)
plt.show = types.MethodType(png, plt)
plt.png = types.MethodType(png, plt)
plt.svg = types.MethodType(svg, plt)
plt
```

::: figure
``` js
x = np.linspace(0, sx * np.pi, 300)
---
{
  plt.figure();
  plt.plot(x, np.sin(x));
  const svg = plt.svg();
  return (plt.close(), svg);
}
```
``` js
viewof sx = Inputs.range([2, 20], { step: 0.1, value: 10 })
```
| Surfing on sinusoids! (Matplotlib + Observable)
:::
