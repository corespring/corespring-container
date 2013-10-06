window.require = function(p) {
  switch(p){
    case "underscore" : return _;
    case "lodash" : return _;
    default : throw "Unknown dependency: " + p
  }
}
