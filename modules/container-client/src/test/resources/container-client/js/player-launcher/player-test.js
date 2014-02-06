describe('player launcher', function(){

  var errors = corespring.require("errors");

  var launcher = null;

  var MockInstance = function(){

    this.isComplete = false;

    this.sendMessage = function(props){
      if(props.message == "isComplete"){
        props.callback(true);
      }
    };

    this.addListener = function(name, cb){
      if(name == "ready"){
        cb();
      }
    };
    return this;
  };

  var MockErrors = {
    hasErrors: false,
    errors : []
  };

  var mockInstance = null;  
  var originalInstance = null;
  var lastError = null;

  var defaultOptions = corespring.module("default-options").exports;
  defaultOptions.corespringUrl = "http://blah.com";

  beforeEach(function(){
    originalInstance = corespring.require("instance");
    mockInstance = corespring.module("instance", MockInstance);
    launchErrors = corespring.module("launcher-errors", MockErrors);
    launcher = corespring.require("player");
  });

  afterEach(function(){
    corespring.module("player-instance", originalInstance);
  });

  var create = function(options, secureMode, playerErrors){

    corespring.module("launcher-errors", playerErrors || MockErrors);
    
    secureMode = secureMode !== undefined ? secureMode : true; 
    lastError = null;

    for(var x in options){
      defaultOptions[x] = options[x];
    }

    var Player = launcher.define(secureMode);
    
    //$("body").append("<div id='blah'></div>") 
    var player = new Player("blah", {}, function(err){ 
      lastError = err;
    });

    return player;
  };

  it('should invoke error callback if there are launcher-errors', function(){
    var player = create({mode:null}, false, { hasErrors: true, errors: ["error one"]});
    expect(lastError.code).toEqual(errors.EXTERNAL_ERROR("error one").code);
    expect(lastError.message).toEqual(errors.EXTERNAL_ERROR("error one").message);
  });

  it('should invoke error callback with invalid mode', function(){
    var player = create({mode:null});
    expect(lastError.code).toEqual(errors.INVALID_MODE.code);
  });


  it('should invoke error callback when mode is gather and there is no itemId', function(){
    var player = create({mode:"gather", itemId: null});
    expect(lastError.code).toEqual(errors.NO_ITEM_ID.code);
  });

  it('should construct', function(){
    var player = create( { mode: "gather", itemId : "1", paths: {} } );
    expect(player).toNotBe(null);
    expect(lastError).toBe(null);
  });

  it('should invoke error callback when changing mode from view => gather and sesion is complete', function(){
    var player = create({sessionId: "1", mode: "view", paths: {} });
    mockInstance.isComplete = true;
    player.setMode("gather");
    expect(lastError.code).toEqual(errors.NOT_ALLOWED.code);
  });

});