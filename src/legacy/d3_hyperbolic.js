/**
 * @file This is the main file where hyperbolic and euclidean visualization is done with the class d3Hyperbolic. 
 */


/**
 * Reads the graph from graphviz dot format string and returns it.
 * @param {string} dotfile The dot format string to read from.
 * @returns {Graph} - A graph object.
 */
let readDot = dotfile => {
  let absGraph = parse(dotfile);
  let items = absGraph[0].children;
  console.log(items);
  let graph = { nodes: [], edges: [] };
  for(let i = 0; i < items.length; i++) { 
    if(items[i].type === 'node_stmt') {
      let node = { id: items[i].node_id.id };
      for(let j = 0; j < items[i].attr_list.length; j++) {
        node[items[i].attr_list[j].id] = items[i].attr_list[j].eq;
      }
      graph.nodes.push(node);
    }
    else if(items[i].type === 'edge_stmt') {
      let edge = {
        source: items[i].edge_list[0].id,
        target: items[i].edge_list[1].id
      };
      for(let j = 0; j < items[i].attr_list.length; j++) {
        edge[items[i].attr_list[j].id] = items[i].attr_list[j].eq;
      }
      graph.edges.push(edge);
    }
  }
  console.log(graph);

  return graph;
}

let assert = {
  equal: (val1, val2, message="") => {
    if(val1 !== val2) {
      throw message;
    }
  }
}

/**
 * The coordinate system transformation from canvas to poincare disk.
 * @param {NodeObject} p - The node of a graph with defined `x` and `y` in poincare disk. 
 * @param {PoinDisk} poindisk - The poindisk object to use.
 * @returns {{x: number, y: number}} - The new position in the canvas of poindisk.
 */
function canvas_to_disk(p, poindisk){
  let rect = poindisk.boundbox;
  let x = ((p.x - rect.left)/(rect.right-rect.left)-0.5)*2;
  let y = ((p.y - rect.top)/(rect.bottom-rect.top)-0.5)*-2;

  return {'x': x, 'y': y};
  // if (x*x+y*y < 1.0){
  //   return {'x': x, 'y': y}
  // }else{
  //   // console.log("Something went wrong, probably rounding error")
  //   // Still gracefully returning the value
  //   return {'x': x, 'y': y}
  // }
}

function to_poincare(ePosition, centerX, centerY, poindisk, inPlace = true) {
  //ePosition: position of node on canvas
  //centerX,centerY: geometric mean of data
  //Returns a circle object with it's appropriate cx,cy, and r for the poincare projection

  //0.005 is a hyperparameter, but seems to work well.
  let x = 0.005 * (ePosition.x - centerX);
  let y = 0.005 * (ePosition.y - centerY);

  let circleR = Math.hypot(x, y);
  let theta = Math.atan2(x, y);

  //hR performs inverse lamber projection
  let hR = Math.acosh((0.5 * circleR * circleR) + 1);
  //Poincare projection
  let poincareR = Math.tanh(hR / 2);

  //Polar to cartesian coordinates
  let poinx = poindisk.r + poindisk.r * (poincareR * Math.sin(theta));
  let poiny = poindisk.r + poindisk.r * (poincareR * Math.cos(theta));

  if (inPlace) {
    ePosition.center = { 'x': poinx, 'y': poiny }
    ePosition.circle = poincare_circle(canvas_to_disk(ePosition.center, poindisk), 0.05, poindisk)
  }
  return {
    center: { 'x': poinx, 'y': poiny },
    //Find circle with hyperbolic radius 0.05 at center
    circle: poincare_circle(canvas_to_disk({x: poinx, y: poiny}, poindisk), 0.05, poindisk)
  }
}

/**
 * 
 */
function disk_to_canvas(p, poindisk){
  let x = p.x*poindisk.r + poindisk.cx;
  let y = -p.y*poindisk.r + poindisk.cy;
  return {'x': x, 'y': y};
}

function polar_to_cart(r,theta,center={'x':0,'y':0}){
  return{'x': center.x + (r*Math.cos(theta)), 'y': center.y + (r*Math.sin(theta))};
}

function cart_to_polar(p){
  let r = Math.sqrt(p.x*p.x+p.y*p.y);
  let theta = Math.atan2(p.y,p.x);
  return {'r': r, "theta": theta};
}

//Distances
function euclid_dist(p,q){
  return Math.sqrt(Math.pow(p.x-q.x,2) + Math.pow(p.y-q.y,2));
}

