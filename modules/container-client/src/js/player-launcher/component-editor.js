function ComponentEditor(element, options, errorCallback) {

  var Launcher = require('client-launcher');
  var launcher = new Launcher(element, options, errorCallback, options.autosizeEnabled);
  var errorCodes = require('error-codes');
  var instance;

  function loadConfigPanel(componentType){
    var call = launcher.loadCall('load', function(u){
      return u.replace(':componentType', componentType);
    });

    if(!call){
      errorCallback('???');
      return;
    }

    function onReady(instance){

    }

    instance = launcher.loadInstance(call, options.queryParams, {}, onReady);
  }


  var ok = launcher.init();

  if(ok){

    loadConfigPanel(options.componentType);
    // if (options.itemId) {
    //   loadItem(options.itemId, options);
    // } else {
    //   createItem(options.componentType, function(err, result){
    //     if(err){
    //       errorCallback(errorCodes.CREATE_ITEM_FAILED(err));
    //     } else {
    //       options.itemId = result.itemId;
    //       loadItem(options.itemId, options);
    //     }
    //   });
    // }

  } else {
    return;
  }


  /**
   * Note - our external api has a universal callback that should 
   * handle an object in the following form: 
   * { error: , result: } - where error may or may not be there.
   * This function creates a callback that Msgr.js expects: function(err, data) 
   * and converts the result to {error: err, result: data}
   */
  function instanceCallbackHandler(cb){
    return function(err, data){
      if(err){
        cb({error: err});
      } else {
        cb({result: data});
      }
    };
  }

  this.showNavigation = function(show){
    instance.send('showNavigation', show);
  };

  this.previewEnabled = function(enabled){
    instance.send('previewEnabled', enabled);
  };

  this.showPane = function(pane, done){
    instance.send('showPane', pane, instanceCallbackHandler(done));
  };

  this.getData = function(done){
    instance.send('getData', instanceCallbackHandler(done));
  };

  this.showSaveButton = function(show){
    instance.send('showSaveButton', show);
  };

  this.setData = function(data, done){
    instance.send('setData', data, instanceCallbackHandler(done));
  };

  // this.save = function(done){
  //   instance.send('save', instanceCallbackHandler(done));
  // };
  
  this.remove = function() {
    if(instance){
      instance.remove();
    }
  };
}

module.exports = ComponentEditor;
