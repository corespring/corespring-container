(function() {

  angular.module('corespring-player.directives').directive('corespringPlayer', [ '$compile',
      'ComponentRegister',
      function($compile, ComponentRegister){

        var link = function($scope, $elem, $attrs){
          console.log("corespring-player");

          $scope.registerComponent = ComponentRegister.registerComponent;

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
            ComponentRegister.setSession(s);
            ComponentRegister.setAnswers(s.answers);
          });

          $scope.$watch('responses', function(r){
            if(!r){
              return;
            }
            ComponentRegister.setResponses(r);
          });

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
