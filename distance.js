//We can probably define these functions as global variables
let sinh = Math.sinh;
let cosh = Math.cosh;
let acosh = Math.acosh;
let cos = Math.cos;

function hyperbolic_distance(p,q){
  return acosh(cosh(p.radius)*cosh(q.radius) - sinh(p.radius)*sinh(q.radius)*cos(q.theta-p.theta));
}
