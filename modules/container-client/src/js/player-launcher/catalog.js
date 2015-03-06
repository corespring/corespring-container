function CatalogDefinition(element, options, errorCallback) {

  var isReady = false;
  var errors = require("errors");
  var logger = options.logger || require('logger');

  errorCallback = errorCallback || function (error) {
    throw "error occurred, code: " + error.code + ", message: " + error.message;
  };

  function hasLauncherErrors() {
    var launcherErrors = require("launcher-errors");
    if (launcherErrors.hasErrors()) {
      for (var i = 0; i < launcherErrors.errors.length; i++) {
        errorCallback(errors.EXTERNAL_ERROR(launcherErrors.errors[i]));
      }
      return true;
    }
    return false;
  }

  if (hasLauncherErrors()) {
    return;
  }

  function hasInvalidOptions() {
    var defaultOptions = require("default-options");
    options = $.extend(defaultOptions, options);

    function validateOptions(options) {
      return [];
    }

    var result = validateOptions(options);

    if (result.length > 0) {
      for (var i = 0; i < result.length; i++) {
        errorCallback(result[i]);
      }
      return true;
    }
    return false;
  }

  if (hasInvalidOptions()) {
    return;
  }


  var InstanceDef = require("instance");

  function loadPaths(options, name) {
    if (!options.paths || !options.paths[name]) {
      errorCallback({
        code: 105,
        message: name + " not part of options"
      });
      return null;
    }
    return options.paths[name];
  }

  function loadItem(itemId, options) {
    var loadCall = loadPaths(options, "catalog");
    if (!loadCall) {
      return;
    }

    options.url = (options.corespringUrl + loadCall.url).replace(":itemId", itemId);
    options.queryParams = require('query-params');

    var tabs = [];
    for (var k in options.tabs) {
      if (options.tabs[k]) {
        tabs.push(k);
      }
    }

    options.hash = "?tabs="+tabs.join(',');

    var instance = new InstanceDef(element, options, errorCallback, logger);

    instance.on("launch-error", function (data) {
      var error = errors.EXTERNAL_ERROR(data.code + ": " + data.detailedMessage);
      errorCallback(error);
    });

    instance.on('ready', function() {
      if (isReady) {
        instance.removeChannel();
        errorCallback(errors.EDITOR_NOT_REMOVED);
      } else {
        isReady = true;
        instance.send('initialise', options);
      }
    });
  }

  if (options.itemId) {
    loadItem(options.itemId, options);
  }
}

module.exports = CatalogDefinition;
