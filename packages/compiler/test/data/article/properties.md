---
title: Component Properties
---

~~~ js { hide=true }
min = 1
---
max = 10
---
values = [1,2,5,10,100,1000]
~~~

# As Block Components {nonumber=true}

Range (static):

::: range-text {min=1 max=10 span=5}
:::

Range (dynamic):

::: range-text {min=`min` max=`max` span=5}
:::

Option (static):

::: option-text {options=[1,2,5,10,100,1000] span=5}
:::

Option (dynamic):

::: option-text {options=`values` span=5}
:::

# As Inline Components {nonumber=true}

Range (static):
[:range-text:]{min=1 max=10 span=5}

Range (dynamic):
[:range-text:]{min=`min` max=`max` span=5}

Option (static):
[:option-text:]{options=[1,2,5,10,100,1000] span=5}

Option (dynamic):
[:option-text:]{options=`values` span=5}
