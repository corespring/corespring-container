describe('EditTitlePopupController', function() {

  var scope, element;
  var title = "This is the title";

  var $modalInstance = new org.corespring.mocks.editor.$modalInstance(); 

  afterEach(function() {
    $modalInstance.reset();
  });

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  beforeEach(module(function($provide) {
    $provide.value('LogFactory', function() {});
    $provide.value('$modalInstance', $modalInstance);
    $provide.value('title', title);
  }));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    element = $compile('<div ng-controller="EditTitlePopupController"></div>')(scope);
    scope = element.scope();
  }));

  describe('initialization', function() {
    it('should set title', function() {
      expect(scope.title).toEqual(title);
    });
  });

  describe('ok', function() {
    beforeEach(function() {
      scope.ok();
    });

    it('should call $modalInstance.close with title', function() {
      expect($modalInstance.close).toHaveBeenCalledWith(scope.title);
    });
  });

  describe('cancel', function() {
    beforeEach(function() {
      scope.cancel();
    });

    it("should call $modalInstance.dismiss with 'cancel'", function() {
      expect($modalInstance.dismiss).toHaveBeenCalledWith('cancel');
    });
  });

});

describe('editTitleInput', function(){

  var scope, element, keyDownHandler;

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  beforeEach(inject(function($rootScope, $compile) {
    $.fn.off = jasmine.createSpy('off').and.callFake(function(){
      return this;
    });
    $.fn.on = jasmine.createSpy('on').and.callFake(function(t, handler){
      keyDownHandler = handler;
      return this;
    });

    element = '<input class="edit-title-input" ready="ready" type="text"/>';
    scope = $rootScope.$new();
    scope.ready = false;
    $compile(element)(scope);
  }));

  describe('initialization', function(){

    it('has selectTitle function', function(){
      expect(scope.selectTitle).not.toBe(null);
    });
  });

  describe('ready', function(){
    it('calls selectTitle', function(){
      spyOn(scope, 'selectTitle');
      scope.ready = true;
      scope.$digest();
      expect(scope.selectTitle).toHaveBeenCalled();
    });
  });

  describe('keydown', function(){

    it('emits edit-title-enter-key', function(done){
      setTimeout(function(){
        var handlers = {
          on: jasmine.createSpy('on'),
          preventDefault: jasmine.createSpy('preventDefault')
        };

        scope.$on('edit-title-enter-key', handlers.on);
        scope.$digest();
        keyDownHandler({keyCode: 13, preventDefault: handlers.preventDefault});
        expect(handlers.on).toHaveBeenCalled();
        expect(handlers.preventDefault).toHaveBeenCalled();
        done();
      }, 400);
    }); 

  });
});