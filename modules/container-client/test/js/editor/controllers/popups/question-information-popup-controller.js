describe('QuestionInformationPopupController', function() {

  var scope, element;

  var supportingMaterials = ['hey', 'these', 'are', 'supporting', 'materials'];
  var item = {'some': 'kind', 'of': 'item', supportingMaterials: supportingMaterials};
  var materialsByGroups = ['materials', 'by', 'groups!'];

  var SupportingMaterialsService = {
    getSupportingMaterialsByGroups: jasmine.createSpy('getSupportingMaterialsByGroups')
      .and.returnValue(materialsByGroups)
  };

  afterEach(function() {
    SupportingMaterialsService.getSupportingMaterialsByGroups.calls.reset();
  });

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  beforeEach(module(function($provide) {
    $provide.value('LogFactory', function() {});
    $provide.value('$modal', function() {});
    $provide.value('SupportingMaterialsService', SupportingMaterialsService);
    $provide.value('item', item);
  }));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    element = $compile('<div ng-controller="QuestionInformationPopupController"></div>')(scope);
    scope = element.scope();
  }));

  describe('initialization', function() {
    it('should set item', function() {
      expect(scope.item).toEqual(item);
    });

    it("should set activeTab to 'question'", function() {
      expect(scope.activeTab).toEqual('question');
    });

    it("should set playerMode to 'gather'", function() {
      expect(scope.playerMode).toEqual('gather');
    });

    it("should set supportingMaterials to result of SupportingMaterialsService.getSupportingMaterialsByGroups", function() {
      expect(SupportingMaterials.getSupportingMaterialsByGroups.toHaveBeenCalledWith(item.supportingMaterials));
      expect(scope.supportingMaterials).toEqual(materialsByGroups);
    });

  });

});
