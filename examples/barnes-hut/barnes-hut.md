---
title: "The Barnes-Hut Approximation: Efficient computation of N-body forces"
author:
  - name: Jeffrey Heer
    org: University of Washington
    orcid: 0000-0002-6175-1655
section-numbers: false
output:
  html:
    selfContained: true
    styles: styles.css
---

~~~ js { hide=true }
charge = -30
---
step = 0
---
accum = 0
---
theta = 0
---
focus = -1
---
layout = true
---
estimate = false
~~~

::: aside { .margin .sticky .barnes-hut }
[:barnes-hut:]{
  width=500
  height=500
  size=`step`
  theta=`theta`
  charge=`charge`
  layout=`layout && !estimate`
  estimate=`estimate`
  accumulate=`accum`
}
:::

# Introduction

Computers are exciting tools for discovery, with which we can model and explore complex phenomena.
For example, to test theories about the formation of the universe, we can perform _simulations_ to predict how galaxies evolve.
We could gather the estimated mass and location of stars and model their gravitational interactions over time.

Another avenue for discovery is to _visualize_ complex information to reveal structure and patterns.
Consider this network diagram, showing connections between people in a social network. We can examine community groups and identify people who bridge between them.

Though they may seem quite different at first, these two examples share a common need.
They both require computing forces that arise from pairwise interactions among a set of points, often referred to as an _N-body problem_.
In the case of astronomical simulation, we seek to model the gravitational forces among stars.
In the case of network visualization, we compute the layout using a similar physical simulation: nodes in the network act as charged particles that repel each other, links act as springs that pull related nodes together.

_To get a sense of how this force-directed layout works, drag the nodes or use the slider to adjust the force strength._
Negative values indicate repulsive forces, while positive values indicate attractive forces.

~~~ js {bind=charge}
Inputs.range([-30, 10], { step: 1, label: 'Force Strength' })
~~~

A straightforward approach to computing N-body forces is to consider all pairs of individual points and add up the contributions of each interaction.
This naïve scheme has _quadratic complexity_: as the number of points _n_ increases, the running time grows proportionally to _n_^2^, quickly leading to intractably long calculations.
How might we do better?

# The Barnes-Hut Approximation

To accelerate computation and make large-scale simulations possible, the astronomers Josh Barnes and Piet Hut devised a clever scheme: approximate long-range forces by replacing a group of distant points with their center of mass.
In exchange for a small amount of error, this scheme significantly speeds up calculation, with complexity _n log n_ rather than _n_^2^.

