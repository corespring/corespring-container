describe('editor launcher', function () {

  var errors = corespring.require("errors");

  var EditorDefinition;
  var defaultOptions;
  var originalDefaultOptions;
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
    originalDefaultOptions = _.cloneDeep(defaultOptions);
    defaultOptions.corespringUrl = "http://blah.com";
    defaultOptions.paths = {};
    originalInstance = corespring.require("instance");
    mockInstance = corespring.module("instance", MockInstance);
    launchErrors = corespring.module("launcher-errors", new MockErrors());
    EditorDefinition = corespring.require("editor");
    warnings = [];
    origWarn = window.console.warn;
    window.console.warn = function (msg) {
      warnings.push(msg);
    };
  });

  afterEach(function () {
    corespring.module("instance", originalInstance);
    corespring.module("default-options").exports = originalDefaultOptions;
    window.console.warn = origWarn;

  });

  function create(options, playerErrors, queryParams) {

    corespring.module("launcher-errors", playerErrors || new MockErrors());
    corespring.module("query-params", queryParams || {});

    lastError = null;

    //$("body").append("<div id='blah'></div>")
    var editor = new EditorDefinition("dummy-element", options, function (err) {
      lastError = err;
    });

    return editor;
  }

  it('should invoke error callback if there are launcher-errors', function () {
    var editor = create({}, new MockErrors(["error one"]));

    expect(lastError.code).toEqual(errors.EXTERNAL_ERROR("error one").code);
    expect(lastError.message).toEqual(errors.EXTERNAL_ERROR("error one").message);
  });

  it('should invoke error callback if options does not contain paths object', function () {
    delete defaultOptions.paths;
    var editor = create({});
    expect(lastError.code).toEqual(errors.EXTERNAL_ERROR("create not part of options").code);
    expect(lastError.message).toEqual(errors.EXTERNAL_ERROR("create not part of options").message);
  });

  describe("create item", function(){

    it('should create item if options does not have itemId', function () {
      defaultOptions.paths.create = {url: "/expected-create-url", method: 'expected-method'};

      var actualAjaxOptions = null;
      $.ajax = function (ajaxOptions) {
        actualAjaxOptions = ajaxOptions;
      }

      var editor = create({});
      expect(lastError).toBe(null);
      expect(actualAjaxOptions.type).toEqual('expected-method');
      expect(actualAjaxOptions.url).toEqual('http://blah.com/expected-create-url');
      expect(actualAjaxOptions.data).toEqual({
        corespringUrl: 'http://blah.com',
        paths: {create: {url: '/expected-create-url', method: 'expected-method'}}
      });
      expect(actualAjaxOptions.success).not.toBe(null);
      expect(actualAjaxOptions.error).not.toBe(null);
      expect(actualAjaxOptions.dataType).toEqual('json');
    });

    it('should pass query params', function () {
      defaultOptions.paths.create = {url: "/expected-create-url", method: 'expected-method'};

      var actualAjaxOptions = null;
      $.ajax = function (ajaxOptions) {
        actualAjaxOptions = ajaxOptions;
      };

      var editor = create({}, null, {apiClient:123});
      expect(actualAjaxOptions.url).toEqual('http://blah.com/expected-create-url?apiClient=123');
    });

    it("should invoke error callback if options.path does not contain 'create'", function(){
      defaultOptions.paths = {};
      var editor = create({});
      expect(lastError.code).toEqual(errors.EXTERNAL_ERROR("create not part of options").code);
      expect(lastError.message).toEqual(errors.EXTERNAL_ERROR("create not part of options").message);
    });

  });

  describe("load item", function(){

    it('should create instance (which loads item) if options has itemId', function () {
      defaultOptions.paths.editor = {url: "/expected-editor-url", method: 'expected-method'};

      var editor = create({itemId:'expected-item-id'});
      expect(lastError).toBe(null);
      expect(instanceCalls.length).toEqual(1);
      var call = instanceCalls.pop();
      expect(call.options.url).toEqual('http://blah.com/expected-editor-url');
    });

    it('should pass queryParams in options', function () {
      defaultOptions.paths.editor = {url: "/expected-editor-url", method: 'expected-method'};

      var editor = create({itemId:'expected-item-id'}, null, {apiClient:123});
      var call = instanceCalls.pop();
      expect(call.options.queryParams).toEqual({apiClient:123});
    });


    it("should invoke error callback if options.path does not contain 'editor'", function(){
      defaultOptions.paths = {};
      var editor = create({itemId:'expected-item-id'});
      expect(lastError.code).toEqual(errors.EXTERNAL_ERROR("editor not part of options").code);
      expect(lastError.message).toEqual(errors.EXTERNAL_ERROR("editor not part of options").message);
    });

  });

});