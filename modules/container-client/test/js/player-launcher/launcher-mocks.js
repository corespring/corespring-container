window.org = window.org || {};
org.corespring = org.corespring || {};
org.corespring.mocks = org.corespring.mocks || {};
org.corespring.mocks.launcher = org.corespring.mocks.launcher || {};

org.corespring.mocks.launcher.MockInstance = function(){
		this.css = jasmine.createSpy('css');

    this.width = jasmine.createSpy('width');

    this.send = jasmine.createSpy('send');
};

org.corespring.mocks.launcher.MockLauncher = function(mockInstance){

  return function(){

    this.isReady = true;

    this.init = jasmine.createSpy('init').and.returnValue(true);

    this.loadInstance = jasmine.createSpy('loadInstance').and.returnValue(
      mockInstance);

    this.loadCall = jasmine.createSpy('loadCall').and.callFake(function(url,processor) {
      return {
        method: 'GET',
        url: url
      };
    });

    this.mkInstance = jasmine.createSpy('mkInstance').and.callFake(function() {
      return mockInstance;
    });

    this.prepareUrl = jasmine.createSpy('prepareUrl').and.callFake(function() {
      return Array.prototype.join.call(arguments, '-');
    });

    this.log = function() {};
  };
};
