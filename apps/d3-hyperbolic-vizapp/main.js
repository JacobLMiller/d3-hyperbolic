let d3Hyperbolic = require("../../src/d3_hyperbolic").default;
let erdos_renyi = require("../../src/graph_generators").erdos_renyi;
let n_nodes_m_links = require("../../src/graph_generators").n_nodes_m_links;

let debug = false;



let hyperbolicSys = new d3Hyperbolic()
  .parameters({
      projection: "hyperbolic",
      // projection: "euclidean",
      edgeThickness: 2
  })
  .renderCanvas("#render");


  if(debug){
    let n = 10

    hyperbolicSys
      .reset()
      .parameters({'projection': 'hyperbolic', 'layout': 'force','mobius': true})
      .setGraph(n_nodes_m_links(n,2*n))
      .render();
  }


document.getElementById("generate-btn").addEventListener("click", () => {
  let nInput = document.getElementById('erdos-n').value
  let pInput = document.getElementById('erdos-p').value
  let projection = document.getElementById('projections').value


  console.log(nInput);

  data = erdos_renyi(nInput,pInput)
  console.log(data);

  hyperbolicSys
    .reset()
    .parameters({'projection': 'hyperbolic', 'layout': 'force','mobius': false})
    .setGraph(data)
    .render();
});

//----------------------------------------
//Frame rate and init experiments

window.onload = function(){
  //Taken from https://www.html5rocks.com/en/tutorials/webperformance/basics/
  setTimeout(function(){
    var t = performance.timing;
    console.log(t.loadEventEnd - t.responseEnd);

    console.log("renderTime")
    const renderTime = t.domComplete - t.domLoading;
    console.log(renderTime)
    if(debug){
      write(renderTime)
    }
  }, 0);
}

function increase_draw_count(iteration){
  //hyperbolicSys.topLayer.interrupt().selectAll("*").interrupt()
  //hyperbolicSys.topLayer.call(hyperbolicSys.zoom.transform,d3.zoomIdentity)
  hyperbolicSys
    .reset()
    .parameters({'projection': projection})
    .setGraph(n_nodes_m_links(iteration*10,iteration*10*2))
    .render()
}


/*
for i in range(10,200,10):
  for j in range(10):
    call draw

*/
let start, previousTimeStamp;
let frame_count = 0;
let iteration = 1;
let ten_second_interval = 0;
let frame_rate = [iteration]
let count = 0



function step(timestamp){
  if (start === undefined){
    start = performance.now();
  }
  let t = performance.now()
  let elapsed = t - previousTimeStamp;
  let total_time = timestamp - start;
  frame_count += 1

  previousTimeStamp = t;
  if(total_time > 10000){
    start = performance.now();

    frame_rate.push(frame_count/10);
    console.log(JSON.stringify(frame_rate))
    frame_count = 0
    console.log(frame_rate)

    write()
    ten_second_interval += 1;
    if(ten_second_interval >= 30){
      iteration += 1
      ten_second_interval = 0
      frame_rate = [iteration]
      increase_draw_count(iteration)
    }


  }
  //console.log(elapsed)
  if(iteration <= 20){
    window.requestAnimationFrame(step)
  }
}

let pos_or_negative = true;


let transition = function(){
  if (pos_or_negative){
    hyperbolicSys.topLayer.transition()
      //.delay(100)
      .duration(5000)
      .call(hyperbolicSys.zoom.translateBy,600,600)
      .end().then(transition)
  }
  else{
    hyperbolicSys.topLayer.transition()
      //.delay(100)
      .duration(5000)
      .call(hyperbolicSys.zoom.translateBy,-600,-600)
      .end().then(transition)
  }
  pos_or_negative = !pos_or_negative;

}



let write = function(){

  var xmlHttp = new XMLHttpRequest();
   xmlHttp.open( "GET", "http://localhost:5000/graph_write/" + JSON.stringify(frame_rate) , true ); // false for synchronous request
   xmlHttp.send(null);
   return xmlHttp.responseText;
}

if(debug){
  setTimeout(transition, 5000)
  window.requestAnimationFrame(step);
}
