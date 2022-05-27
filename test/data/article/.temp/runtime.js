import define1 from "https://api.observablehq.com/@uwdata/arquero.js?v=3";

export function cells() {
function _1(){return(
128
)}

function _2(Inputs,init){return(
Inputs.range([0, 255], {step: 1, value: init})
)}

function _3(){return(
new Intl.NumberFormat().format
)}

function _4(Plot,a,d3){return(
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
)}

function _5(a){return(
a
)}

function _6(format,a){return(
format(a * a)
)}

function _7(aq){return(
aq
  .table({
    k: ['a', 'b', 'c'],
    v: [1, 2, 3]
  })
  .pivot('k', 'v')
  .view()
)}

function _8(plus1){return(
plus1(1)
)}

function _9(){return(
function plus1(x) { return x + 1; }
)}

function _10(){return(
4
)}

function _11(md,z){return(
md`The state value is ${z}.`
)}

function _12(html,$0){
  const button = html`<button>Increment the state</button>`;
  button.addEventListener('click', () => ($0.value++));
  return button;
}

function* _13(Promises){   for (let i = 0; ++i < 10;) {     yield Promises.delay(1000, new Date().toLocaleTimeString());   } }

return [
  {define:["init", [], _1], cell:0},
  {define:["viewof a", ["Inputs","init"], _2], cell:1},
  {define:["a", ["Generators","viewof a"], (G, _) => G.input(_)]},
  {define:["format", [], _3], cell:2},
  {define:[null, ["Plot","a","d3"], _4], cell:3},
  {define:[null, ["a"], _5], cell:4},
  {define:[null, ["format","a"], _6], cell:5},
  {module:[1, define1]},
  {import:[1, "aq"]},
  {define:["dt", ["aq"], _7], cell:7},
  {define:[null, ["plus1"], _8], cell:8},
  {define:["plus1", [], _9], cell:9},
  {define:["initial z", [], _10]},
  {define:["mutable z", ["Mutable","initial z"], (M, _) => new M(_)]},
  {define:["z", ["mutable z"], _ => _.generator], cell:10},
  {define:[null, ["md","z"], _11], cell:11},
  {define:[null, ["html","mutable z"], _12], cell:12},
  {define:[null, ["Promises"], _13], cell:13}
];
}

export function attrs() {
function _1(a){return(
`x^2 = ${a*a}`
)}

return [
  {define:[null, ["a"], _1], cell:0}
];
}

export function event() {
function _1(a){return([
__proxy__ => {return(
(event) => {__proxy__.init = (a + 1) % 256}
)},
["init"]
])}

return [
  {define:["__eventundefined__", ["a"], _1], cell:0}
];
}