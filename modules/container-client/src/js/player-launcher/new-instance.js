var Instance = function(call, params, element, errorCallback, log) {
  log.info('new instance');
  log.info(arguments);

  var readyHandler;

  this.on = function(){

  };

  this.onReady = function(cb){
    readyHandler = cb;
  };

  this.ready = function(){
    if(readyHandler){
      readyHandler();
    } else {
      this.send('initialise');
    }
  };

  /** load the iframe */
  this.load = function(){

    log.info('load the iframe...');

  };
};

module.exports = Instance;
