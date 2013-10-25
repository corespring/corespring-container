(function() {

  angular.module('corespring-player.directives').directive('corespringPlayer', [
      '$compile',
      '$log',
      'ComponentRegister',
      function($compile, $log, ComponentRegister){

        var link = function($scope, $elem, $attrs){
          console.log("corespring-player");

          $scope.$on('registerComponent', function(event, id, obj){
            $log.info("registerComponent: ", id);
            ComponentRegister.registerComponent(id, obj);
          });

          $scope.$watch('xhtml', function(newXhtml){
            if(!newXhtml){
              return;
            }
            var $body = $elem.find("#body").html(newXhtml);
            $compile($body)($scope);
          });

          $scope.$watch('components', function(comps){
            if(!comps){
              return;
            }
            ComponentRegister.setData(comps);
          }, true);

          $scope.$watch('session', function(s){
            if(!s){
              return;
            }
            $scope.session = s;
            ComponentRegister.setGlobalSession(s);
            if(s.components){
              ComponentRegister.setComponentSessions(s.components);
            }
          });

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
            xhtml: '=playerXhtml',
            components: '=playerModel',
            session: '=playerSession',
            responses: '=playerResponses'
          },
          template: [ '<div>',
                      '  <div id="body"></div>',
                      '</div>'].join("\n")
        };
        return def;
      }

  ]);

}).call(this);
