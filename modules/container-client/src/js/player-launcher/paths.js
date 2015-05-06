
module.exports = function(errorCallback){

  var options = require('default-options');

  this.corespringUrl = options.corespringUrl;
  
  this.loadCall = function(key){
    if (!options.paths || !options.paths[key]) {
      errorCallback({
        code: 105,
        message: key + ' not part of options'
      });
      return null;
    }
    return options.paths[key];
  };
};
