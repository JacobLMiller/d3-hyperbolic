# d3-hyperbolic
Hyperbolic geometry library for d3.js.

Instantiate instance of class by using `new d3-Hyperbolic()`.

Parameters such as projection can be set using
```
d3-Hyperbolic.parameters({
    projection: "euclidean"
});
```

Give your class instance an svg to draw on by using
```
d3-Hyperbolic.renderCanvas("#mySvgId");
```

We can presently handle graphs as JSON objects, for instance a simple two node connected graph with a few attributes:
```
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
};
```
All vertices should have a unique id value.

If you don't have any data to work with yet, try a random graph.
```
data = erdos_renyi(20,0.5);
```

Make sure to pass your data to the class instance by
```
d3-Hyperbolic.setGraph(data);
```


Finally,
```
d3-Hyperbolic.render()
```
will automatically layout your data on an svg and provide panning and zooming functionality. More features incoming.
