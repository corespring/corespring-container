describe('player launcher', function(){

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

  it('should invoke error callback with invalid mode', function(){
    defaultOptions.mode = null;
    var Player = launcher.define(true);
    var lastError = null;
    
    var player = new Player("blah", {}, function(err){ 
      lastError = err;
    });

    expect(lastError.code).toEqual(101);
  });


  it('should construct', function(){
    defaultOptions.mode = "gather";
    defaultOptions.itemId = "1";
    var definition = launcher.define(true);
    var player = new definition("blah", {}, function(err){
      console.error(err);
     });
    expect(player).toNotBe(null);
  });

  it('should return errors', function(){
    var definition = launcher.define(true);
    defaultOptions.sessionId = "1";
    defaultOptions.mode = "view";

    var lastError = null;

    var player = new definition("blah", {}, function(err){
      console.error(err);
      lastError = err;
    });

    mockInstance.isComplete = true;
    player.setMode("gather");
    expect(lastError.code).toEqual(104);
  });

});