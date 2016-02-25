window.org = window.org || {};
org.corespring = org.corespring || {};
org.corespring.mocks = org.corespring.mocks || {};
org.corespring.mocks.launcher = org.corespring.mocks.launcher || {};

org.corespring.mocks.launcher.MockInstance = function(){

  var onHandlers = {};

  this.constructorArgs = Array.prototype.slice.call(arguments);

	this.css = jasmine.createSpy('css');

  this.width = jasmine.createSpy('width');

  this.send = jasmine.createSpy('send');
  
  this.on = jasmine.createSpy('on').and.callFake(function(t, handler){
    onHandlers[t] = handler;
  });

  this.removeChannel = jasmine.createSpy('removeChannel');

  this.trigger = function(t){
    var handler = onHandlers[t];
    if(handler){
      console.log('trigger: ', t);
      handler.bind(this)(this);
    }
  };
};

org.corespring.mocks.launcher.MockLauncher = function(mockInstance){

  return function(){

    this.isReady = true;

    this.init = jasmine.createSpy('init').and.returnValue(true);

    this.loadInstance = jasmine.createSpy('loadInstance').and.callFake(function(call, queryParams, initialData, onReady){
      if(onReady){ 
        onReady(mockInstance); 
      }
      return mockInstance;
    });

    this.loadCall = jasmine.createSpy('loadCall').and.callFake(function(url,processor) {
      return {
        method: 'GET',
        url: url
      };
    });

    this.mkInstance = jasmine.createSpy('mkInstance').and.callFake(function() {
      return mockInstance;
    });

    this.prepareUrl = jasmine.createSpy('prepareUrl').and.callFake(function(url,params) {
      if(params){
        return url + '?params=' + JSON.stringify(params);
      } else {
        return url;
      }
    });


    this.log = function() {};
  };
};
