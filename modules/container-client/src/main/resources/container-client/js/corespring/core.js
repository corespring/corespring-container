/*
exports.process = function(x,y,z){

}

//Wrapped like so:
(function(exports, require){

})(corespring.server.logic(compType), corespring.require)
*/

(function(root){

  var Server = function(){

    var logic = {};

    this.logic = function(componentType){
      logic[componentType] = {};
      return logic[componentType];
    }

  };

  var CorespringCore = function(){



    this.server = new Server();
  };

  if( !root.corespring) {
    root.corespring = new CorespringCore();
  }

})(window);