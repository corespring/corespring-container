describe('player launcher', function(){

  var errors = corespring.require("player-errors");

  var launcher = null;

  var MockInstance = function(){
    this.isComplete = false;

    this.make = function(){
      return this;
    };

    this.sendMessage = function(props){
      if(props.message == "isComplete"){
        props.callback(true);
      }
    };
  };

  var mockInstance = corespring.library("player-instance", new MockInstance());

  var defaultOptions = corespring.library("defaultOptions");

  beforeEach(function(){
    var mockInstance = corespring.library("player-instance");

    launcher = corespring.require("new-external-player");
  });

  var lastError = null;

  var create = function(options, secureMode){
    
    secureMode = secureMode !== undefined ? secureMode : true; 
    lastError = null;

    for(var x in options){
      defaultOptions[x] = options[x];
    }

    var Player = launcher.define(true);
    
    var player = new Player("blah", {}, function(err){ 
      lastError = err;
    });

    return player;
  };

  it('should invoke error callback with invalid mode', function(){
    var player = create({mode:null});
    expect(lastError.code).toEqual(errors.INVALID_MODE.code);
  });


  it('should invoke error callback when mode is gather and there is no itemId', function(){
    var player = create({mode:"gather", itemId: null});
    expect(lastError.code).toEqual(errors.NO_ITEM_ID.code);
  });

  it('should construct', function(){
    var player = create( { mode: "gather", itemId : "1" } );
    expect(player).toNotBe(null);
    expect(lastError).toBe(null);
  });

  it('should invoke error callback when changing mode from view => gather and sesion is complete', function(){
    var player = create({sessionId: "1", mode: "view"});
    mockInstance.isComplete = true;
    player.setMode("gather");
    expect(lastError.code).toEqual(errors.NOT_ALLOWED.code);
  });

});