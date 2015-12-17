describe('AssetsController', function() {

  var scope, element, rootScope, compile, timeout;

  var mockWindow = {
    confirm: function() { return true; }
  };

  beforeEach(angular.mock.module('corespring-dev-editor.controllers'));

  beforeEach(module(function($provide) {
    $provide.value('$window', mockWindow);
  }));

  function render() {
    scope = rootScope.$new();
    scope.item = {files: [{name: 'file1'}]};
    element = compile('<div ng-controller="AssetsController"></div>')(scope);
    scope = element.scope();
  }

  beforeEach(inject(function($rootScope, $compile) {
    rootScope = $rootScope;
    compile = $compile;
    render();
  }));

  describe('remove file', function() {
    it('removes file', inject(function($httpBackend) {
      $httpBackend.expect('DELETE', '').respond(200);
      scope.removeFile("file1");
      expect($httpBackend.flush).not.toThrow();
      expect(scope.item.files).toEqual([]);
    }));
  });

  describe('calculate url', function() {
    it('should return filename as url', function() {
      var url = scope.calculateUrl({name: "file1"});
      expect(url).toEqual('file1');
    });
  });

  describe('onFileUploadCompleted', function() {
    it('should emit assetUploadCompleted', function() {
      spyOn(scope, '$emit');
      scope.onFileUploadCompleted();
      expect(scope.$emit).toHaveBeenCalled();
    });
  });
});
