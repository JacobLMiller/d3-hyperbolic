let erdos_renyi = function(n,p){
  /*
  Generates an undirected graph on n nodes, with each edge having probability p to appear
  */
  assert(typeof n === 'int' || n > 0 || p <= 1 || p >= 0, "n must be a positvie int, p must be between 0 and 1");
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
