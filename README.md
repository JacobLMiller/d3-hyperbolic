<!-- [![npm version]()]() -->

# D3-Hyperbolic

Hyperbolic geometry library with [d3.js](https://d3js.org/).

## Prerequisites

This project can be used with or without NodeJS. If used with Node, the version is version 8 or later.

[Node](http://nodejs.org/) and [NPM](https://npmjs.org/) are really easy to install. To make sure you have them available on your machine, try running the following command and if a version is printed out or not.

```sh
$ npm -v && node -v
```

You can install nodejs from [here](https://nodejs.org/en/download/).

## Table of contents

- [](#)
  - [Prerequisites](#prerequisites)
  - [Table of contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API](#api)
  - [Contributing](#contributing)
  - [Credits](#credits)
  - [Authors](#authors)
  - [License](#license)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. We will begin with the installation of this npm package and create a graph visualization webpage using it. 

## Installation

**BEFORE YOU INSTALL:** please read the [prerequisites](#prerequisites)

**Note:** This package hasn't been pushed to npm registry yet, we will do that soon after finalizing to a proper version. For this, we will just clone the repo and install it locally. Later you can install it from npm directly as below:

```sh
# Does not work now. Will update soon!
$ npm install -S d3-hyperbolic
```

For now start with cloning this repo on your local machine:

```sh
$ git clone https://github.com/Mickey253/d3-hyperbolic.git
$ cd d3-hyperbolic
$ npm install # to install all dependencies
```

Now you can look at the web-apps for using this package as a library. The main file you are looking for is [main.js](./apps/d3-hyperbolic-vizapp/main.js) in the apps' directory.

As this is npm front-end package written with ES2016 standard js, you will need to transpile it and use that code. You can use browserify to do that. For this tutorial, we will use [parcel](https://parceljs.org/) for it's ease of usage.

We already provided [npm-scripts](https://docs.npmjs.com/cli/v8/using-npm/scripts) inside this repo to run a server for the demonstration apps. Just run the below command in the project root directory to host the app in your local machine at port 1234.

```sh
npm run app-hyperbolic
```

## Usage

The usage can be easily understood by going through the [tutorial](). 

Instantiate instance of class by using `new d3-Hyperbolic()`.

Parameters such as projection can be set using
```js
hyperbolicSys.parameters({
    projection: "hyperbolic"
});
```

Give your class instance an svg to draw on by using
```js
hyperbolicSys.renderCanvas("#mySvgId");
```

We can presently handle graphs as JSON objects, for instance a simple two node connected graph with a few attributes:
```js
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
```js
data = erdos_renyi(20,0.5);
```

Make sure to pass your data to the class instance by
```js
hyperbolicSys.setGraph(data);
```


Finally,
```js
hyperbolicSys.render()
```
will automatically layout your data on an svg and provide panning and zooming functionality. More features incoming.

The boilerplate code to visualize a graph is given below:

```js
let d3Hyperbolic = require("d3_hyperbolic").default; // Default for old ES style exports.
let hyperbolicSys = new d3Hyperbolic()
  .parameters({
      projection: "hyperbolic", // Or use 'euclidean'
  })
  .renderCanvas("#render");

let data = {
  nodes: [
    {id:1},{id:2},{id:3},{id:4},{id:5}
  ],
  edges: [
    {source:1,target:2},{source:1,target:3},{source:2,target:3},{source:2,target:4},{source:4,target:5},{source:3,target:5}
  ]
}
// Or use a random graph
// data = erdos_renyi(50,0.2)
// Or the library allows us to read a graphviz Dot file
// let dotStr = `digraph D {
//   A [shape=diamond]
//   B [shape=box]
//   C [shape=circle]
//   A -> B [style=dashed, color=grey]
//   A -> C [color="black:invis:black"]
//   B -> C [penwidth=5, arrowhead=none]
// }`
// hyperbolicSys.setGraphFromDot(dotStr);

// Finally we set the graph as default graph to visualize and render in the svg
hyperbolicSys.setGraph(data).render();
```

For creating more advanced graph visualization in hyperbolic space or fine tuning the space parameters, you can use the functions from[hyperbolic_functions.js](./src/hyperbolic_functions.js) for different purposes.

## API

For API reference, please refer to the [documentation page]().

## Contributing

Simple as below.

1.  Fork it!
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Add your changes: `git add .`
4.  Commit your changes: `git commit -am 'Add some feature'`
5.  Push to the branch: `git push origin my-new-feature`
6.  Submit a pull request :sunglasses:

## Credits

Thanks to [Professor Katherine E. Isaacs](https://hdc.cs.arizona.edu/people/kisaacs/) for guiding us for building this library.

## Authors

* **Jacob Miller** - [@Mickey253](https://github.com/Mickey253)
* **Rahat Zaman** - [@rahatzamancse](https://github.com/rahatzamancse)

## License

GPL3 License