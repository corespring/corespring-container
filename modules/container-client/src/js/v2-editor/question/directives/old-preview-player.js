angular.module('corespring-editor.directives').directive('oldPreviewPlayer', [
  '$log',
  '$compile',
  'MathJaxService',
  'PlayerUtils',
  'ComponentRegister',
  function($log, $compile, MathJaxService, PlayerUtils, ComponentRegister) {

    function CorespringPlayerDef() {


      var isRenderedOnce = false;

      var link = function($scope, $elem) {

        var rendered = false;

        var renderMarkup = function(xhtml) {
          if ($scope.lastScope) {
            $scope.lastScope.$destroy();
          }
          $scope.lastScope = $scope.$new();
          var $body = $elem.find(".player-body").html(xhtml);
          $compile($body)($scope.lastScope);

          MathJaxService.onEndProcess(function(){
            $('.player-body').removeClass('hidden-player-body');
            MathJaxService.off(arguments.callee);
            if (!isRenderedOnce){
              isRenderedOnce = true;
              $scope.$emit("rendered");
            }
          });

          MathJaxService.parseDomForMath();

        };

        var setDataAndSession = function() {
          if (!$scope.item || !$scope.session) {
            return;
          }

          $log.debug("corespring player definition setDataAndSession rendering");

          var allData = PlayerUtils.zipDataAndSession($scope.item, $scope.session);
          ComponentRegister.setDataAndSession(allData);
          rendered = true;
        };

        $scope.$on('registerComponent', function(event, id, obj) {
          ComponentRegister.registerComponent(id, obj);
        });

        $scope.$on('rerender-math', function(event, options) {
          MathJaxService.parseDomForMath(options.delay || 0, options.element);
        });

        $scope.$on('rerender-xhtml', function(event) {
          renderMarkup($scope.xhtml);
          setDataAndSession();
        });

        /**        
          TODO: is this a core player function? or is it only for the editor?
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
          MathJaxService.parseDomForMath();
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
      this.template = [
        '<div class="corespring-player">',
        '  <div class="player-body hidden-player-body"></div>',
        '</div>'
      ].join("\n");
    }

    return new CorespringPlayerDef();
  }
]);