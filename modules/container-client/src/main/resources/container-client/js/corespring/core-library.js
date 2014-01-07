(function(root){

  //# Library 
  //A simple library to aid in the use of the common js module pattern.
  var Library = function(){

    var modules = { };
 
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