Central to this approximation is a _spatial index_: a "map" of space that helps us model groups of points as a single center of mass.
In two dimensions, we use a [quadtree](https://en.wikipedia.org/wiki/Quadtree) data structure, which subdivides square regions of space into four equal-sized quadrants.
(In three dimensions, an [octree](https://en.wikipedia.org/wiki/Octree) divides a cubic volume into eight sub-cubes.)

The Barnes-Hut approximation involves three steps:

1. Construct the spatial index (quadtree)
2. Calculate centers of mass
3. Estimate forces

Let's explore each step in turn.
We will assume we are computing _repulsive_ forces for the purposes of network layout.
This setup is akin to modeling anti-gravity or electric forces with similarly-charged particles.
While we will use the term "center of mass", this could readily be replaced with "center of charge".

_As you read through, click the [action links](`alert('👍 🎉')`) to update the diagram!_

## Step 1: Construct the Quadtree

We begin with [a set of two-dimensional input points](`layout=false, step=0`).
When we [insert the first point into the quadtree](`layout=false, step=1`), it is added to the top-level root cell of the tree.

[When we insert another point](`layout=false, step=2`), the tree expands by subdiving the space.
With
[each](`layout=false, step=Math.min(step + 1, 77)`)
[subsequent](`layout=false, step=Math.min(step + 1, 77)`)
[insertion](`layout=false, step=Math.min(step + 1, 77)`),
more fine-grained cells are added until all points reside in their own cell.

_Advance the slider to add each point and produce the full quadtree_.

~~~ js {bind=step}
Inputs.range([0, 77], { step: 1, label: 'Inserted Points' })
~~~

## Step 2: Calculate Centers of Mass

After quadtree construction, [we calculate centers of mass for each cell of the tree](`layout=false, ++accum`).
The center of mass of a quadtree cell is the weighted average of the centers of its four child cells.

We visit the leaf node cells first and then visit subsequent parent cells, merging data as we pass upwards through the tree.
Once the traversal completes, each cell has been updated with the position and strength of its center of mass.

## Step 3: Estimate N-Body Forces

Now we are ready to estimate forces!

[To measure forces at a given point, let's add a "probe" ![Probe icon](probe.svg) to our diagram](`theta=0, estimate=true`).
The purple line extending from the probe indicates the direction and magnitude of the total force at that location.
(To promote visibility, the purple line is three times longer than the actual pixel distance the probe would be moved in a single timestep of the force simulation.)
The dotted lines extending to the probe represent the force components exerted by individual points.

_Move the probe (click or drag) to explore the force field_.

Ignoring the quadtree, we can naïvely calculate forces by summing the contributions of _all_ individual points.
Of course, we want to use the quadtree to accelerate calculation and approximate long-range forces.
Rather than compute interactions among individual points, [we can compute interactions with centers of mass](`theta=1, estimate=true`), using smaller quadtree cells for nearer points and larger cells for more distant points.

At this point we skipped a critical detail: what constitutes "long-range" versus "short-range" forces?
We consider both the _distance_ to the center of a quadtree cell and that cell's _width_.
If the ratio _width / distance_ falls below a chosen threshold -- a parameter Θ (_theta_) -- we treat the quadtree cell as a source of long-range forces and use its center of mass.
Otherwise, we will recursively visit the child cells in the quadtree.

When Θ = 1, a quadtree cell's center of mass will be used -- and its internal points ignored -- if the distance from the sample point to the cell's center is greater than or equal to the cell's width.

_Adjust the Θ parameter to view its effect on force estimation_.

How does the number of considered points change based on the probe location and Θ?
How does the direction and magnitude of the total force vary with Θ?

~~~ js { bind-set=theta }
Inputs.range([0, 2], {
  step: 0.1, label: 'Theta Θ', value: focus < 0 ? -(focus + 1) : focus
})
~~~

We can now perform force estimation for each individual point, using the Barnes-Hut approximation to limit the total number of comparisons!

# Performance Analysis

To assess the performance of the Barnes-Hut approximation, we can look at
both the running time and accuracy of force estimation.
We will compare naïve (_n_^2^) calculation to different settings of the Θ parameter.

We will take measurements using different point sets, ranging from 500 to 10,000 points.
For each point count, we average the results from 50 separate runs of force estimation, each time using a different set of points placed at uniformly random coordinates within a 900 x 500 pixel rectangle.

[:time-plot:]{bind=focus}

The running time results confirm that the Barnes-Hut approximation can significantly speed-up computation.
As expected, the [naïve approach](`focus=0`){.t00} exhibits a quadratic relationship, whereas increasing the Θ parameter leads to faster calculations.
A low setting of [Θ = 0.5](`focus=0.5`){.t05} does not fare better than the naïve approach until processing about 6,000 points.
Until that point, the overhead of quadtree construction and center of mass calculation outstrips any gains in force estimation.
In contrast, for [Θ = 1](`focus=1`){.t10} and [Θ = 1.5](`focus=1.5`){.t15} we see significant improvements in running time.

To evaluate approximation error, we measure the average vector distance between the results of the naïve scheme and Barnes-Hut.
In the context of a force-directed graph layout, this error represents the difference (in pixels) between node positions after applying the naïve and approximate methods.

[:error-plot:]{bind=focus}

Looking at the error results, we first see that the average error is relatively small: only ~5% of a single pixel in difference!
However, we should take care interpreting these results, as we use the _average_ error per point and the _maximum_ error may be substantially higher.
While [Θ = 1](`focus=1`){.t10} and [Θ = 1.5](`focus=1.5`){.t15} exhibit similar _running times_, here we see notably higher _error rates_ for [Θ = 1.5](`focus=1.5`){.t15} versus [Θ = 1](`focus=1`){.t10} and [Θ = 0.5](`focus=0.5`){.t05}.

These results suggest that a good default value for Θ -- with low running time _and_ low approximation error -- is around 1.0.
Indeed, in practice it is common to see default settings slightly below 1.
In visualization applications, where errors on the order of a few pixels are not a problem, even higher Θ values may be used without issue.

# Conclusion

The Barnes-Hut approximation has had a major impact on both physical simulation and network visualization, enabling n-body calculations to scale to much larger data sets than naïve force calculation permits.

[Returning to our initial network diagram](`step=77, estimate=false, layout=true`), we can use Barnes-Hut to efficiently compute repulsive forces at each timestep.
For each animation frame, we perform the approximation anew, creating a new quadtree, accumulating centers of mass, and (approximately) estimating forces.
