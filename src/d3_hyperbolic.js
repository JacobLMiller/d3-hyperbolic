import * as d3 from "d3";
import * as utils from "./utils.js";
import { strict as assert } from "assert";
import {to_poincare, poincare_geodesic, arc_path} from "./hyperbolic_functions";

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

export default d3Hyperbolic;