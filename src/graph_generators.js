/**
 * @file This file has a list of random graph generators.
 */
/**
 * This module is a collection of random graph generative algorithms.
 * @module graph_generators
 */

import {strict as assert} from 'assert';
import * as d3 from "d3";

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

/**
 * Generates an undirected graph on n nodes, using a geometric random scheme. Each node is assigned an x and y value, and
 * connected with an edge if they are within some radius r.
 * @param {number} n - The number of nodes.
 * @param {number} r - The radius of connection, analagous to probability.
 * @param {number} bb - The bounding box of the embedded nodes.
 * @returns Graph - The graph created randomly.
 */
let geometric = function(n,r,bb = 1){
  let norm = function(p,q){return Math.sqrt(Math.pow(p.x-q.x,2)+Math.pow(p.y-q.y,2))};

  let nodes = new Array(n);
  for(let i = 0; i<n; i++){
    nodes[i] = {'id': i, "x": Math.random()* bb, "y": Math.random()*bb}
  }
  let edges = [];
  for (let i = 0; i < n; i ++){
    for (let j = 0; j<i; j++){
      if(norm(nodes[i],nodes[j])<r){
        edges.push({'source': i, 'target': j})
      }
    }
  }

  return {'nodes': nodes, 'edges': edges}
}
exports.geometric = geometric;

/**
 * Generates an undirected graph on n nodes with m edges chosen uniformly at random. Elegant code taken from http://bl.ocks.org/erkal/9746513
 * @param {number} n - The number of nodes.
 * @param {number} m - The number of edges
 * @returns Graph - The graph created randomly.
 */
let n_nodes_m_links = function(n,m){
  let randomChoose = function(s, k) { // returns a random k element subset of s
    var a = [], i = -1, j;
    while (++i < k) {
      j = Math.floor(Math.random() * s.length);
      a.push(s.splice(j, 1)[0]);
    };
    return a;
  }

  let unorderedPairs = function (s) { // returns the list of all unordered pairs from s
    var i = -1, a = [], j;
    while (++i < s.length) {
      j = i;
      while (++j < s.length) a.push([s[i],s[j]])
    };
    return a;
  }

  let nodes = d3.range(n).map(function(d){return {'id': d}}),
      list  = randomChoose(unorderedPairs(d3.range(n)), m),
      links = list.map(function (a) { return {source: a[0], target: a[1]} });
  return {'nodes': nodes, 'edges': links}
}
exports.n_nodes_m_links = n_nodes_m_links;
