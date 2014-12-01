(function() {

  angular.module('corespring-editor.directives').directive('corespringPreviewPlayer', [
    '$compile', 
    'LogFactory',
    'ComponentData',
    'MathJaxService',
    function($compile, LogFactory, ComponentData, MathJaxService) {

      var logger = LogFactory.getLogger('corespring-preview-player');

      /**
        * Performance improvements.
        * The player rendering is really sluggish and jumpy cos we re compile for every change.
        * 0. if the player isn't visible - no need to update
        * 1. when updating text in the editor, we only need to update the text in the player
        * 2. when updating the data for a component, we only need to update the data for that component
        * 3. when adding a new components, we only need to compile that node within the player body
        * 4. when removing a component we only need to remove that node + call $scope.destroy();
        *
        * Editor:
        * 1. When we launch an overlay, we should give the overlay a clone of the data and on close check a diff and merge the data back.
        *
        * ComponentData TODO: 
        * submit answer - update session
        * reset session

        * 1. 
        */


      function link($scope, $element, $attrs){
 
        var rendered = {};

        var renderMarkup = function(xhtml) {
          logger.debug('[renderMarkup]...');

          $element.find('.player-body').addClass('hidden-player-body');

          if ($scope.lastScope) {
            $scope.lastScope.$destroy();
          }
          
          $scope.lastScope = $scope.$new();
          
          var $body = $element.find('.player-body').html(xhtml);
          
          $compile($body)($scope.lastScope);

          MathJaxService.onEndProcess(function(){
            $('.player-body').removeClass('hidden-player-body');
            MathJaxService.off(arguments.callee);
          });

          MathJaxService.parseDomForMath(0, $element.find('.player-body')[0]);
        };


        function updateUi(){
          
          logger.debug('[updateUi]');

          if(!$scope.xhtml){
            return;
          }

          if(!$scope.components){
            return;
          }

          var isEqual = _.isEqual($scope.xhtml, rendered.xhtml);
          
          if (!isEqual) {
            logger.debug('[updateUi] xhtml', $scope.xhtml);
            renderMarkup($scope.xhtml);
            rendered.xhtml = _.cloneDeep($scope.xhtml);
          }

          if(_.isEqual($scope.components, rendered.components)){
            logger.debug('[updateUi] components are the same - skip update');
            return;
          }

          _.forIn($scope.components, function(model, id){
            if(_.isEqual(model, rendered.components ? rendered.components[id] : null)){
              logger.debug('[updateUi] id', id, 'data is same skip...');
            } else {
              logger.debug('[updateUi] id', id, 'updating...');
              ComponentData.updateComponent(id, model);
            }
          });

          rendered.components = _.cloneDeep($scope.components);
        }

        var debouncedUpdateUi = debounce(updateUi);

        function debounce(fn){
          return _.debounce(fn, 300, {leading: false, trailing: true});
        }

        $scope.$watch('xhtml', function() {
          debouncedUpdateUi();
        });

        $scope.$watch('components', function(){
          debouncedUpdateUi();
        }, true);

        $scope.$watch('outcomes', function(r) {
          if (!r) {
            return;
          }
          ComponentData.setOutcomes(r);
          MathJaxService.parseDomForMath();
        }, true);

        debouncedUpdateUi();
      }

      return {
        restrict: 'E',
        link: link,
        scope : {
        xhtml: '=playerMarkup',
        components: '=playerComponents',
        outcomes: '=playerOutcomes',
        session: '=playerSession'
        },
        template : [
          '<div class="corespring-player">',
          '  <div class="player-body hidden-player-body"></div>',
          '</div>'
        ].join('\n'),
        replace: true
      };
    }
  ]);
})();
