function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

class d3Hyperbolic {
  constructor() {
    // Initialize default parameters
    this.projection = "hyperbolic";
    this.selectedElement = null;
    this.graph = {};
  }

  parameters(paramDict) {
    for (const [key, value] of Object.entries(paramDict)) {
      if(key === "projection") {
        assert(
          value.toLowerCase() === "hyperbolic" || value.toLowerCase() === "euclidean",
          'Must be "hyperbolic" or "euclidean"'
        );
        this.projection = value;
      }
      else if(key === "") {
        // TODO: stub
      }
      else {
        assert(false, `The parameter ${key} is undefined`);
      }
    }
  }

  renderCanvas(elementQuery) {
    // elementQuery must select a single empty div
    // TODO: add assertion
    let element = document.querySelector(elementQuery);
    this.selectedElement = element;
  }

  static readDot(dotfile) {
    // Read the file as string first, then

    // I could not make DotParser work. Need help
    let graph = DotParser.parse(`digraph D {
        A -> {B, C, D} -> {F}
      }
    `);
    console.log(graph);
    return graph;
  }

  setGraph(graph) {
    this.graph = graph;
  }

  render() {
    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 30, left: 40 },
      width = 400 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select(this.selectedElement)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // Initialize the links
    var link = svg
      .selectAll("line")
      .data(this.graph.edges)
      .enter()
      .append("line")
      .style("stroke", "#aaa");

    // Initialize the nodes
    var node = svg
      .selectAll("circle")
      .data(this.graph.nodes)
      .enter()
      .append("circle")
      .attr("r", 20)
      .style("fill", "#69b3a2");

    // Let's list the force we wanna apply on the network
    var simulation = d3.forceSimulation(this.graph.nodes)                 // Force algorithm is applied to data.nodes
      .force("link", d3.forceLink()                               // This force provides links between nodes
        .id(function (d) { return d.id; })                     // This provide  the id of a node
        .links(this.graph.edges)                                    // and this the list of links
      )
      .force("charge", d3.forceManyBody().strength(-400))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
      .force("center", d3.forceCenter(width / 2, height / 2))     // This force attracts nodes to the center of the svg area
      .on("end", ticked);

    // This function is run at each iteration of the force algorithm, updating the nodes position.
    function ticked() {
      link
        .attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });

      node
        .attr("cx", function (d) { return d.x + 6; })
        .attr("cy", function (d) { return d.y - 6; });
    }
  }
}

