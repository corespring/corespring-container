describe('core', function () {

  var MockModule = function () {
    this.registered = {};
    this.directive = function (name, array) {
      this.registered[name] = array;
    };
  };

  var mockModule = new MockModule();
  var mockAngular = {
    module: function () {
      return mockModule;
    }
  };


  it('should allow a client component to register', function () {
    corespring.bootstrap(mockAngular);
    var exports = corespring.client.component("testComp", "testModule");
    exports.directive = ['dep', function(dep){ console.log("blah")}];
    exports.initializeComponent();
    expect(mockModule.registered["testComp"]).toEqual(exports.directive);
  });
});