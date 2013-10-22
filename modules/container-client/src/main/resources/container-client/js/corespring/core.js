(function(root){

  var Server = function(){

    var logic = {};

    this.registerLogic = function(componentType, logic){
      logic[componentType] = logic;
    }

  };

  var CorespringCore = function(){



    this.server = new Server();
  };

  if( !root.corespring) {
    root.corespring = new CorespringCore();
  }

})(window);