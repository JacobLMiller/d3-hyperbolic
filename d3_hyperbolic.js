let poindisk = {
  'cx': null,
  'cy': null,
  'r': null
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

    poindisk.boundbox = this.selectedElement.getBoundingClientRect();
    console.log(poindisk.boundbox)
    poindisk.cx = (poindisk.boundbox.right -poindisk.boundbox.left)/2 ;
    poindisk.cy = (poindisk.boundbox.bottom - poindisk.boundbox.top)/2;
    poindisk.center = {'x': poindisk.cx, 'y': poindisk.cy}
    poindisk.r = this.selectedElement.clientHeight/2;
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

    // Zoom functionality
    let zoom = d3.zoom()
      .scaleExtent([.5, 3])
      //.translateExtent([[-50,-50],[svgWidth+50,svgHeight+50]])
      .extent([[margin.right, margin.right], [svgWidth-margin.right, margin.top-svgHeight]])
      .on("zoom", translate_and_zoom);

    if (projection === 'euclidean'){
      let view = svg.append('rect')
        .attr('x', margin.left)
        .attr('y', margin.top)
        .attr('width', width-margin.right-margin.left)
        .attr('height', height-margin.bottom-margin.top)
        .style('fill','lightgrey')
        .style('stroke','black')
        .call(zoom);
      }
    else if (projection === 'hyperbolic'){
      let view = svg.append('circle')
        .attr('cx', width/2)
        .attr('cy', width/2)
        .attr('r', width/2)
        .style('fill','lightgrey')
        .style('stroke','black')
        .call(zoom);
    }

    // Initialize the links
    var link = svg
      .selectAll("path")
      .data(this.graph.edges)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr('fill', 'none')
      //.style("stroke", "#aaa");

    // Initialize the nodes
    var node = svg
      .selectAll("circle")
      .data(this.graph.nodes, d => d)
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("class","node")
      .style("fill", "#69b3a2");

    // Let's list the force we wanna apply on the network
    var simulation = d3.forceSimulation(this.graph.nodes)                 // Force algorithm is applied to data.nodes
      .force("link", d3.forceLink()                               // This force provides links between nodes
        .id(function (d) { return d.id; })                     // This provide  the id of a node
        .links(this.graph.edges)                                    // and this the list of links
      )
      .force("charge", d3.forceManyBody().strength(-400))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
      .force("center", d3.forceCenter(poindisk.cx, poindisk.cy))     // This force attracts nodes to the center of the svg area
      .on("end", ticked);


    // This function is run at each iteration of the force algorithm, updating the nodes position.
    function ticked() {
      if (projection === 'euclidean'){
        link
          .attr("x1", function (d) { return d.source.x; })
          .attr("y1", function (d) { return d.source.y; })
          .attr("x2", function (d) { return d.target.x; })
          .attr("y2", function (d) { return d.target.y; });

        node
          .attr("cx", function (d) { return d.x; })
          .attr("cy", function (d) { return d.y; });
      }
      else if(projection === 'hyperbolic'){
        let centerX = 0;
        let centerY = 0;
        for (let i = 0; i< vertices.length; i++){
          centerX += vertices[i].x;
          centerY += vertices[i].y;
        }
        centerX = centerX/vertices.length;
        centerY = centerY/vertices.length;

        //Set vertices position in the poincare disk.
        for (let i = 0; i < vertices.length; i ++){
          console.log(vertices[i])
          to_poincare(vertices[i],centerX,centerY)
        }
        //Calculate geodesic arc between vertices in edge set
        for (let i = 0; i < edges.length; i ++){
          edges[i].arc = poincare_geodesic(edges[i].source.center,edges[i].target.center,poindisk)
        }

        link
          .attr('d', d => arc_path(d.arc));

        node
          .attr("cx", d => d.circle.cx)
          .attr("cy", d => d.circle.cy)
          .attr('r', d => d.circle.r);
      }
    }

  function to_poincare(ePosition,centerX,centerY){
    //ePosition: position of node on canvas
    //centerX,centerY: geometric mean of data
    //Returns a circle object with it's appropriate cx,cy, and r for the poincare projection

    //0.005 is a hyperparameter, but seems to work well.
    let x = 0.005*(ePosition.x-centerX);
    let y = 0.005*(ePosition.y-centerY);

    //Find position in terms of poincare disk.
    let circleX = ((x-margin.left)/((svgWidth-margin.right)-margin.left)-0.5)*2;
    let circleY = ((y-margin.top)/((svgWidth-margin.bottom)-margin.top)-0.5)*-2;


    let circleR = Math.hypot(x,y);
    let theta = Math.atan2(x,y);

    //hR performs inverse lamber projection
    let hR = Math.acosh((0.5*circleR*circleR)+1);
    //Poincare projection
    let poincareR = Math.tanh(hR/2);

    //Polar to cartesian coordinates
    let poinx = poindisk.r+poindisk.r*(poincareR*Math.sin(theta));
    let poiny = poindisk.r+poindisk.r*(poincareR*Math.cos(theta));

    ePosition.center = {'x': poinx, 'y': poiny}
    console.log(ePosition.center)
    //Find circle with hyperbolic radius 0.05 at center
    ePosition.circle = poincare_circle(canvas_to_disk(ePosition.center,poindisk),0.05)

  }

   function translate_and_zoom(event){
     node.attr('transform',event.transform);
     link.attr('transform',event.transform);
   }
  }
}
