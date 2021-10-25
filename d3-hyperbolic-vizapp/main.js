let hyperbolicSys = new d3Hyperbolic();

hyperbolicSys.parameters({
    projection: "euclidean"
});

hyperbolicSys.renderCanvas("#render");

let data = {
    nodes: [
        {
            id: 1,
            name: "a",
            attr: "value",
            color: "red",
            label: "label",
        },
        {
            id: 2,
            name: "b",
            attr: "value"
        }
    ],
    edges: [
      {
        source : 1,
        target: 2,
        weight: 2,
      }
    ]
}

hyperbolicSys.setGraph(data);
// Or the library allows us to read a graphviz Dot file
// hyperbolicSys.setGraph(d3Hyperbolic.readDot("dot/file/address.dot"));

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
