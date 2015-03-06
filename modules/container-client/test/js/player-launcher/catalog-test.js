describe('catalog launcher', function () {

  var errors = corespring.require("errors");

  var CatalogDefinition;
  var defaultOptions;
  var instanceCalls;
  var lastError;
  var launchErrors;
  var mockInstance;
  var originalInstance;
  var origWarn;
  var warnings;


  function MockInstance(element, options, errorCallback, logger) {
    instanceCalls.push({instance: this, element: element, options: options, errorCallback: errorCallback, log: logger});

    this.on = function(name, cb) {
      if (name == "ready") {
        cb();
      }
    };

    this.send = function() {
    };
  }


  function MockErrors(errs) {
    this.errors = errs;
    this.hasErrors = function () {
      return this.errors && this.errors.length > 0;
    };
  }

  beforeEach(function () {
    instanceCalls = [];
    lastError = null;
    defaultOptions = corespring.module("default-options").exports;
    defaultOptions.corespringUrl = "http://blah.com";
    defaultOptions.paths = {};
    originalInstance = corespring.require("instance");
    mockInstance = corespring.module("instance", MockInstance);
    launchErrors = corespring.module("launcher-errors", new MockErrors());
    CatalogDefinition = corespring.require("catalog");
    warnings = [];
    origWarn = window.console.warn;
    window.console.warn = function (msg) {
      warnings.push(msg);
    };
  });

  afterEach(function () {
    corespring.module("instance", originalInstance);
    window.console.warn = origWarn;
  });

  function create(options, playerErrors, queryParams) {

    corespring.module("launcher-errors", playerErrors || new MockErrors());
    corespring.module("query-params", queryParams || {});

    lastError = null;

    var catalog = new CatalogDefinition("dummy-element", options, function (err) {
      lastError = err;
    });

    return catalog;
  }

  it('should invoke error callback if there are launcher-errors', function () {
    create({}, new MockErrors(["error one"]));

    expect(lastError.code).toEqual(errors.EXTERNAL_ERROR("error one").code);
    expect(lastError.message).toEqual(errors.EXTERNAL_ERROR("error one").message);
  });

  describe("load item", function(){

    it('should create instance (which loads item) if options has itemId', function () {
      defaultOptions.paths.catalog = {url: "/expected-catalog-url", method: 'expected-method'};

      create({itemId:'expected-item-id'});
      expect(lastError).toBe(null);
      expect(instanceCalls.length).toEqual(1);
      var call = instanceCalls.pop();
      expect(call.options.url).toEqual('http://blah.com/expected-catalog-url');
    });

    it('should pass queryParams in options', function () {
      defaultOptions.paths.catalog = {url: "/expected-catalog-url", method: 'expected-method'};

      create({itemId:'expected-item-id'}, null, {apiClient:123});
      var call = instanceCalls.pop();
      expect(call.options.queryParams).toEqual({apiClient:123});
    });


    it("should invoke error callback if options.path does not contain 'catalog'", function(){
      defaultOptions.paths = {};
      create({});
      expect(lastError.code).toEqual(errors.EXTERNAL_ERROR("catalog not part of options").code);
      expect(lastError.message).toEqual(errors.EXTERNAL_ERROR("catalog not part of options").message);
    });

  });

});