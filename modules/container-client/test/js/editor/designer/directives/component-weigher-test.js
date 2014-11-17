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

      rootScope.componentSet = [{
        componentType: 'one'
      }, {
        componentType: 'two'
      }];

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

    it('should ignore components that are not in the component set', function() {
      rootScope.components = {
        '1': {
          componentType: 'widget-one'
        }
      };

      rootScope.componentSet = [];
      rootScope.markup = '<widget-one id="1"></widget-one>';
      var elem = compile("<component-weights ng-model='components' component-set='componentSet' markup='markup'></component-weights>")(rootScope);
      var scope = rootScope.$$childHead;
      rootScope.$digest();
      expect(scope.sortedComponents.length).toBe(0);
    });
  });

});