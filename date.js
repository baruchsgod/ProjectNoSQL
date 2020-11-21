exports.getDate = function(to_format){
  var fecha = new Date(to_format);
  var options = {year:'numeric',month:'long',day:'numeric'}
  return fecha.toLocaleDateString("en-US",options);
}
