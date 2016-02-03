function ComponentEditor(element, options, errorCallback) {

  var Launcher = require('client-launcher');
  var launcher = new Launcher(element, options, errorCallback, options.autosizeEnabled);
  var errorCodes = require('error-codes');
  var instance;

  function loadConfigPanel(componentType){
    var call = launcher.loadCall('standaloneEditor', function(u){
      return u.replace(':componentType', componentType);
    });

    if(!call){
      errorCallback('???');
      return;
    }

    function onReady(instance){
      // console.log('onReady...', instance); 
    }

    var initialData = {
      activePane: options.activePane || 'config',
      showNavigation: options.showNavigation === true || false,
      componentModel: options.data,
      xhtml: options.markup,
      uploadUrl: options.uploadUrl
    };

    instance = launcher.loadInstance(call, options.queryParams, initialData, onReady);
  }

  var ok = launcher.init(function(){
    if(options.uploadUrl && options.uploadUrl.indexOf(':filename') === -1){
      return [{code: 333, msg: 'url must have :filename'}];
    } else {
      return [];
    }
  });

  if(ok){
    loadConfigPanel(options.componentType);
  } else {
    return;
  }

  var instanceCallbackHandler = require('callback-utils').instanceCallbackHandler; 

  this.showNavigation = function(show){
    instance.send('showNavigation', show);
  };

  this.showPane = function(pane, done){
    instance.send('showPane', pane, instanceCallbackHandler(done));
  };

  this.getData = function(done){
    instance.send('getData', instanceCallbackHandler(done));
  };

  this.setData = function(data, done){
    instance.send('setData', data, instanceCallbackHandler(done));
  };

  this.remove = function() {
    if(instance){
      instance.remove();
    }
  };
}

module.exports = ComponentEditor;
