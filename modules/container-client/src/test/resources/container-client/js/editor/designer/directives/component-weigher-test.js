describe('componentWeights', function() {

  beforeEach(angular.mock.module('corespring-editor.directives'));


  describe('weighter', function() {
    var rootScope, compile, timeout;

    function assertPercent(elem, id, value) {
      var html = $(elem).find('#component-weight-input-id-' + id).next().next().html();
      expect(html).toBe(value);
    }

    beforeEach(inject(function($compile, $rootScope, $timeout) {
      rootScope = $rootScope.$new();
      compile = $compile;
      timeout = $timeout;
    }));

    it('should init', function() {
      var elem = compile("<component-weights/>")(rootScope);
      expect(elem).toNotBe(null);
    });

    it('should sort components based on the layout', function() {

      rootScope.components = {
        '1': {
          componentType: 'one',
          weight: 1
        },
        '2': {
          componentType: 'two',
          weight: 2
        }
      };

      rootScope.componentSet = [];
      rootScope.markup = '<two id="2"></two><one id="1"></one>';
      var elem = compile("<component-weights ng-model='components' component-set='componentSet' markup='markup'></component-weights>")(rootScope);
      var scope = rootScope.$$childHead;
      rootScope.$digest();
      expect(scope.sortedComponents.length).toBe(2);
      expect(scope.sortedComponents[0].id).toBe('2');
      expect(scope.sortedComponents[1].id).toBe('1');
      assertPercent(elem, '1', '33%');
      assertPercent(elem, '2', '66%');
      console.log(elem.html());
    });

    it('should', function() {



    });

  });

  /*describe('input', function() {


    it('should init', function() {

      var elem = $compile('<component-weight-input></component-weight-input>')($scope);
      var fooController = elem.controller('componentWeights');
      spyOn(fooController, 'add').andReturn(3);

      var barElement = angular.element('<bar x="1" y="2"></bar>')
      fooElement.append(barElement);
    });
  });*/

});