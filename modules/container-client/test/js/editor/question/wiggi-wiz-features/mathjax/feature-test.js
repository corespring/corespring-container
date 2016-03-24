describe('mathjax feature', function() {

  var feature, rootScope;

  var MathJaxService = {
    parseDomForMath: function() {
    }
  };

  beforeEach(angular.mock.module('corespring-editing.wiggi-wiz-features.mathjax'));

  beforeEach(module(function($provide, $compileProvider) {
    $provide.value('MathJaxService', MathJaxService);
    $compileProvider.directive('testIsolate',function() {
        return {
          scope: {}
        };
      });

  }));


  beforeEach(inject(function(WiggiMathJaxFeatureDef, $rootScope) {
    feature = new WiggiMathJaxFeatureDef();
    rootScope = $rootScope;
  }));

  describe('initialization', function() {
    it('should set name', function() {
      expect(feature.name).toEqual('mathjax');
    });

    it('should set attribute name', function() {
      expect(feature.attributeName).toEqual('mathjax');
    });

    it('should set draggable to be true', function() {
      expect(feature.draggable).toEqual(true);
    });

    it('should set insertInline to be true', function() {
      expect(feature.insertInline).toEqual(true);
    });

    it('should set icon class', function() {
      expect(feature.iconclass).toEqual('fa math-sum');
    });

    it('should set compile to be true', function() {
      expect(feature.compile).toEqual(true);
    });

  });

  describe('initialise', function() {
    var math, $node, replaceWith;
    beforeEach(function() {
      math = "\\frac{1}{2}";
      $node = $('<div></div>');
      replaceWith = jasmine.createSpy('replaceWith');
      spyOn(MathJaxService, 'parseDomForMath');

      feature.initialise($node, replaceWith);
    });

    it('should call MathJaxService.parseDomForMath', function() {
      expect(MathJaxService.parseDomForMath).toHaveBeenCalled();
    });

    it("should call replaceWith with mathjax-holder node containing $node's contents", function() {
      expect(replaceWith.calls.mostRecent().args[0][0].outerHTML)
        .toMatch(/mathinput-holder/);
    });

  });

  describe('getMarkup', function() {

    var $node;
    var wrapped = function(s) {
      return '\\(' + s + '\\)';
    };

    it('return wrapped latex for latex expression', function() {
      var $scope = {
        expr: "\\frac{1}{2}"
      };
      expect(feature.getMarkUp($node, $scope))
        .toEqual('<span mathjax>' + wrapped($scope.expr) + '</span>');
    });

    it('return wrapped latex for latex code', function() {
      var $scope = {
        "code": "\\frac{1}{2}"
      };
      expect(feature.getMarkUp($node, $scope))
        .toEqual('<span mathjax>' + wrapped($scope.code) + '</span>');
    });

    it('return unwrapped mathml for mathml code', function() {
      var $scope = {
        "code": '<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>1</mn><mn>2</mn></mfrac></math>'
      };
      expect(feature.getMarkUp($node, $scope))
        .toEqual('<span mathjax>' + $scope.code + '</span>');
    });

  });

  describe('registerChangeNotifier', function() {

    var $node, $scope;

    beforeEach(inject(function($compile, $rootScope) {
      math = "\\frac{1}{2}";
      $node = $compile('<div test-isolate=""></div>')($rootScope.$new());
      $scope = $node.isolateScope();
    }));

    it('calls notifyEditorOfChange when ngModel changes', function() {
      var notifyFn = jasmine.createSpy('notify');
      feature.registerChangeNotifier(notifyFn, $node);
      $scope.ngModel = 'old';
      $scope.$digest();
      $scope.ngModel = 'new';
      $scope.$digest();
      expect(notifyFn).toHaveBeenCalled();
    });

    it('calls notifyEditorOfChange when code changes', function() {
      var notifyFn = jasmine.createSpy('notify');
      feature.registerChangeNotifier(notifyFn, $node);
      $scope.code = 'old';
      $scope.$digest();
      $scope.code = 'new';
      $scope.$digest();
      expect(notifyFn).toHaveBeenCalled();
    });

  });


});