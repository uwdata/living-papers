import VegaPlot from './vega-plot.js';

const spec = {
  width: 635,
  height: 200,
  autosize: 'fit',
  config: {
    title: {fontSize: 12, frame: 'group', anchor: 'start', offset: 0}
  },

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
      name: 'perf'
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
      domain: {data: 'perf', field: 'time'},
      range: 'height', nice: true
    },
    {
      name: 'cs',
      type: 'ordinal',
      domain: {data: 'perf', field: 'theta', sort: true},
      range: ['rgb(59, 15, 112)', 'rgb(140, 41, 129)', 'rgb(222, 73, 104)', 'rgb(254, 159, 109)']
    }
  ],

  title: 'Average Running Time (milliseconds)',

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
              y: {scale: 'ys', field: 'time'},
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
          y: {scale: 'ys', field: 'time'},
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

export default class TimePlot extends VegaPlot {
  constructor() {
    super(spec);
  }
}
