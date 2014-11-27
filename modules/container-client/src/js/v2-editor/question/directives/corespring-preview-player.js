(function() {

  // Caches ids of elements that were previously clean.
  //var cleanCache = [];

  angular.module('corespring-editor.directives').directive('corespringPreviewPlayer', [
    '$compile', 
    'LogFactory',
    'ComponentRegister',
    'PlayerUtils',
    'MathJaxService',
    function($compile, LogFactory, ComponentRegister, PlayerUtils, MathJaxService) {

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
        */
      function link($scope, $element, $attrs){

        var renderMarkup = function(xhtml) {
          if ($scope.lastScope) {
            $scope.lastScope.$destroy();
          }
          $scope.lastScope = $scope.$new();
          var $body = $element.find(".player-body").html(xhtml);
          
          $compile($body)($scope.lastScope);

          MathJaxService.onEndProcess(function(){
            $('.player-body').removeClass('hidden-player-body');
            MathJaxService.off(arguments.callee);
          });

          MathJaxService.parseDomForMath(0, $element.find('.player-body')[0]);
        };

        $scope.$watch('xhtml', function(xhtml, oldXhtml) {

          var isEqual = _.isEqual(xhtml, oldXhtml);
          if (xhtml && !isEqual) {
            logger.debug('xhtml', xhtml);
            renderMarkup(xhtml);
          }
        });

        $scope.$watch('session', function(session, oldSession) {

          logger.debug('session', session);

          if ($scope.mode !== "player" && !session) {
            $scope.session = {};
          }

        }, true);

        $scope.$watch('outcomes', function(r) {
          if (!r) {
            return;
          }
          ComponentRegister.setOutcomes(r);
          //MathJaxService.parseDomForMath();
        }, true);

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
          '  <h1>New preview player!</h1>',
          '  <div class="player-body hidden-player-body"></div>',
          '</div>'
        ].join("\n"),
        replace: true
      };
    }
  ]);
})();
