// Cubic bezier
var bezier = function(t) {
    return [
      (1-t)*(1-t)*(1-t),
      3*(1-t)*(1-t)*t,
      3*(1-t)*t*t,
      t*t*t
    ];
  }

  var bezier_derivative = function(t) {
    return [
      -3*(1-t)*(1-t),
      3*(1-t)*(1-t) - 6*(1-t)*t,
      6*(1-t)*t - 3*t*t,
      3*t*t
    ];
  }

  function cubic(basis,P,t){
    const b = basis(t);
      var result=vec2.create();
      vec2.scale(result,P[0],b[0]);
      vec2.scaleAndAdd(result,result,P[1],b[1]);
      vec2.scaleAndAdd(result,result,P[2],b[2]);
      vec2.scaleAndAdd(result,result,P[3],b[3]);
      return result;
  }

  // Composite curve
  function comp_cubic(basis, points, t, unit_scale=false){
    if (unit_scale == true){
      t *= points.length-1;
    }
    var i = Math.trunc(t)*3;
    if (i > points.length-4){
      const end = points[points.length-1];
      return vec2.fromValues(end[0],end[1]);
    }
    const P = [points[i], points[i+1], points[i+2], points[i+3]]
    return cubic(basis,P,t%1);
  }