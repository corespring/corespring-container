describe('designer controller', function(){

  var rootScope, ctrl;

  function mockModal(){

  }

  function mockDesignerService(){

    var item = {};

    var availableComponents = [];

    this.loadItem = function(id, callback){
      callback(item);
    };

    this.loadAvailableComponents = function(onSuccess, onError){
      onSuccess(availableComponents);
    };
  }

  function mockProfileService(){
    var profile = {};
    this.load = function(id, onSuccess){
      onSuccess(profile);
    };
  }

  function mockDataQueryService(){}
  
  function mockComponentRegister(){}

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  beforeEach(function () {
    module(function ($provide) {
      $provide.value('ProfileService', new mockProfileService());
      $provide.value('DataQueryService', new mockDataQueryService());
      /*
      $provide.value('$modal', new mockModal());
      $provide.value('MathJaxService', new mockMathJaxService());
      $provide.value('ComponentRegister', new mockComponentRegister());
      */
    });
  });

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    try {
      ctrl = $controller('Profile', {$scope: scope});
    } catch (e) {
      throw("Error with the controller: " + e);
    }
  }));

  it('should init', function(){
    expect(ctrl).toNotBe(null);
  });

  it('should handle subject queries', function(){

    var queryResult;

    var query = {
      term: "blah",
      callback: function(success){
        queryResult = success.results;
      }
    };
    
    ctrl.primarySubjectAsync.query(query);
    expect(queryResult).toNotBe(null); 
  });



});

