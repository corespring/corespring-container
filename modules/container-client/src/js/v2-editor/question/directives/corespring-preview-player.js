(function() {

  // Caches ids of elements that were previously clean.
  //var cleanCache = [];

  angular.module('corespring-editor.directives').directive('corespringPreviewPlayer', [
    'LogFactory',
    'ComponentRegister',
    'PlayerUtils',
    function(LogFactory, ComponentRegister, PlayerUtils) {

      var logger = LogFactory.getLogger('corespring-preview-player');

      function link($scope, $element, $attrs){

        function registDataAndSession(){

          logger.debug('skip data and session registration');
          /*
          if(!$scope.components){
            logger.debug('no components or xhtml - don\'t register comps');
            return;
          }

          var allData = PlayerUtils.zipDataAndSession($scope.components, $scope.session);
          ComponentRegister.setDataAndSession(allData);
          */
        }

        $scope.$watch('xhtml', function(xhtml) {
          if (xhtml) {
            logger.debug('xhtml', xhtml);
          }
        });

        $scope.$watch('components', function(components) {
          logger.debug('components: ', components);
          if(components){
            registDataAndSession();
          }
        }, true);

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
