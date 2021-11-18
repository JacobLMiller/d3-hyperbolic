/**
 * @file This file contains all the javascript Object type definitions used throughout the library.
 */
/**
 * @typedef {Object} NodeObject - A single node object. It can have many properties, but it must have a property named `id`.
 * @property {Object} id - The unique id for the node. Must be unique throughout all graphs used in {d3Hyperbolic} instance.
 */
/**
 * @typedef {Object} EdgeObject - A single edge object connecting 2 nodes in a graph. It can have many properties, but it must have two properties source and target.
 * @property {Object} source - The source node of the edge.
 * @property {Object} target - The target node of the edge.
 */

/**
 * @typedef {Object} Graph
 * @property {Array<NodeObject>} nodes - The list of nodes in this graph.
 * @property {Array<EdgeObject>} edges - The list of edges in this graph.
 */
/**
 * @typedef {Object} paramDict
 * @property {('hyperbolic' | 'euclidean')} projection - The projection space to use.
 * @property {number} edgeThickness - The thickness of the edges in the graph.
 */
/**
 * @typedef {Object} margin
 * @property {number} top - The top margin.
 * @property {number} bottom - The bottom margin.
 * @property {number} left - The left margin.
 * @property {number} right - The right margin.
 */

/**
 * @typedef {Object} PoinDisk - The Poincare disk specification for visualization.
 * @property {{left: number, right: number, top: number, bottom: number}} boundbox - The bounding box of the disk. Of format {left, right, top, bottom} all being integer.
 * @property {number} cx - The center x position of the disk.
 * @property {number} cy - The center y position of the disk.
 * @property {number} r - The radius of the disk.
 * @property {Object} center - For compatibility. Same as {cx, cy}. 
 */