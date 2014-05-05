angular.module('corespring-player.services').factory('CorespringPlayerDefinition', [
  '$log',
  '$compile',
  'MathJaxService',
  'PlayerUtils',
  'ComponentRegister',
  function($log, $compile, MathJaxService, PlayerUtils, ComponentRegister) {

    function CorespringPlayerDef(mode) {

      var link = function($scope, $elem) {

        var rendered = false;
        $scope.selectedComponentId = undefined;

        var renderMarkup = function(xhtml) {
          if ($scope.lastScope) {
            $scope.lastScope.$destroy();
          }
          $scope.lastScope = $scope.$new();
          var $body = $elem.find("#body").html(xhtml);
          $compile($body)($scope.lastScope);
          MathJaxService.parseDomForMath();
        };

        var setDataAndSession = function() {

          if (!$scope.item || !$scope.session) {
            return;
          }

          if (rendered && mode === "player") {
            $log.debug("not re-rendering because we are in player mode");
            return;
          }

          var allData = PlayerUtils.zipDataAndSession($scope.item, $scope.session);
          ComponentRegister.setDataAndSession(allData);
          rendered = true;
        };

        $scope.$on('registerComponent', function(event, id, obj) {
          ComponentRegister.registerComponent(id, obj);
        });

        $scope.$on('rerender-math', function(event, delay) {
          MathJaxService.parseDomForMath(delay);
        });

        /*
          stash the component data (TODO: persist it?)
        */
        $scope.$on('saveStash', function(event, id, stash) {

          if (!$scope.session) {
            return;
          }
          var extension = {
            components: {}
          };
          extension.components[id] = {
            stash: stash
          };
          $scope.session = _.merge($scope.session, extension);

        });

        $scope.$watch('xhtml', function(xhtml) {
          if (xhtml) {
            renderMarkup(xhtml);
          }
        });

        $scope.$watch('item', function(item) {
          setDataAndSession();
        }, true);

        $scope.$watch('session', function(session, oldSession) {

          if ($scope.mode !== "player" && !session) {
            $scope.session = {};
          }
          setDataAndSession();

        }, true);

        $scope.$watch('outcomes', function(r) {
          if (!r) {
            return;
          }
          ComponentRegister.setOutcomes(r);
        }, true);

      };

      this.restrict = 'AE';
      this.link = link;
      this.scope = {
        mode: '@playerMode',
        xhtml: '=playerMarkup',
        item: '=playerItem',
        outcomes: '=playerOutcomes',
        session: '=playerSession'
      };
      this.template = ['<div class="corespring-player">',
        '  <div id="body"></div>',
        '</div>'
      ].join("\n");
    }

    return CorespringPlayerDef;
  }
]);