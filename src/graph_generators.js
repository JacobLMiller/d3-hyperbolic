/**
 * @file This file has a list of random graph generators.
 */

import {strict as assert} from 'assert';

/**
 * Generates an undirected graph on n nodes, with each edge having probability p to appear
 * @param {number} n - The number of nodes.
 * @param {number} p - The probability of two nodes being connected. Can be imagined as the density parameter of the graph. 
 * @returns Graph - The graph created randomly.
 */
let erdos_renyi = function(n,p){
  assert.equal(n > 0 || p <= 1 || p >= 0, true, "n must be a positvie int, p must be between 0 and 1");
  let nodes = new Array(n);
  for (let i = 0; i < n; i ++){
    nodes[i] = {'id': i}
  }
  let edges = [];
  for (let i = 0; i < n; i ++){
    for (let j = 0; j<i; j++){
      if (Math.random() < p){
        edges.push({'source': i, 'target': j})
      }
    }
  }

 return {'nodes': nodes, 'edges': edges}
}

exports.erdos_renyi = erdos_renyi;