function hyper_dist(p,q){
  let pow = Math.pow;
  let numerator = 2*(pow(p.x-q.x,2)+pow(p.y-q.y,2));
  let denominator = ((1- pow(p.x,2) + pow(p.y,2)) * (1- pow(q.x,2) + pow(q.y,2)));

  return Math.acosh(1 + (numerator/denominator));
}

function r_poincare_to_euclid(r){
  return Math.tanh(r/2);
}

function hyper_radius_from_euclidean(r){
  return 2*Math.atanh(r)
}

//Euclidean lines
function euclid_line(p,q){
  //Todo: make this more robust to error
  let line =  {'a': p.y-q.y,
          'b': q.x - p.x,
          'c': p.x*q.y - q.x*p.y};
  if (Math.abs(line.b) > 0.001){
    return {'a': line.a/line.b, 'b': line.b/line.b, 'c': line.c/line.b}
  }else{
    return line
  }
}

function get_perpendicular_line(pq,v){
  //Returns a line perpendicular to pq that contains v
  return {'a': pq.b, 'b': -pq.a, 'c': -v.x * pq.b + v.y*pq.a};
}

function find_midpoint(p,q){
  //Returns the midpoint between p and q
  return {'x': (p.x + q.x) / 2, 'y': (p.y + q.y) / 2};
}

function find_intersection(pq,xy){
  //Todo: Handle parallel lines
  //Returns the point of intersection between lines pq and xy
  return {
    'x': (pq.c * xy.b - pq.b * xy.c) / (pq.b * xy.a - pq.a * xy.b),
    'y': (pq.a * xy.c - pq.c * xy.a) / (pq.b * xy.a - pq.a * xy.b)
  };
}

//Circle inversion
function circle_inversion(p,circle){
  //Inverts p about circle, returning the new point p' See link for details:
  //https://en.wikipedia.org/wiki/Inversive_geometry#Inversion_in_a_circle
  let dist = euclid_dist(p, circle.center);
  let new_c = circle.r*circle.r/(dist*dist);
  let u = {'x': (p.x - circle.center.x), 'y': (p.y - circle.center.y)};
  return {'x': new_c * u.x + circle.center.x, 'y': new_c * u.y + circle.center.y};
}

//Hyperbolic geodesic between two points in Poincare disk
function poincare_geodesic(p,q, poindisk){
  //Steps of the algorithm are as follows:
  //Find inverted points outside the unit disk
  //Grab midpoints between them.
  //Construct perpendicular lines at midpoint
  //Get intersection of perpendicular lines, C
  //C, along with p and q, fully characterize the arc.
  let left = poindisk.boundbox.left
  let top = poindisk.boundbox.top
  p = {'x': p.x-left, 'y': p.y-top}
  q = {'x': q.x-left, 'y': q.y-top}


  let pp = circle_inversion(p,poindisk);
  let qq = circle_inversion(q,poindisk);
  let M = find_midpoint(p,pp);
  let N = find_midpoint(q,qq);
  let m = get_perpendicular_line(euclid_line(p,pp),M);
  let n = get_perpendicular_line(euclid_line(q,qq),N);
  let C = find_intersection(m,n);

  return {'p1': p, 'p2': q, 'c': C,
          'startAngle': Math.atan2((q.y - C.y), q.x - C.x),
          'endAngle': Math.atan2((p.y - C.y), p.x - C.x),
          'r': euclid_dist(p,C)};
}

function arc_path(arc, poindisk){
  //Takes an arc object (generated by poincare_geodesic) and
  //return a canvas/svg path for it.
  let minAngle = Math.min(arc.startAngle, arc.endAngle);
  let maxAngle = Math.max(arc.startAngle,arc.endAngle);
  let start = polar_to_cart(arc.r,minAngle,arc.c);
  let end = polar_to_cart(arc.r,maxAngle,arc.c);
  let sweepFlag = "1";

  // Handle angle wrapping around 360
  if ((arc.c.x < poindisk.cx && arc.c.y < poindisk.cy) || (arc.c.x < poindisk.cx && arc.c.y >= poindisk.cy)) {
      sweepFlag = (minAngle < Math.PI) && (maxAngle > Math.PI) ? "0": "1";
  } else {
      sweepFlag = "1";
  }

  return ['M', start.x,start.y,
          'A', arc.r, arc.r, 0, "0", sweepFlag, end.x, end.y
        ].join(" ");

}

//Circle functions--------------------------------------------------------------

