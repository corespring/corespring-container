describe('root level listener', function(){


  it('should clear any listeners', function(){
    var listenerOne = corespring.require("root-level-listener").init();

    var receivedEvents = [];

    var addReceivedEventsListener = function(){
      listenerOne.addListener(function(e){
        receivedEvents.push(e);
      });
    };

    runs( function(){
      addReceivedEventsListener();
      window.postMessage("{ message: \"blah\" }", "*");
    });

    waits(100);

    runs( function(){
      expect(receivedEvents.length).toBe(1);
      listenerOne.clearListeners();
      addReceivedEventsListener();
      receivedEvents = [];
      window.postMessage("{ message: \"blah\" }", "*");
    });

    waits(100);

    runs( function(){
      expect(receivedEvents.length).toBe(1);
    });

  });

  it('should remove listeners', function(){
    var listener = corespring.require("root-level-listener").init();
    listener.clearListeners();
    var cb = function(){};
    listener.addListener(cb);
    listener.removeListener(cb);
    expect(listener.listenerLength()).toBe(0);
  });


  it('should remove listeners that remove themselves using the "this" keyword', function(){

    var listener = corespring.require("root-level-listener").init();
    runs( function(){
      listener.clearListeners();
      var cb = function(){
        listener.removeListener(this);
      };
      listener.addListener(cb);
      window.postMessage("{ message: \"blah\" }", "*");
    });

    waits(100);

    runs( function(){
      expect(listener.listenerLength()).toBe(0);
    });

  });
});
