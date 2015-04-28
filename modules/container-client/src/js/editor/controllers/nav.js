angular.module('corespring-editor.controllers').controller('NavController', [
  '$scope',
  'LogFactory',
  '$modal',
  'ItemService',
  'ConfigurationService',
  function($scope, LogFactory, $modal, ItemService, ConfigurationService) {

    ConfigurationService.getConfig(function(config) {
      $scope.showTitle = config.get('profileConfig.title.visible', true);
      $scope.showSaveMessage = (config.get('showSaveMessage'), false);
    });

    var logger = LogFactory.getLogger('NavController');

    function titleCase(s) {
      function _titleCaseWord(str){
        return str
          .replace(
            /\w\S*/g,
            function(s){
              return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
            }
          );
      }
      return _.map(s.split('-'), _titleCaseWord).join('');
    }

    function launchModal(name, size, backdrop, resolve, okFn, dismissFn) {
      var titleCaseName = titleCase(name);
      size = size || 'sm';
      backdrop = backdrop !== undefined ? backdrop : 'static';

      return function() {
        var modalInstance = $modal.open({
          templateUrl: '/templates/popups/' + name,
          controller: titleCaseName + 'PopupController',
          size: size,
          backdrop: backdrop,
          resolve: resolve
        });

        okFn = okFn || function() {
          logger.debug('ok!', arguments);
        };

        dismissFn  = dismissFn|| function() {
          logger.debug('Modal dismissed at: ' + new Date());
        };

        modalInstance.result.then(okFn, dismissFn);
      };
    }

    $scope.$watch('item.profile.taskInfo.title', function(newValue) {
      if (newValue === undefined || newValue === "") {
        $scope.title = 'Untitled';
      } else {
        $scope.title = newValue;
      }
    });

    ItemService.load(function onItemLoadSuccess(item) {
      $scope.item = item;
    },
    function onItemLoadError(err){
      logger.error('error loading item', err);
    });


    $scope.open = launchModal('open');

    $scope.editTitle = launchModal('edit-title', 'sm', 'static', {
      title : function() {
        return $scope.item.profile.taskInfo.title;
      }
    }, function(title) {
      $scope.item.profile.taskInfo.title = title;
      ItemService.saveProfile($scope.item.profile);
    });

    $scope.copy = launchModal('copy');
    $scope['new'] = launchModal('new');
    $scope.archive = launchModal('archive');
    $scope.delete = launchModal('delete');

    $scope.questionInformation = launchModal('question-information', 'lg', undefined, {
      item: function() {
        return $scope.item;
      }
    });

    $scope.help = launchModal('help', 'lg', false);

    $scope.saveStatus = null;

    $scope.handleSaveMessage = function(msg){
      $scope.saveStatus = msg;
    };

    ItemService.addSaveListener('nav', $scope);
  }
]);

angular.module('corespring-editor.controllers')
  .directive('modalWindow', function(){
    return {
      restrict: 'EA',
      link: function(scope, element) {
        element.draggable({
          handle: '.modal-header',
          opacity: 0.7,
          cursor: 'move'
        });
        element.find('.modal-content').resizable();
      }
    };
  });
