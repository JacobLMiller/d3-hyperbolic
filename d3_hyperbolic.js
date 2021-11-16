var poindisk = {
  boundbox: null,
  cx: null,
  cy: null,
  r: null,
  center: {
    x: null,
    y: null
  }
}

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
      if (key === "projection") {
        assert(
          value.toLowerCase() === "hyperbolic" || value.toLowerCase() === "euclidean",
          'Must be "hyperbolic" or "euclidean"'
        );
        this.projection = value;
      }
      else if (key === "edgeThickness") {
        this.edgeThickness = value;
      }
      else {
        assert(false, `The parameter ${key} is undefined`);
      }
    }
  }

  renderCanvas(elementQuery) {
    // elementQuery must select a single empty div
    let element = document.querySelector(elementQuery);
    assert(element.childNodes.length == 0, "Given rendering element must be empty");
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
    let svgHeight = this.selectedElement.clientHeight;
    let svgWidth = this.selectedElement.clientWidth;
    var margin = { top: 10, right: 30, bottom: 30, left: 40 },
      width = svgWidth - margin.left - margin.right,
      height = svgHeight - margin.top - margin.bottom;

    let projection = this.projection;
    let vertices = this.graph.nodes;
    let edges = this.graph.edges;

    // append the svg object to the body of the page
    var svg = d3.select(this.selectedElement)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    let bottomLayer = svg.append('g')
      .attr("class", "bottomlayer");
    let topLayer = svg.append('g')
      .attr("class", "toplayer");

    // Initialize the links
    var link = topLayer
      .selectAll("path")
      .data(edges, d => String(d.source)+d.target)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr('fill', 'none')
    //.style("stroke", "#aaa");

    // Initialize the nodes
    var node = topLayer
      .selectAll("circle")
      .data(vertices, d => d.id)
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("class", "node")
      .style("fill", "#69b3a2");



    if (projection === 'euclidean') {
      // Zoom functionality
      let zoom = d3.zoom()
        .scaleExtent([.5, 3])
        //.translateExtent([[-50,-50],[svgWidth+50,svgHeight+50]])
        .extent([[margin.right, margin.right], [svgWidth - margin.right, margin.top - svgHeight]])
        .on("zoom", event => {
          node.attr('transform', event.transform);
          link.attr('transform', event.transform);
        });

      let view = svg.append('rect')
        .attr('x', margin.left)
        .attr('y', margin.top)
        .attr('width', width - margin.right - margin.left)
        .attr('height', height - margin.bottom - margin.top)
        .style('fill', 'lightgrey')
        .style('stroke', 'black')
        .call(zoom);

      // Let's list the force we wanna apply on the network
      var simulation = d3.forceSimulation(this.graph.nodes)                 // Force algorithm is applied to data.nodes
        .force("link", d3.forceLink()                               // This force provides links between nodes
          .id(function (d) { return d.id; })                     // This provide  the id of a node
          .links(edges, d => String(d.source)+d.target)                                    // and this the list of links
        )
        .force("charge", d3.forceManyBody().strength(-400))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
        .force("center", d3.forceCenter(poindisk.cx, poindisk.cy))     // This force attracts nodes to the center of the svg area
        .on("end", ticked);
    }
    else if (projection === 'hyperbolic') {
      // Our poindisk
      poindisk.boundbox = this.selectedElement.getBoundingClientRect();
      poindisk.cx = (poindisk.boundbox.right - poindisk.boundbox.left) / 2;
      poindisk.cy = (poindisk.boundbox.bottom - poindisk.boundbox.top) / 2;
      poindisk.r = Math.min(poindisk.cx, poindisk.cy);
      poindisk.center = { x: poindisk.cx, y: poindisk.cy }

      bottomLayer.append('circle')
        .attr('cx', poindisk.cx)
        .attr('cy', poindisk.cy)
        .attr('r', poindisk.r)
        .style('fill', 'lightgrey')
        .style('stroke', 'black')


      // Let's list the force we wanna apply on the network
      d3.forceSimulation(vertices)                 // Force algorithm is applied to data.nodes
        .force("link", d3.forceLink()                               // This force provides links between nodes
          .id(function (d) { return d.id; })                     // This provide  the id of a node
          .links(edges, d => String(d.source)+d.target)                                    // and this the list of links
        )
        .force("charge", d3.forceManyBody().strength(-400))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
        .force("center", d3.forceCenter(poindisk.cx, poindisk.cy))     // This force attracts nodes to the center of the svg area
        .on("end", ticked);


      // This function is run at each iteration of the force algorithm, updating the nodes position.
      function ticked() {
        let centerX = 0;
        let centerY = 0;
        for (let i = 0; i < vertices.length; i++) {
          centerX += vertices[i].x;
          centerY += vertices[i].y;
        }
        centerX = centerX / vertices.length;
        centerY = centerY / vertices.length;

        //Set vertices position in the poincare disk.
        for (let i = 0; i < vertices.length; i++) {
          to_poincare(vertices[i], centerX, centerY, poindisk, true)
        }
        //Calculate geodesic arc between vertices in edge set
        for (let i = 0; i < edges.length; i++) {
          edges[i].arc = poincare_geodesic(edges[i].source.center, edges[i].target.center, poindisk)
        }

        link
          .attr('d', d => arc_path(d.arc));

        node
          .attr("cx", d => d.circle.cx)
          .attr("cy", d => d.circle.cy)
          .attr('r', d => d.circle.r);
      }

    }
  }
}
