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
});
