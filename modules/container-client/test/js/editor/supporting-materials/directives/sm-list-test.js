describe('sm-list', function() {

  var rootScope, compileFn, controllerFn, smUtils, EVENTS;

  beforeEach(angular.mock.module('corespring-editor.directives'));

  beforeEach(module(function($provide) {

    smUtils = {
      group: jasmine.createSpy('group').and.returnValue([])
    };

    $provide.value('LogFactory', new org.corespring.mocks.editor.LogFactory());
    $provide.value('SmUtils', smUtils);
    $provide.value('$timeout', function(fn) {
      fn();
    });
  }));

  beforeEach(inject(function($rootScope, $compile, $controller, SM_LIST_EVENTS) {
    rootScope = $rootScope;
    controllerFn = $controller;
    compileFn = $compile;
    EVENTS = SM_LIST_EVENTS;
  }));


  describe('list directive', function() {

    var scope;

    function render(scp) {
      scp = scp || rootScope.$new();
      var node = ['<div sm-list=""',
        '  group-by="materialType"',
        '  delete-item="deleteMaterial"',
        '  choose-item="chooseMaterial"',
        '  selected-item="selectedMaterial"',
        '  ng-model="item.supportingMaterials"></div>'
      ].join('');
      element = angular.element(node);
      compileFn(element)(scp);
      scp.$digest();
      scope = element.isolateScope();
    }

    beforeEach(inject(function($rootScope, $compile, SM_LIST_EVENTS) {
      render();
    }));

    describe('initialization', function() {

      it('inits sections', function() {
        expect(scope.sections.length).toEqual(0);
      });
    });

    describe('$watch(selectedItem)', function() {

      beforeEach(function() {
        spyOn(scope, '$broadcast');
      });

      it('broadcasts itemSelected', function() {
        scope.selectedItem = {};
        scope.$digest();
        expect(scope.$broadcast).toHaveBeenCalledWith(EVENTS.ITEM_SELECTED, {});
      });
    });

    describe('watch only name and type', function() {

      beforeEach(function() {
        scope.ngModel = [{
          name: 'a',
          materialType: 't'
        }];
        scope.$digest();
        smUtils.group.calls.reset();
      });

      it('only update if name or type changes', function() {
        scope.ngModel[0].blah = 'blah';
        scope.$digest();
        expect(smUtils.group).not.toHaveBeenCalled();
      });

      it('only update if name or type changes', function() {
        scope.ngModel[0].name = 'new name';
        scope.$digest();
        expect(smUtils.group).toHaveBeenCalled();
      });
    });
  });


  describe('sm-list-controller', function() {

    var controller, scope;

    beforeEach(function() {
      scope = rootScope.$new();
      spyOn(scope, '$broadcast');
      scope.chooseItem = jasmine.createSpy('chooseItem').and.returnValue(function() {});
      scope.deleteItem = jasmine.createSpy('deleteItem').and.returnValue(function() {});
      controller = controllerFn('SmListController', {
        $scope: scope
      });
    });

    describe('initialization', function() {
      it('inits', function() {
        expect(controller).not.toBe(null);
        expect(controller.chooseItem).not.toBe(null);
      });
    });

    describe('chooseItem', function() {
      beforeEach(function() {
        controller.chooseItem({});
      });

      it('calls scope.chooseItem', function() {
        expect(scope.chooseItem).toHaveBeenCalled();
      });

      it('broadcasts itemSelected', function() {
        expect(scope.$broadcast).toHaveBeenCalledWith('itemSelected', jasmine.any(Object));
      });
    });

    describe('deleteItem', function() {
      var deleteDone;
      beforeEach(function() {
        scope.deleteItem.and.returnValue(function(item, done) {
          deleteDone = done;
        });
        scope.ngModel = [{
          name: 'one'
        }, {
          name: 'two'
        }];
        scope.$digest();
        spyOn(controller, 'chooseItem').and.callThrough();
        controller.deleteItem(scope.ngModel[0]);
        scope.ngModel.shift(); //mimic deletion
        deleteDone();
      });

      it('calls scope.deleteItem', function() {
        expect(scope.deleteItem).toHaveBeenCalled();
      });

      it('calls the callback which calls chooseItem', function() {
        expect(controller.chooseItem).toHaveBeenCalledWith({
          name: 'two'
        });
      });
    });
  });

  describe('smItem', function() {

    var controller;

    beforeEach(function() {

      controller = {
        deleteItem: jasmine.createSpy('deleteItem'),
        chooseItem: jasmine.createSpy('chooseItem')
      };

      element = angular.element('<ul class="fake"><li sm-item ng-model="item"></li></ul>');
      element.data('$smListController', controller);
      scope = rootScope.$new();
      scope.item = {
        name: 'my-item'
      };

      element = compileFn(element)(scope);
      scope.$digest();
      scope = element.find('[sm-item]').isolateScope();
    });

    describe('initialization', function() {
      it('inits', function() {
        expect(scope).not.toBe(null);
      });
    });

    describe('$on(ITEM_SELECTED)', function(){

      it('deselects item', function(){
        scope.$broadcast(EVENTS.ITEM_SELECTED, {name: 'item'});
        scope.$digest();
        expect(scope.selected).toBe(false);
      });
      
      it('selects item', function(){

        expect(scope.selected).toBe(undefined);
        scope.$broadcast(EVENTS.ITEM_SELECTED, scope.ngModel); 
        scope.$digest();
        expect(scope.selected).toBe(true);
      });
    });

    describe('deleteItem', function() {
      it('calls controller.deleteItem', function() {
        scope.deleteItem({});
        expect(controller.deleteItem).toHaveBeenCalledWith({
          name: 'my-item'
        });
      });
    });

    describe('chooseItem', function() {

      it('calls controller.chooseItem', function() {
        scope.chooseItem({});
        expect(controller.chooseItem).toHaveBeenCalledWith({
          name: 'my-item'
        });
      });
    });


  });

});