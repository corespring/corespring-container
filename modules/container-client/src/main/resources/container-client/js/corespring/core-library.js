(function(root){

  //# Library 
  //A simple library to aid in the use of the common js module pattern.
  var Library = function(){

<<<<<<< Updated upstream
    var modules = { };
 
=======
    //TODO: Move out of Library
    var modules = {};
    /*var modules = {
      lodash: { exports: _ },
      underscore: { exports: _},
      sax: { exports:  sax }
    };*/

    this.initialize = function(m){
      for(var x in m){
        modules[x] = m[x];
      }
    };

>>>>>>> Stashed changes
    this.require = function(uid){

      if(!uid){
        throw new Error("you must specify a uid");
      }

      if(modules[uid]){
        return modules[uid].exports;
      } else {
        throw new Error("can't find library : " + uid);
      }
    };

    this.module = function(uid, obj){
      
      if(!uid){
        throw new Error("you must specify a uid");
      }

      if(obj){
        modules[uid] = { exports: obj };
      } else {
        modules[uid] = modules[uid] || { exports: {} };
      }
      return modules[uid];
    };
  };

  if(!root.corespring) {
    root.corespring = {};
  }
  
  var lib = new Library();
  root.corespring.module = lib.module;
  root.corespring.require = lib.require;
  
})(this);