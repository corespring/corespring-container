(function(root){

  //# Library 
  //A simple library to aid in the use of the common js module pattern.
  var Library = function(){

    var modules = {};

    this.initialize = function(m){
      for(var x in m){
        modules[x] = m[x];
      }
    };

    this.require = function(uid){

      if(!uid){
        throw new Error("you must specify a uid");
      }

      if(modules[uid]){
        return modules[uid].exports;
      } else {
        var names = "";
        for(var i in modules){
            names += i + ", ";
        }
        throw new Error("can't find library : " + uid + " in modules: " + names);
      }
    };

    this.module = function(uid, obj){
      //console.log("module -> " + uid + ": " + obj);
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