describe('supportingmetadata', function() {

  var scope, rootScope, compile;

  var supportingMaterialsService, imageUtils;

  beforeEach(angular.mock.module('corespring-templates'));
  beforeEach(angular.mock.module('corespring-editor.directives'));

  beforeEach(module(function($provide) {

    imageUtils = {
      bytesToKb: jasmine.createSpy('bytesToKb').and.callFake(function(b) {
        return Math.floor(b / 1024);
      }),
      fileTooBigError: jasmine.createSpy('fileToBigError')
    };

    $provide.value('LogFactory', new org.corespring.mocks.editor.LogFactory());
    $provide.value('ImageUtils', imageUtils);
    $provide.value('ComponentConfig', {});
  }));

  function render(scp) {
    scp = scp || rootScope.$new();
    var node = ['<div supportingmetadata=""',
      ' ng-model="supportingMaterial"',
      ' existing-names="names"',
      ' is-valid="isValid">'
    ].join('');
    element = angular.element(node);
    compile(element)(scp);
    scp.$digest();
    scope = element.isolateScope();
  }

  beforeEach(inject(function($rootScope, $compile) {
    rootScope = $rootScope;
    compile = $compile;
  }));

  describe('initialization', function() {
    beforeEach(function() {
      render();
    });

    it('sets the name error to null', function() {
      expect(scope.metadataForm.name.$error).toBe(null);
    });

    it('sets the name error to null', function() {
      expect(scope.metadataForm.fileToUpload.$error).toBe(null);
    });

    it('sets materialTypes', function() {
      expect(scope.materialTypes).toEqual(
        ['none selected',
          'Rubric',
          'Scoring Guide',
          'Student Materials',
          'Student Work Examples',
          'Other'
        ]);
    });
  });

  function initFromSupportingMaterial(sm) {
    var s = rootScope.$new();
    s.supportingMaterial = sm;
    render(s);
  }

  describe('$render', function() {


    it('sets name and empty material type', function() {
      initFromSupportingMaterial({
        name: 'name'
      });
      expect(scope.name).toEqual('name');
      expect(scope.materialType).toEqual('none selected');
    });

    it('sets materialType', function() {
      initFromSupportingMaterial({
        materialType: 'Rubric'
      });
      expect(scope.materialType).toEqual('Rubric');
    });

    it('sets materialType to other if it\'s not in the default set', function() {
      initFromSupportingMaterial({
        materialType: 'blah'
      });
      expect(scope.materialType).toEqual('Other');
      expect(scope.otherMaterialType).toEqual('blah');
    });
  });

  describe('checkNameIsAvailable', function() {

    beforeEach(function() {
      var s = rootScope.$new();
      s.supportingMaterial = {

      };
      s.names = ['apple'];
      render(s);
    });

    it('updates the form validation name is taken', function() {
      scope.name = 'apple';
      scope.checkNameIsAvailable();
      expect(scope.metadataForm.name.$valid).toEqual(false);
      expect(scope.metadataForm.name.$error).toEqual('That name already exists');
    });

    it('updates the form validation name is not taken', function() {
      scope.name = 'apple2';
      scope.checkNameIsAvailable();
      expect(scope.metadataForm.name.$valid).toEqual(true);
      expect(scope.metadataForm.name.$error).toEqual(null);
    });
  });

  describe('isValid', function() {

    function assertIsValid(data, isValid) {
      return function() {
        initFromSupportingMaterial(data);
        scope.source = data.source;
        scope.otherMaterialType = data.otherMaterialType;
        scope.fileToUpload = data.fileToUpload;
        scope.$digest();
        expect(scope.isValid).toEqual(isValid);
      };
    }

    it('empty', assertIsValid({}, false));

    it('with name', assertIsValid({
      name: 'name'
    }, false));

    it('with name, materialType',
      assertIsValid({
          name: 'name',
          materialType: 'materialType'
        },
        false));

    it('with name, materialType, source=html',
      assertIsValid({
        name: 'name',
        materialType: 'materialType',
        otherMaterialType: 'blah',
        source: 'html'
      }, true));

    it('with name, materialType, source=binary',
      assertIsValid({
        name: 'name',
        materialType: 'materialType',
        source: 'binary'
      }, false));

    it('with name, materialType, source=binary, empty otherMaterialType',
      assertIsValid({
        name: 'name',
        materialType: 'Other',
        otherMaterialType: '',
        source: 'binary'
      }, false));

    it('with name, materialType, source=binary, small file',
      assertIsValid({
        name: 'name',
        materialType: 'Rubric',
        source: 'binary',
        fileToUpload: {
          size: 1
        }
      }, true));

    it('with name, materialType, source=binary, big file',
      assertIsValid({
        name: 'name',
        materialType: 'Rubric',
        source: 'binary',
        fileToUpload: {
          size: 10000000
        }
      }, false));
  });

  describe('updateModel', function() {


    beforeEach(function() {
      var s = rootScope.$new();
      s.supportingMaterial = {};
      render(s);
    });

    it('updates the ng-model if valid', function() {
      expect(scope.ngModel).toEqual({});
      scope.name = 'name';
      scope.materialType = 'Rubric';
      scope.source = 'html';
      scope.$digest();
      expect(scope.ngModel).toEqual({
        name: 'name',
        materialType: 'Rubric',
        source: 'html'
      });
    });

    it('updates the ng-model if valid with file if binary', function() {
      expect(scope.ngModel).toEqual({});
      scope.name = 'name';
      scope.materialType = 'Rubric';
      scope.source = 'binary';
      scope.fileToUpload = {
        name: 'file',
        size: 1
      };
      scope.$digest();
      expect(scope.ngModel).toEqual({
        name: 'name',
        materialType: 'Rubric',
        source: 'binary',
        file: {
          name: 'file',
          size: 1
        }
      });
    });
  });

  describe('$watch(source)', function() {
    beforeEach(function() {
      render();
      spyOn(scope, '$broadcast');
    });

    it('broadcasts clearFile if source is html', function() {
      scope.source = 'html';
      scope.$digest();
      expect(scope.$broadcast).toHaveBeenCalledWith('clearFile');
    });
  });

  describe('$on(fileChange)', function() {
    beforeEach(function() {
      imageUtils.fileTooBigError.and.returnValue({
        code: 1,
        message: 'file too big'
      });
      render();
    });

    it('updates the file ui for a small file', function() {
      scope.$broadcast('fileChange', {
        size: 1
      });
      expect(scope.metadataForm.fileToUpload.$valid).toEqual(true);
      expect(scope.metadataForm.fileToUpload.$error).toBe(null);
    });

    it('updates the file ui for a big file', function() {
      scope.$broadcast('fileChange', {
        size: 10000000
      });
      expect(scope.metadataForm.fileToUpload.$valid).toEqual(false);
      expect(scope.metadataForm.fileToUpload.$error).toBe('file too big');
    });

  });

  describe('$on(metadata.focus-title)', function() {
    var selectFn;
    beforeEach(function() {
      render();
      selectFn = jasmine.createSpy('selectFn');
      spyOn($.fn, 'find').and.returnValue({
        select: selectFn
      });
    });

    it('calls select on element', function() {
      scope.$broadcast('metadata.focus-title');
      expect($.fn.find).toHaveBeenCalledWith('#name');
      expect(selectFn).toHaveBeenCalled();
    });
  });

});

describe('filechange', function() {
  
  var scope, element, changeTriger;

  beforeEach(angular.mock.module('corespring-editor.directives'));


  beforeEach(inject(function($compile, $rootScope) {
    scope = $rootScope.$new();
    spyOn($.fn, 'bind').and.callFake(function(k, handler){
      changeTriger = handler;
    });
    element = $compile('<input type="file" file-change=""></input>')(scope);
    spyOn(scope, '$emit');
    spyOn(scope, '$apply').and.callThrough();
    changeTriger();
  }));

  it('should $emit a fileChange event', function() {
    expect(scope.$emit).toHaveBeenCalledWith('fileChange', undefined);
  });

  it('should call scope.$apply', function() {
    expect(scope.$apply).toHaveBeenCalled();
  });
});