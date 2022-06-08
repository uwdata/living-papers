import { network } from './data-network.js';

// helper function to map from d3.mouse array to x/y object
function toPoint(xy) {
  return { x: xy[0], y: xy[1] };
}

export default function(d3, dom, opt) {
  const quadColor = '#d5aaaa';
  const pointColor = 'firebrick';

  const graph = network();
  const { nodes, links } = graph;

  // init svg dom
  const w = 514;
  const h = 514;
  const el = d3.select(dom)
    .attr('class', 'quadtree');
  const svg = el.append('svg')
    .attr('width', opt.width)
    .attr('height', opt.height)
    .attr('viewBox', '0 0 514 514');
  const gg = svg.append('g');
  const eg = gg.append('g');
  const qg = gg.append('g');
  const fg = gg.append('g');
  const lg = gg.append('g');
  const ng = gg.append('g');
  const cg = gg.append('g');

  // constants
  const baseRadius = opt.radius || 4;
  const defaultExtent = [[1, 1], [513, 513]];
  const defaultProbe = {x: w / 2 + 64, y: h / 2 + 64};

  // force simulation
  const nbodyForce = d3.forceManyBody();
  const linkForce = d3.forceLink();
  const xyForce = d3.forceCenter().x(w / 2).y(h / 2);
  const simulation = d3.forceSimulation()
    .force('link', linkForce)
    .force('charge', nbodyForce)
    .force('center', xyForce);

  // state variables
  let theta2 = Math.sqrt(opt.theta) || 0;
  let quad = null;
  let size = 0;
  let layout = true;
  let active = false;
  let probePoint = defaultProbe;
  let probeDown = false;
  let es, ns, obj;

  // -- INITIALIZATION --

  // initialize diagram
  function init() {
    es = eg.selectAll('line')
      .data(links)
      .enter().append('line')
        .style('stroke', '#ccc')
        .style('stroke-width', 1)
        .style('stroke-opacity', 1)
        .style('pointer-events', 'none');

    ns = ng.selectAll('circle')
      .data(nodes)
      .enter().append('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', baseRadius)
        .style('fill', '#666')
        .style('fill-opacity', 1)
        .style('cursor', 'pointer');

    simulation
      .nodes(nodes)
      .on('tick', onTick);

    simulation.force('link')
      .links(links);

    reinit();
    size = 0;
    qg.selectAll('rect').style('opacity', 0);
    ns.style('fill-opacity', 1);

    // add probe interaction to visualization
    svg.on('mousemove', onProbeMove)
       .on('mousedown', onProbeDown);

    // add drag interaction to layout
    ns.call(d3.drag()
      .on('start', onDragStart)
      .on('drag', onDrag)
      .on('end', onDragEnd));

    return obj;
  }

  // reinitialize upon state change
  function reinit() {
    if (size != nodes.length) {
      initQuadTree(nodes);
    }
    quad.visitAfter(accumulate);
    quads().clear();
    ns.style('fill-opacity', 0.25);
  }

  // quadtree initialization
  function initQuadTree(nodes) {
    quad = d3.quadtree()
      .extent(defaultExtent)
      .x(d => d.x)
      .y(d => d.y);
    if (nodes) quad.addAll(nodes);
    size = nodes ? nodes.length : 0;
  }


  // -- EVENT LISTENERS --

  function onTick() {
    if (size > 0) {
      initQuadTree(nodes);
      quads();
    }
    es.attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    ns.attr('cx', d => d.x)
      .attr('cy', d => d.y);
  }

  function onDragStart(d) {
    if (!layout) return;
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function onDrag(d) {
    if (!layout) return;
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function onDragEnd(d) {
    if (!layout) return;
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  function onProbeMove() {
    if (active && probeDown) {
      probe(toPoint(d3.mouse(this)));
    }
  }

  function onProbeUp() {
    probeDown = false;
    window.removeEventListener('mouseup', onProbeUp);
  }

  function onProbeDown() {
    if (!active) return;

    probeDown = true;
    window.addEventListener('mouseup', onProbeUp);

    let t = d3.event.target;
    probe((t && t.localName == 'circle')
      ? t.__data__
      : toPoint(d3.mouse(this)));
  }


  // -- QUADTREE METHODS --

  // computer centers of mass
  function accumulate(quad, x1, y1, x2, y2) {
    let strength = 0, q, c, x, y, i;

    // For internal nodes, accumulate forces from child quadrants.
    if (quad.length) {
      let pid = [x1,y1,x2,y2].join(',');
      for (x = y = i = 0; i < 4; ++i) {
        if ((q = quad[i]) && (c = q.value)) {
          strength += c, x += c * q.x, y += c * q.y;
          q.parent = quad;
          q.pid = pid;
        }
      }
      quad.x = x / strength;
      quad.y = y / strength;
      quad.x1 = x1;
      quad.y1 = y1;
      quad.w = x2 - x1;
      quad.h = y2 - y1;
    }

    // For leaf nodes, accumulate forces from coincident quadrants.
    else {
      q = quad;
      q.x = q.data.x;
      q.y = q.data.y;
      do strength += 1;
      while (q = q.next);
    }

    quad.value = strength;
  }

  // return the quadtree path for a point as an array of extents
  function getPath(p) {
    let path = [];

    quad.visit(function(node, x1, y1, x2, y2) {
      // if point is not contained in node, abandon branch
      if (p.x < x1 || p.x >= x2 || p.y < y1 || p.y >= y2) {
        return true;
      }
      path.push({x1: x1, y1: y1, w: x2 - x1, h: y2 - y1});
    });

    return path;
  }


  // -- DIAGRAM UPDATE METHODS --

  // clear annotations
  function clear() {
    fg.html('');
    lg.html('');
    cg.html('');
    ns.style('fill-opacity', 1);
    return obj;
  }

  // collect and draw quadtree rectangles
  function quads() {
    let boxes = [];

    function processNode(node, extent, depth) {
      if (Array.isArray(node)) {
        processSplit(node, extent, depth);
      }
    }

    function processSplit(node, extent, depth) {
      let lo = extent[0];
      let hi = extent[1];
      let mp = [(lo[0] + hi[0]) >> 1, (lo[1] + hi[1]) >> 1];

      let e = [
        [lo, mp],
        [[mp[0], lo[1]], [hi[0], mp[1]]],
        [[lo[0], mp[1]], [mp[0], hi[1]]],
        [mp, hi]
      ];
      for (let i = 0; i < 4; ++i) {
        boxes.push(e[i]);
        e[i].depth = depth;
        if (node[i]) processNode(node[i], e[i], depth + 1);
      }
    }

    if (quad.root()) {
      // add quadtree root extents
      boxes.push(quad.extent().slice());
      // recurse to process quadtree content
      processNode(quad.root(), quad.extent(), 1);
    }

    qg.html('')
      .selectAll('rect').data(boxes)
     .enter().append('rect')
      .attr('x', q => q[0][0] + 0.5)
      .attr('y', q => q[0][1] + 0.5)
      .attr('width', q => q[1][0] - q[0][0])
      .attr('height', q => q[1][1] - q[0][1])
      .style('fill', 'none')
      .style('stroke', '#ddd')
      .style('line-width', 0.5);

    return obj;
  }

  // set the number of inserted points in the quadtree
  function treeSize(index) {
    let duration = 500;

    initQuadTree();

    if (index < 1) {
      size = 0;
      quads();
      fg.html('');
      cg.html('');
      ns.style('fill-opacity', 0.25);
      return;
    }
    size = index;

    let p = nodes[--index];

    // initialize quadtree
    quad.addAll(nodes.slice(0, index));

    // get initial tree path for point
    let path0 = getPath(p);

    // add point to quadtree
    quad.add(p).visitAfter(accumulate);

    // get updated tree path for point
    let path1 = getPath(p).slice(path0.length);

    if (path1.length) {
      fg.html('')
        .selectAll('rect.foo')
        .data(path1)
       .enter().append('rect')
        .attr('x', d => d.x1)
        .attr('y', d => d.y1)
        .attr('width', d => d.w)
        .attr('height', d => d.h)
        .style('pointer-events', 'none')
        .style('fill', 'none')
        .style('stroke', quadColor)
        .style('stroke-width', 2)
        .style('stroke-opacity', 1)
       .transition()
        .delay(0.5 * duration)
        .duration(duration)
        .style('stroke-opacity', 0)
        .remove();
    }

    quads();
    ns.style('fill-opacity', d => d.index <= index ? 1 : 0.25);

    cg.html('')
      .append('circle')
      .datum(p)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 0)
      .style('pointer-events', 'none')
      .style('fill', pointColor)
      .style('fill-opacity', 1)
     .transition()
      .duration(duration)
      .ease(d3.easeBackOut.overshoot(2))
      .attr('r', d => baseRadius)
     .transition()
      .delay(duration)
      .duration(duration)
      .style('fill-opacity', 0)
      .remove();
  }

  // play animation of center of mass accumuluation
  function animateAccumulation(flag) {
    if (!flag) return;

    let duration = 400;
    let quads = [];
    let queue = [];
    let map = {};

    reinit();

    // collect non-leaf nodes
    quad.visitAfter(function(quad) {
      if (quad.length) quads.push(quad);
    });
    // group nodes by depth (using width as proxy)
    quads.forEach(function(q) {
      const id = q.w;
      let l = map[id];
      if (!l) queue.push(map[id] = l = []);
      l.push(q);
    });
    // sort groups by ascending width (descending depth)
    queue.sort((a, b) => a[0].w - b[0].w);

    // advance the animation one step
    function advance(index) {
      if (index < 1) {
        cg.html('');
        return;
      }
      index -= 1;

      let qlist = queue[index];

      qlist.forEach(function(q) {
        const points = q.filter(_ => _);

        fg.append('rect')
          .datum(q)
          .attr('x', (d) => d.x1)
          .attr('y', (d) => d.y1)
          .attr('width', (d) => d.w)
          .attr('height', (d) => d.h)
          .style('pointer-events', 'none')
          .style('fill', 'none')
          .style('stroke', quadColor)
          .style('stroke-width', 2)
          .style('stroke-opacity', 1)
        .transition()
          .duration(2 * duration)
          .delay(3 * duration)
          .style('stroke-opacity', 0)
          .remove();

        cg.selectAll('circle.foo')
          .data(points)
        .enter().append('circle')
          .attr('cx', (d) => d.x)
          .attr('cy', (d) => d.y)
          .attr('r', (d) => baseRadius * (Math.sqrt(d.value) || 1))
          .style('pointer-events', 'none')
          .style('fill', pointColor)
        .transition()
          .delay(duration)
          .duration(duration)
          .ease(d3.easeCubicIn)
          .attr('cx', q.x)
          .attr('cy', q.y)
          .remove();

        cg.append('circle')
          .datum(q)
          .attr('cx', (d) => d.x)
          .attr('cy', (d) => d.y)
          .attr('r', 0)
          .style('pointer-events', 'none')
          .style('fill', pointColor)
        .transition()
          .delay(duration * 1.8)
          .duration(duration)
          .ease(d3.easeBackOut)
          .attr('r', (d) => baseRadius * (Math.sqrt(d.value) || 1))
        .transition()
          .delay(duration)
          .duration(duration)
          .style('fill', '#666')
          .style('fill-opacity', 0.25);
      });
    }

    const stepDuration = 3.8 * duration;

    setTimeout(() => {
      // schedule each animation step
      queue.forEach(function(q, i) {
        setTimeout(() => advance(i+1), i * stepDuration);
      });
      // upon animation end, reset view
      setTimeout(() => {
        cg.selectAll('circle')
          .transition()
          .duration(500)
          .style('fill-opacity', 0)
          .remove();
      }, (1 + queue.length) * stepDuration);
    }, 1000);
  }

  // toggle interactive force-directed layout
  function performLayout(state) {
    if (layout === state) return;
    layout = state;
    if (layout) {
      simulation.alpha(0.5).alphaTarget(0).restart();
    } else {
      simulation.stop();
    }
    ns.transition(500).style('fill-opacity', layout ? 1 : 0.25);
    es.transition(500).style('stroke-opacity', +layout);
  }

  // toggle interactive force estimation probe
  function performEstimation(state) {
    if (active === state) return;
    active = state;
    if (active) {
      reinit();
      probe(probePoint);
    } else {
      probePoint = defaultProbe;
      quads().clear();
    }
  }

  // perform force estimation relative to probe point
  function estimate() {
    clear();

    let p = probePoint;
    if (!p) return;

    let charges = [];
    let boxes = [];
    let fx = 0;
    let fy = 0;

    quad.visit((quad, x1, y1, x2, y2) => {
      if (!quad.value) return true;

      let x = quad.x - p.x;
      let y = quad.y - p.y;
      let w = x2 - x1;
      let l = x * x + y * y;

      // Apply the Barnes-Hut approximation.
      if (quad.length && w * w / theta2 < l) {
        const c = {
          x: quad.x,
          y: quad.y,
          v: quad.value,
          s: 5e3 * quad.value / l
        };
        charges.push(c);
        boxes.push({x: x1, y: y1, w: w, h: y2 - y1});

        fx += x * quad.value / l;
        fy += y * quad.value / l;

        return true;
      }

      // Otherwise, process points directly.
      else if (quad.length || !l) return;

      do if (quad.data !== p) {
        charges.push({
          x: quad.data.x,
          y: quad.data.y,
          v: 1,
          s: 5e3 / l
        });
        fx += x / l;
        fy += y / l;
      } while (quad = quad.next);
    });

    fg.selectAll('rect').data(boxes)
      .enter().append('rect')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', d => d.w)
      .attr('height', d => d.h)
      .style('pointer-events', 'none')
      .style('fill', 'none')
      .style('stroke', quadColor)
      .style('stroke-width', 2);

    lg.selectAll('path').data(charges)
      .enter().append('path')
      .style('pointer-events', 'none')
      .style('stroke', '#991151')
      .style('stroke-opacity', 0.3)
      .style('stroke-dasharray', [5, 5])
      .style('stroke-linecap', 'round')
      .style('stroke-width', d => Math.max(1, Math.min(5, d.s || 1)))
      .attr('d', d => 'M' + d.x + ',' + d.y + 'L' + p.x + ',' + p.y);

    cg.selectAll('circle').data(charges)
      .enter().append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => baseRadius * (Math.sqrt(d.v) || 1))
      .style('pointer-events', 'none')
      .style('fill', pointColor);

    ns.style('fill-opacity', 0.25);

    cg.append('circle')
      .attr('cx', p.x)
      .attr('cy', p.y)
      .attr('r', baseRadius)
      .style('pointer-events', 'none')
      .style('fill', 'white')
      .style('stroke-width', 1.5)
      .style('stroke-linecap', 'round')
      .style('stroke', '#800080');

    fx = p.x - fx * 90,
    fy = p.y - fy * 90;

    cg.append('path')
      .attr('d', 'M' + p.x + ',' + p.y + 'L' + fx + ',' + fy)
      .style('pointer-events', 'none')
      .style('fill', 'none')
      .style('stroke-width', 1.5)
      .style('stroke-linecap', 'round')
      .style('stroke', 'purple');

    return obj;
  }

  // set the probe point
  function probe(point) {
    probePoint = point;
    return estimate();
  }

  // set the Barnes-Hut theta parameter
  function theta(_) {
    theta2 = _ * _;
    return estimate();
  }

  // set the default node charge / mass
  function charge(_) {
    const c = +_;
    if (c === c) {
      nbodyForce.strength(c);
    }
    if (layout) {
      simulation.alpha(0.5).alphaTarget(0).restart();
    }
  }

  // define returned API object
  obj = {
    svg,
    quad,
    init,
    size: treeSize,
    clear,
    theta,
    charge,
    layout: performLayout,
    estimate: performEstimation,
    accumulate: animateAccumulation,
  };

  return init();
};