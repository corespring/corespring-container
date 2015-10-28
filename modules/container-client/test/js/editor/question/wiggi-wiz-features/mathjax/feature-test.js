describe('mathjax feature', function() {

  var wiggiMathJaxFeatureDef, rootScope;

  var MathJaxService = {
    parseDomForMath: function() {}
  };

  beforeEach(angular.mock.module('corespring.wiggi-wiz-features.mathjax'));

  beforeEach(module(function($provide) {
    $provide.value('MathJaxService', MathJaxService);
  }));

  beforeEach(inject(function(WiggiMathJaxFeatureDef, $rootScope) {
    wiggiMathJaxFeatureDef = new WiggiMathJaxFeatureDef();
    rootScope = $rootScope;
  }));

  describe('initialization', function() {
    it('should set name', function() {
      expect(wiggiMathJaxFeatureDef.name).toEqual('mathjax');
    });

    it('should set attribute name', function() {
      expect(wiggiMathJaxFeatureDef.attributeName).toEqual('mathjax');
    });

    it('should set draggable to be true', function() {
      expect(wiggiMathJaxFeatureDef.draggable).toEqual(true);
    });

    it('should set insertInline to be true', function() {
      expect(wiggiMathJaxFeatureDef.insertInline).toEqual(true);
    });

    it('should set icon class', function() {
      expect(wiggiMathJaxFeatureDef.iconclass).toEqual('fa math-sum');
    });

    it('should set compile to be true', function() {
      expect(wiggiMathJaxFeatureDef.compile).toEqual(true);
    });

  });

  describe('initialise', function() {
    var math, $node, replaceWith;
    beforeEach(function() {
      math = "\\frac{1}{2}";
      $node = $('<div></div>');
      replaceWith = jasmine.createSpy('replaceWith');
      spyOn(MathJaxService, 'parseDomForMath');

      wiggiMathJaxFeatureDef.initialise($node, replaceWith);
    });

    it('should call MathJaxService.parseDomForMath', function() {
      expect(MathJaxService.parseDomForMath).toHaveBeenCalled();
    });

    it("should call replaceWith with mathjax-holder node containing $node's contents", function() {
      expect(replaceWith.calls.mostRecent().args[0][0].outerHTML)
        .toEqual($('<div mathjax-holder contenteditable="false"></div>' + math + '</div>')[0].outerHTML);
    });

  });

  describe('addToEditor', function() {
    var editor, addContent, callback;
    var markup = "\\frac{1}{2}";

    beforeEach(function() {
      editor = {
        launchDialog: jasmine.createSpy('launchDialog')
      };
      addContent = jasmine.createSpy('addContent');
      spyOn(rootScope, '$emit').and.callThrough();
      wiggiMathJaxFeatureDef.addToEditor(editor, addContent);
      callback = editor.launchDialog.calls.mostRecent().args[3];
    });

    it('should launch dialog', function() {
      expect(editor.launchDialog).toHaveBeenCalled();
    });

    describe('callback', function() {

      it('should not add content when cancelled', function() {
        callback({cancelled: true});
        expect(addContent).not.toHaveBeenCalled();
      });

      it('should call addContent with a mathjax-holder containing markup', function() {
        var calledWithNode;

        callback({originalMarkup: markup});
        calledWithNode = addContent.calls.mostRecent().args[0][0];

        expect(calledWithNode.outerHTML).toEqual('<mathjax-holder>' + markup + '</mathjax-holder>');
      });

      it("should fire 'math-updated' event", function() {
        callback({originalMarkup: markup});
        expect(rootScope.$emit).toHaveBeenCalledWith('math-updated');
      });

    });

  });

  describe('onClick', function() {
    var $node, $scope, $originalScope, editor, callback;
    var markup = "\\frac{1}{2}";

    beforeEach(function() {
      $scope = {
        $emit: jasmine.createSpy('$emit')
      };
      editor = {
        launchDialog: jasmine.createSpy('launchDialog')
      };
      spyOn(MathJaxService, 'parseDomForMath');
      wiggiMathJaxFeatureDef.onClick($node, $scope, editor);
      callback = editor.launchDialog.calls.mostRecent().args[3];
    });

    it('should launch dialog', function() {
      expect(editor.launchDialog).toHaveBeenCalled();
    });

    describe('callback', function() {

      describe('cancelled', function() {

        beforeEach(function() {
          callback({cancelled: true, originalMarkup: 'some markup'});
        });

        it('should change $scope.originalMarkup when cancelled', function() {
          expect($scope.originalMarkup).toBe('some markup');
        });

        it('should $emit saveData', function() {
          expect($scope.$emit).toHaveBeenCalledWith('save-data');
        });

        it('should call MathJaxService.parseDomForMath', function() {
          expect(MathJaxService.parseDomForMath).toHaveBeenCalled();
        });

      });

      describe('not cancelled, with markup', function() {

        var originalMarkup = "\\frac{1}{2}";

        beforeEach(function() {
          callback({originalMarkup: originalMarkup});
        });

        it('should set $scope.originalMarkup to update.originalMarkup', function() {
          expect($scope.originalMarkup).toEqual(originalMarkup);
        });

        it('should $emit saveData', function() {
          expect($scope.$emit).toHaveBeenCalledWith('save-data');
        });

        it('should call MathJaxService.parseDomForMath', function() {
          expect(MathJaxService.parseDomForMath).toHaveBeenCalled();
        });

        it("should fire 'math-updated' event", function() {
          expect($scope.$emit).toHaveBeenCalledWith('math-updated');
        });

      });

    });

  });

  describe('getMarkup', function() {

    var $node, $scope = {
      originalMarkup: "\\frac{1}{2}"
    };

    it('should return $scope.originalMarkup wrapped in a <span mathjax/>', function() {
      expect(wiggiMathJaxFeatureDef.getMarkUp($node, $scope))
        .toEqual('<span mathjax>' + $scope.originalMarkup + '</span>');
    });

  });

});