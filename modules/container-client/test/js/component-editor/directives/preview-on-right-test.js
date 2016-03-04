describe('component-editor PreviewOnRight', function(){

  beforeEach(angular.mock.module('corespring-singleComponentEditor.directives'));

  var scope, element;

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    element = $compile('<div preview-on-right="" preview-width="200"></div>')(scope);
    $rootScope.$digest();
  }));


  describe('initialization', function(){
    it('sets showPreview', function(){
      expect(scope.showPreview).toBe(true);
    });
    it('sets width', function(){
      expect(element.width()).toEqual(870);
    });
  });

  describe('$on(\'showPreview\')', function(){

    it('sets showPreview to false', function(){
      scope.$broadcast('showPreview', false);
      expect(scope.showPreview).toBe(false);
    });
    
    it('updates showPreview', function(){
      scope.showPreview = false;
      scope.$broadcast('showPreview', true);
      expect(scope.showPreview).toBe(true);
    });
  });

});