//Todo: Allow for a circle given two/three points
function poincare_circle(center,r, poindisk){
  //Return a circle in the poincare disk with center center and hyperbolic radius r
  //Math is done in terms of the Poincare disk

  let e_center_radius = Math.sqrt(center.x*center.x + center.y*center.y);
  let cr = hyper_radius_from_euclidean(e_center_radius); //Hyperbolic distance from origin

  let dh1 = cr - r;
  let dh2 = cr + r;
  let de1 = r_poincare_to_euclid(dh1);
  let de2 = r_poincare_to_euclid(dh2);
  let er = (de2-de1)/2;
  let ecr = (de2+de1)/2;

  let c_theta = Math.atan2(center.y,center.x);
  let x = ecr * Math.cos(c_theta);
  let y = ecr * Math.sin(c_theta);
  let canvas_coord = disk_to_canvas({'x':x, 'y':y},poindisk)
  //Attributes that begin with p are in terms of the poincare disk.
  return {'cx':canvas_coord.x, 'cy': canvas_coord.y, 'r': er*(poindisk.r),'px': x, 'py': y,  'center': {'x': x, 'y':y},
          'hcenter': disk_to_canvas(center,poindisk)}
}


/**
 * The main d3-hyperbolic library class for rendering.
 * @example 
let d3Hyperbolic = require("../../src/d3_hyperbolic").default;
let hyperbolicSys = new d3Hyperbolic()
  .parameters({...})
  .renderCanvas("#the-svg-element-id")
  .setGraph(graphData)
  .render();
 */
class d3Hyperbolic {

  /**
   * The main constructor of the class. Creates an instance of d3Hyperbolic and returns it.
   * @example let hyperbolicSys = new d3Hyperbolic();
   * @returns The created instance.
   */
  constructor() {
    // Initialize default parameters
    this.projection = "hyperbolic";
    this.selectedElement = null;
    this.graph = {};
  }

  /**
   * Set the parameters for for rendering and calculations. You can call this anytime throughout the code to change any parameter. 
   * @param {paramDict} paramDict - The configuration object you want to set.
   * @returns {d3Hyperbolic} `this` instance.
   */
  parameters(paramDict) {
    for (const [key, value] of Object.entries(paramDict)) {
      if (key === "projection") {
        assert.equal(
          value.toLowerCase() === "hyperbolic" || value.toLowerCase() === "euclidean", true,
          'Must be "hyperbolic" or "euclidean"'
        );
        this.projection = value;
      }
      else if (key === "edgeThickness") {
        this.edgeThickness = value;
      }
      else {
        assert.equal(false, true, `The parameter ${key} is undefined`);
      }
    }
    return this;
  }

  /**
   * Sets the element as the default rendering canvas. 
   * @param {string} elementQuery - The element to select. An id of an SVG element is required.
   * @param {margin} margin - The margin to use withing that svg element.
   * @returns `this` instance of d3Hyperbolic.
   */
  renderCanvas(elementQuery, margin=null) {
    // elementQuery must select a single empty div
    let element = document.querySelector(elementQuery);
    assert.equal(element.childNodes.length, 0, "Given rendering element must be empty");
    this.selectedElement = element;

    // set the dimensions and margins of the graph
    this.svgHeight = this.selectedElement.clientHeight;
    this.svgWidth = this.selectedElement.clientWidth;
    if (margin == null) {
      this.margin = { top: 10, right: 30, bottom: 30, left: 40 };
    }
    else {
      this.margin = margin;
    }
    this.canvasWidth = this.svgWidth - this.margin.left - this.margin.right,
    this.canvasHeight = this.svgHeight - this.margin.top - this.margin.bottom;
    return this;
  }

  /**
   * Sets the graph for rendering. 
   * @param {Graph} graph The graph object with nodes and edges list.
   * @returns `this` instance of d3Hyperbolic
   */
  setGraph(graph) {
    this.graph = graph;
    return this;
  }

  /**
   * Reads the graph from graphviz dot format string and sets it as default graph as {@link setGraph}. 
   * @param {string} dotStr The dot format string to read from.
   * @returns `this` instance of d3Hyperbolic
   */
  setGraphFromDot(dotStr) {
    this.graph = utils.readDot(dotStr);
    return this;
  }


