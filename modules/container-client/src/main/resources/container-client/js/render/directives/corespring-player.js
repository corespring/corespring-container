(function() {

  angular.module('corespring-player.directives').directive('corespringPlayer', [
      '$compile',
      '$log',
      'ComponentRegister',
      function($compile, $log, ComponentRegister){

        var link = function($scope, $elem, $attrs){

          var rendered = false;

          var renderMarkup = function(xhtml){
            var $body = $elem.find("#body").html(xhtml);
            $compile($body)($scope);

            _.defer(function() {
              if (!_.isUndefined(MathJax)) {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
              }
            });
        };

        var setDataAndSession = function(){

          if (!$scope.item || !$scope.session) {
            return;
          }

          if (rendered && $scope.mode == "player") {
            $log.debug("not re-rendering because we are in player mode");
            return;
          }

          var keys = _.keys($scope.item.components);

          var zipped = _.map(keys, function(k){
            var session = ($scope.session.components) ? $scope.session.components[k] : null;
            return { data: $scope.item.components[k], session: session};
          });

          var allData = _.zipObject(keys, zipped);
          ComponentRegister.setDataAndSession(allData);
          rendered = true;
        };

        var setGlobalSession = function(){
          if(!$scope.session){
            return;
          }
          ComponentRegister.setGlobalSession($scope.session);
        };

        $scope.$on('registerComponent', function(event, id, obj){
          $log.info("registerComponent: ", id);
          ComponentRegister.registerComponent(id, obj);
        });

        /*
          stash the component data (TODO: persist it?)
        */
        $scope.$on('saveStash', function(event, id, stash){
          if(!$scope.session){
            return;
          }
          var extension = { components: {} };
          extension.components[id] = {stash: stash};
          $scope.session = _.merge($scope.session, extension);
        });

        $scope.$watch('xhtml', function(xhtml){
          renderMarkup(xhtml);
        });

        $scope.$watch('item', function(item){
          setDataAndSession();
        }, true);

        $scope.$watch('session', function(session, oldSession){
          $log.debug("new session: ", session);
          $log.debug("old session: ", oldSession);
          if ($scope.mode != "player" && !session) {
            $scope.session = {};
          }
          setDataAndSession();
          setGlobalSession();
        }, true);

        $scope.$watch('responses', function(r){
          if(!r){
            return;
          }
          ComponentRegister.setResponses(r);
        }, true);

      };

      var def = {
        restrict: 'AE',
        link: link,
        scope: {
          /* if player then it only renders once */
          mode: '@playerMode',
          xhtml: '=playerMarkup',
          item: '=playerItem',
          responses: '=playerResponses',
          session: '=playerSession'
        },
        template: [ '<div>',
                    '  <div id="body"></div>',
                    '</div>'].join("\n")
      };
      return def;
    }

  ]);

}).call(this);
