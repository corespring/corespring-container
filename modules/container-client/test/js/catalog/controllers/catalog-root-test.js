describe('CatalogRoot', function () {

  var scope, controller;
  var mockLoad, mockLocation, mockTabs;

  beforeEach(angular.mock.module('corespring-catalog.controllers'));

  function MockItemService() {
    this.load = mockLoad;
  }

  function MockiFrameService() {
    this.isInIFrame = function () {
      return false;
    };
  }

  beforeEach(module(function ($provide) {
    
    mockLoad = jasmine.createSpy('load');
    mockTabs = '';
    mockLocation = {
      search: jasmine.createSpy('search').and.returnValue(mockTabs)
    };

    $provide.value('LogFactory', org.corespring.mocks.editor.LogFactory);
    $provide.value('ItemService', new MockItemService());
    $provide.value('iFrameService', new MockiFrameService());
    $provide.value('Msgr', {});
    $provide.value('$location', mockLocation);
  }));

  beforeEach(inject(function ($rootScope, $controller) {
    controller = $controller;
    scope = $rootScope.$new();
    controller('CatalogRoot', {$scope: scope});
  }));

  describe('initialization', function () {
    it('should call ItemService.load with onLoaded', function () {
      expect(mockLoad).toHaveBeenCalledWith(scope.onLoaded, scope.onUploadFailed);
    });
  });
  
  describe('tabs initialization', function(){

    function mkLocation(tabs){
      return {
        search: jasmine.createSpy('search').and.returnValue({tabs: tabs})
      };
    }

    function assertTabs(tabs, expected){
      return function(){
        controller('CatalogRoot', {$scope: scope, $location: mkLocation(tabs)});
        expect(scope.tabs).toEqual(expected);
      };
    }
    
    it('should set to profile,question,supportingMaterial', assertTabs('profile,question,supportingMaterial', {profile: true, question:true, supportingMaterial: true}));
    it('should set to profile,question', assertTabs('profile,question', {profile: true, question:true}));
    it('should set to question', assertTabs('question', {question:true}));
    it('should set to profile', assertTabs('profile', {profile:true}));
    it('should set to supportindMaterial', assertTabs('supportingMaterial', {supportingMaterial:true}));
    it('should set to empty to profile,question,supportingMaterial', assertTabs(null, {profile: true, question:true, supportingMaterial: true}));
  }); 

  describe('onLoaded', function () {

    var item = {
      components: {
        a: {componentType: 'one'},
        b: {componentType: 'two'}
      }
    };

    var logic, server;

    beforeEach(function () {
      server = corespring.server;
      logic = {
        preprocess: jasmine.createSpy('preprocess').and.callFake(function(i){
          return i;
        })
      };
      corespring.server = {
        logic: jasmine.createSpy('logic').and.returnValue(logic)
      };
      scope.onLoaded(item);
    });

    afterEach(function () {
      corespring.server = server;
    });

    it('should set item on scope', function () {
      expect(scope.item).toEqual(item);
    });

    it('should call preprocess for the components in item', function () {
      expect(logic.preprocess).toHaveBeenCalledWith(scope.item.components.a);
      expect(logic.preprocess).toHaveBeenCalledWith(scope.item.components.b);
    });

  });

});