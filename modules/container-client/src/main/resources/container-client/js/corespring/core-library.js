(function(root){

  var Library = function(){

    var libraries = {
      lodash: _,
      underscore: _
    };

    this.require = function(uid){

      if(!uid){
        throw new Error("you must specify a uid");
      }

      if(libraries[uid]){
        return libraries[uid];
      } else {
        throw new Error("can't find library : " + uid);
      }
    };

    this.library = function(uid, obj){

      if(!uid){
        throw new Error("you must specify a uid");
      }

      if(obj){
        libraries[uid] = obj;
      } else {
        libraries[uid] = libraries[uid] || {};
      }
      return libraries[uid];
    };
  };

  if(!root.corespring) {
    root.corespring = {};
  }
  
  var lib = new Library();
  root.corespring.library = lib.library;
  root.corespring.require = lib.require;
  
})(this);