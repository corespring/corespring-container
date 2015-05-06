var options = require('default-options');

module.export = function(errorCallback){

  this.loadCall = function(key){
    if (!options.paths || !options.paths[name]) {
      errorCallback({
        code: 105,
        message: name + ' not part of options'
      });
      return null;
    }
    return options.paths[name];
  };
};
