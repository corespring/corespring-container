angular.module('corespring-player.services').factory('CorespringPlayerDefinition', [
  '$log',
  '$compile',
  'MathJaxService',
  'PlayerUtils',
  'ComponentRegister',
  function($log, $compile, MathJaxService, PlayerUtils, ComponentRegister) {

    function CorespringPlayerDef(opts) {

      opts = _.extend({
        mode: 'player',
        /**
         * called at the end of renderMarkup
         */
        postRender: null,
        /**
         * Allows the scope to be extended - called at the end of link
         */
        postLink: null,
        /**
         * Called after data has been passed to the components
         */
        afterSetDataAndSession: null,
        /**
         * Called before the body is compiled
         */
        preCompile: null
      }, opts);

      ComponentRegister = opts.ComponentRegister || ComponentRegister;

      var isRenderedOnce = false;


      var link = function($scope, $elem) {

        $scope.domId = (function() {
          var prefix = 'player-body-';
          var idx = 0;
          while ($('body').find('#' + prefix + idx).length !== 0) {
            idx++;
          }
          return prefix + idx;
        })();

        var rendered = false;

        var renderMarkup = function(xhtml) {
          if ($scope.lastScope) {
            $scope.lastScope.$destroy();
          }
          $scope.lastScope = $scope.$new();
          var $body = $elem.find(".player-body").html(xhtml);
          if(_.isFunction(opts.preCompile)){
            opts.preCompile($body);
          }
          $compile($body)($scope.lastScope);

          MathJaxService.onEndProcess(function(){
            $('.player-body').removeClass('hidden-player-body');
            MathJaxService.off(arguments.callee);
            if (!isRenderedOnce){
              isRenderedOnce = true;
              $scope.$emit("rendered");
            }
          });

          MathJaxService.parseDomForMath(100, $elem[0]);
          if (_.isFunction(opts.postRender)) {
            opts.postRender($scope.lastScope, $body);
          }
        };

        var setDataAndSession = function() {
          if (!$scope.item || !$scope.session) {
            return;
          }

          console.log('$scope.mode: ', $scope.mode);
          
          if (rendered) {
            $log.debug("not re-rendering because we are in player mode");
            return;
          }

          $log.debug("corespring player definition setDataAndSession rendering");

          var allData = PlayerUtils.zipDataAndSession($scope.item, $scope.session);
          ComponentRegister.setDataAndSession(allData);
          rendered = true;

          if(_.isFunction(opts.afterSetDataAndSession)){
            opts.afterSetDataAndSession($scope, allData);
          }
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
          MathJaxService.parseDomForMath(100, $elem[0]);
        }, true);

        if (_.isFunction(opts.postLink)) {
          opts.postLink($scope, $elem);
        }

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
        '  <div class="player-body hidden-player-body" id="{{domId}}"></div>',
        '  <summary-feedback ng-model="item.summaryFeedback" session-complete="session.isComplete"></summary-feedback>',
        '</div>'
      ].join("\n");
    }

    return CorespringPlayerDef;
  }
]);