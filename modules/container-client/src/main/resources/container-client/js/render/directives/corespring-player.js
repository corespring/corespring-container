angular.module('corespring-player.directives').directive('corespringPlayer', [
    '$compile',
    '$log',
    'ComponentRegister',
    'MathJaxService',
    function($compile, $log, ComponentRegister, MathJaxService){

      var link = function($scope, $elem, $attrs){

        var rendered = false;

        var renderMarkup = function(xhtml){
          var $body = $elem.find("#body").html(xhtml);
          $compile($body)($scope);
          MathJaxService.parseDomForMath();
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
          //setDataAndSession();
        }, true);

        $scope.$watch('session', function(session, oldSession){
          
          if ($scope.mode != "player" && !session) {
            $scope.session = {};
          }
          setDataAndSession();
          
        }, true);

        $scope.$watch('outcomes', function(r){
          if(!r){
            return;
          }
          ComponentRegister.setOutcomes(r);
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
        outcomes: '=playerOutcomes',
        session: '=playerSession'
      },
      template: [ '<div class="corespring-player">',
                  '  <div id="body"></div>',
                  '</div>'].join("\n")
    };
    return def;
  }

]);