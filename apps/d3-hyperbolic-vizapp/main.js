let d3Hyperbolic = require("../../src/d3_hyperbolic").default;
let erdos_renyi = require("../../src/graph_generators").erdos_renyi;

let hyperbolicSys = new d3Hyperbolic()
  .parameters({
      projection: "hyperbolic",
      // projection: "euclidean",
      edgeThickness: 2
  })
  .renderCanvas("#render");

// let data = {
//     nodes: [
//         {
//             id: 1,
//             name: "a",
//             attr: "value",
//             color: "red",
//             label: "label",
//         },
//         {
//             id: 2,
//             name: "b",
//             attr: "value"
//         }
//     ],
//     edges: [
//       {
//         source : 1,
//         target: 2,
//         weight: 2,
//       }
//     ]
// }

let data = {
  nodes: [
    {id:1},{id:2},{id:3},{id:4},{id:5}
  ],
  edges: [
    {source:1,target:2},{source:1,target:3},{source:2,target:3},{source:2,target:4},{source:4,target:5},{source:3,target:5}
  ]
}

document.getElementById("generate-btn").addEventListener("click", () => {
  let nInput = document.getElementById('erdos-n').value
  let pInput = document.getElementById('erdos-p').value
  let projection = document.getElementById('projections').value


  console.log(nInput);

  data = erdos_renyi(nInput,pInput)
  console.log(data);

  hyperbolicSys
    .reset()
    .parameters({'projection': projection})
    .setGraph(data)
    .render();
});


// hyperbolicSys.setGraph(data);
// // Or the library allows us to read a graphviz Dot file
// let dotStr = `digraph D {
//   A [shape=diamond]
//   B [shape=box]
//   C [shape=circle]

//   A -> B [style=dashed, color=grey]
//   A -> C [color="black:invis:black"]
//   B -> C [penwidth=5, arrowhead=none]

// }`
// hyperbolicSys.setGraphFromDot(dotStr);


// hyperbolicSys.parameters({
//     optional_params: 2,
//     defaultNode: {
//         type: 'circle',
//         size: [100],
//         color: '#5B8FF9',
//         style: {
//             fill: '#9EC9FF',
//             lineWidth: 3,
//         },
//         labelCfg: {
//             style: {
//                 fill: '#fff',
//                 fontSize: 20,
//             },
//         },
//     },
//     defaultEdge: {
//         style: {
//         stroke: '#e2e2e2',
//         },
//     }
// });
