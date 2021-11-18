let d3Hyperbolic = require("../../src/d3_hyperbolic").default;

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
//data = erdos_renyi(50,0.2)

hyperbolicSys.setGraph(data);

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

hyperbolicSys.render();

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