  /**
   * Render the default graph to the default svg element.
   * @returns `this` instance of hyperbolic.
   */
  render() {
    let projection = this.projection;
    let vertices = this.graph.nodes;
    let edges = this.graph.edges;

    // append the svg object to the body of the page
    var svg = d3.select(this.selectedElement)
      .append("svg")
      .attr("width", this.canvasWidth + this.margin.left + this.margin.right)
      .attr("height", this.canvasHeight + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")");

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

    let zoom = d3.zoom()
      .scaleExtent([.5, 3]);


    if (projection === 'euclidean') {
      // Zoom functionality
      zoom.on("zoom", event => {
        node.attr('transform', event.transform);
        link.attr('transform', event.transform);
      });

      bottomLayer.append('rect')
        .attr('x', this.margin.left)
        .attr('y', this.margin.top)
        .attr('width', this.canvasWidth - this.margin.right - this.margin.left)
        .attr('height', this.canvasHeight - this.margin.bottom - this.margin.top)
        .style('fill', 'lightgrey')
        .style('stroke', 'black');
      
      // @ts-ignore
      svg.call(zoom);

      // Let's list the force we wanna apply on the network
      d3.forceSimulation(vertices)                 // Force algorithm is applied to data.nodes
        .force("link", d3.forceLink()                               // This force provides links between nodes
          // @ts-ignore
          .id(d => d.id)                     // This provide  the id of a node
          // @ts-ignore
          .links(edges, d => String(d.source)+d.target)                                    // and this the list of links
        )
        .force("charge", d3.forceManyBody().strength(-400))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
        .force("center", d3.forceCenter(this.canvasWidth / 2, this.canvasHeight / 2))     // This force attracts nodes to the center of the svg area
        .on("end", ticked => {
          link
            .attr('d', d => d3.line()([[d.source.x, d.source.y], [d.target.x, d.target.y]]));
    
          node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        });
    }
    else if (projection === 'hyperbolic') {
      let poindisk = {
        boundbox: null,
        cx: null,
        cy: null,
        r: null,
        center: {
          x: null,
          y: null
        }
      }
      poindisk.boundbox = this.selectedElement.getBoundingClientRect();
      poindisk.cx = (poindisk.boundbox.right - poindisk.boundbox.left) / 2;
      poindisk.cy = (poindisk.boundbox.bottom - poindisk.boundbox.top) / 2;
      poindisk.r = Math.min(poindisk.cx, poindisk.cy);
      poindisk.center = { x: poindisk.cx, y: poindisk.cy }

      bottomLayer.append('circle')
        .attr('cx', (poindisk.boundbox.right - poindisk.boundbox.left)/2)
        .attr('cy', (poindisk.boundbox.bottom - poindisk.boundbox.top)/2)
        .attr('r', (poindisk.boundbox.right - poindisk.boundbox.left)/2)
        .style('fill', 'lightgrey')
        .style('stroke', 'black')


      // Let's list the force we wanna apply on the network
      d3.forceSimulation(vertices)                 // Force algorithm is applied to data.nodes
        .force("link", d3.forceLink()                               // This force provides links between nodes
          // @ts-ignore
          .id(d => d.id)                     // This provide  the id of a node
          // @ts-ignore
          .links(edges, d => String(d.source)+d.target)                                    // and this the list of links
        )
        .force("charge", d3.forceManyBody().strength(-400))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
        .force("center", d3.forceCenter(poindisk.cx, poindisk.cy))     // This force attracts nodes to the center of the svg area
        // This function is run at each iteration of the force algorithm, updating the nodes position.
        .on("end", ticked => {
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
            .attr('d', d => arc_path(d.arc, poindisk));

          node
            .attr("cx", d => d.circle.cx)
            .attr("cy", d => d.circle.cy)
            .attr('r', d => d.circle.r);

          // Zoom functionality
          // This helped me a lot: https://www.freecodecamp.org/news/get-ready-to-zoom-and-pan-like-a-pro-after-reading-this-in-depth-tutorial-5d963b0a153e/
          zoom
            .on("zoom", event => {
              // Update positions of vertices
              // And Set vertices position in the poincare disk.
              for (let i = 0; i < vertices.length; i++) {
                // I know there is more efficient way to do this. Will solve this later
                // Backup the original x and y
                vertices[i].tmp = {
                  x: vertices[i].x,
                  y: vertices[i].y
                }
                vertices[i].x = vertices[i].tmp.x + event.transform.x;
                vertices[i].y = vertices[i].tmp.y + event.transform.y;
                to_poincare(vertices[i], centerX, centerY, poindisk, true)

                // Restore original position
                vertices[i].x = vertices[i].tmp.x;
                vertices[i].y = vertices[i].tmp.y;
              }
              //Calculate geodesic arc between vertices in edge set
              for (let i = 0; i < edges.length; i++) {
                edges[i].arc = poincare_geodesic(edges[i].source.center, edges[i].target.center, poindisk)
              }

              node
                .attr("cx", d => d.circle.cx)
                .attr("cy", d => d.circle.cy)
                .attr('r', d => d.circle.r);

              link
                .attr('d', d => arc_path(d.arc, poindisk));
              
            });


          // @ts-ignore
          svg.call(zoom);

        });


    }
    return this;
  }
}