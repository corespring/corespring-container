angular.module('corespring-player.directives').directive('corespringPlayer', [
  '$rootScope',
  '$compile',
  '$log',
  'ComponentRegister',
  'PlayerUtils',
  'MathJaxService',
  function($rootScope, $compile, $log, ComponentRegister, PlayerUtils, MathJaxService) {


    var link = function($scope, $elem) {

      // TODO: Stop using id attributes for this!
      function getComponentById(id) {
        return $(_.find($elem.find('#' + id), function(el) {
          return !$(el).is('span');
        }));
      }


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

        _(ComponentRegister.components).keys().each(function(id) {
          var $container = $("<div class='component-container'/>");
          if (parseInt(id, 10) === $rootScope.selectedComponentId) {
            $container.addClass('selected');
          }
          getComponentById(id).wrap($container);
        });
      };

      var setDataAndSession = function() {

        if (!$scope.item || !$scope.session) {
          return;
        }

        if (rendered && $scope.mode === "player") {
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

      function selectContainer(id) {
        $('#body .selected').removeClass('selected');
        if (getComponentById(id).parent().hasClass('component-container')) {
          getComponentById(id).parent().addClass('selected');
          $scope.selectedComponentId = id;
          $scope.$apply();

          if ($('.component-container.selected').size() > 0) {
            $('.component-container.selected')[0].scrollIntoView();
          }
        } else {
          $log.error('Could not find component-container for id = ' + id);
        }
      }

      function deselectContainer() {
        $('#body .selected').removeClass('selected');
        $scope.selectedComponentId = undefined;
      }

      $rootScope.$on('componentSelectionToggled', function(event, data) {
        var phase = $scope.$$phase;

        if ($scope.selectedComponentId === data.id) {
          deselectContainer();
        } else {
          selectContainer(data.id);
        }

        if (phase !== '$apply' && phase !== '$digest') {
          $scope.$apply();
        }
      });

      $rootScope.$on('componentSelected', function(event, data) {
        selectContainer(data.id);
      });

      $rootScope.$on('componentDeselected', function() {
        deselectContainer();
      });

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
      template: ['<div class="corespring-player">',
        '  <div id="body"></div>',
        '</div>'
      ].join("\n")
    };
    return def;
  }

]);