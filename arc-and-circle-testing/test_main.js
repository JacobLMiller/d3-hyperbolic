let poindisk = {
  'cx': null,
  'cy': null,
  'r': null
}

let svg = d3.select('#render');
console.log(svg)

let svgHeight = svg.node().getBoundingClientRect().height;
poindisk.cx = svgHeight/2;
poindisk.cy = svgHeight/2;
poindisk.r = svgHeight/2;
poindisk.center = {'x': poindisk.cx, 'y': poindisk.cy}

let bottomlayer = svg.append('g');
let toplayer = svg.append('g');

let disk = bottomlayer.append('circle')
  .attr('cx', poindisk.cx)
  .attr('cy', poindisk.cy)
  .attr('r', poindisk.r)
  .style('fill','lightgrey')
  .style('stroke','black')


let p = {'x': 0, 'y': 0.86}
let q = {'x': -.62, 'y': 0}

p = disk_to_canvas(p,poindisk)
q = disk_to_canvas(q,poindisk)

let circles = [p,q]
let mycircles = toplayer.selectAll('.circles')
  .data(circles)
  .join(
    enter => enter.append('circle')
    .attr('class', 'circles')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', 10)
    .style('fill','blue')
    .style('stroke','black')
)

let myline = poincare_geodesic(p,q,poindisk)
console.log(myline)
let mylinepath = arc_path(myline)
console.log(mylinepath)
let data = [myline]

let mylines = toplayer.selectAll('.lines')
  .data(data)
  .join(
    enter => enter.append("path")
    .attr('class', 'lines')
    .style('fill', 'none')
    .style('stroke', 'black')
    .attr('d', d => arc_path(d))
  );
