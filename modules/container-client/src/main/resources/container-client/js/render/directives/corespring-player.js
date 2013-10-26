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

          $scope.$on('saveStash', function(event, id, stash){
            if(!$scope.rootData){
              return;
            }

            var extension = { session: { components: {} } };
            extension.session.components[id] = {stash: stash};

            $scope.rootData= _.extend($scope.rootData, extension);
          });

          /** Data contains: components + session */
          $scope.$watch('rootData', function(root){
            $log.debug("!! root updated");
            $log.debug(root);
            if(!root){
              return;
            }

            var $body = $elem.find("#body").html(root.item.xhtml);
            $compile($body)($scope);

            var keys = _.keys(root.item.components);

            var zipped = _.map(keys, function(k){
              var session = (root.session && root.session.components) ? root.session.components[k] : null;
              return { data: root.item.components[k], session: session};
            });

            var allData = _.zipObject(keys, zipped);
            ComponentRegister.setDataAndSession(allData);
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
            xhtml: '=playerXhtml',
            rootData: '=playerData',
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
