import VegaPlot from './vega-plot.js';

const spec = {
  width: 635,
  height: 200,
  autosize: 'fit',
  config: {title: {fontSize: 12, frame: 'group', anchor: 'start', offset: 0}},

  signals: [
    {
      name: "theta",
      value: -1,
      on: [
        {
          events: 'text:mouseover, line:mouseover',
          update: 'datum.theta'
        },
        {
          events: 'text:mouseout, line:mouseout',
          update: '-abs(theta) - 1'
        }
      ]
    },
    {
      name: "foci",
      value: [0, 0.5, 1, 1.5]
    }
  ],

  data: [
    {
      name: 'perf',
      transform: [
        {
          type: 'filter',
          expr: 'datum.theta > 0'
        }
      ]
    },
    {
      name: 'labels',
      source: 'perf',
      transform: [
        {
          type: 'filter',
          expr: 'datum.nodes === 1e4'
        },
        {
          type: 'formula', as: 'label',
          expr: 'datum.theta ? "\u03F4 = " + datum.theta : "Naïve"'
        }
      ]
    }
  ],

  scales: [
    {
      name: 'xs',
      type: 'linear',
      domain: {data: 'perf', field: 'nodes'},
      range: 'width'
    },
    {
      name: 'ys',
      type: 'linear',
      domain: {data: 'perf', field: 'error'},
      range: 'height',
      zero: false,
      nice: true
    },
    {
      name: 'cs',
      type: 'ordinal',
      range: ['rgb(140, 41, 129)', 'rgb(222, 73, 104)', 'rgb(254, 159, 109)']
    }
  ],

  title: 'Average Error, Relative to Naïve Calculation (pixels)',

  axes: [
    {
      orient: 'left', scale: 'ys',
      grid: true, tickCount: 5, minExtent: 35
    },
    {
      orient: 'bottom', scale: 'xs',
      title: 'Number of Points'
    }
  ],

  marks: [
    {
      type: 'group',
      from: {
        facet: {
          data: 'perf',
          name: 'series',
          groupby: 'theta'
        }
      },
      marks: [
        {
          type: 'line',
          from: {data: 'series'},
          encode: {
            enter: {
              interpolate: 'monotone',
              x: {scale: 'xs', field: 'nodes'},
              y: {scale: 'ys', field: 'error'},
              stroke: {scale: 'cs', field: 'theta'},
              strokeWidth: {value: 3}
            },
            update: {
              opacity: {signal: "indexof(foci, theta) < 0 || theta === datum.theta ? 1 : 0.25"}
            }
          }
        }
      ]
    },
    {
      type: 'text',
      from: {data: 'labels'},
      encode: {
        enter: {
          x: {scale: 'xs', field: 'nodes'},
          dx: {value: 6},
          y: {scale: 'ys', field: 'error'},
          baseline: {value: 'middle'},
          text: {field: 'label'},
          fill: {scale: 'cs', field: 'theta'}
        },
        update: {
          opacity: {signal: "indexof(foci, theta) < 0 || theta === datum.theta ? 1 : 0.25"}
        }
      }
    }
  ]
};

export default class ErrorPlot extends VegaPlot {
  constructor() {
    super(spec);
  }
}
