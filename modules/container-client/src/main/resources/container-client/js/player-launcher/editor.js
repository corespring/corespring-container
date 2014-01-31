var EditorDefinition = function(element, options, errorCallback){

  var errors = require("player-errors");
  var launcherErrors = require("launcher-errors");

  if(launcherErrors.hasErrors){
    for(var i = 0; i < launcherErrors.errors.length; i++){
      errorCallback( errors.EXTERNAL_ERROR(launcherErrors.errors[i]) );
    }
    return;
  };

  var definition = this;

  var isReady = false;

  var defaultOptions = require("default-options");

  options = $.extend(defaultOptions, options);
  
  var validateOptions = function (options) {
    return [];
  };

  var result = validateOptions(options);

  if (result.length > 0) {
    for (var i = 0; i < result.length; i++) {
      errorCallback(result[i]);
    }
    return;
  }

  var instance = require("player-instance")(element, options);

  errorCallback = errorCallback || function (error) {
    throw "error occurred, code: " + error.code + ", message: " + error.message;
  };

  instance.addListener("launch-error", function(data){
    var error = errors.EXTERNAL_ERROR(data.code + ": " + data.detailedMessage);
    errorCallback(error);
  });

};

module.exports = new EditorDefinition();




