angular.module('corespring-editor.controllers').controller('NavController', [
  '$scope',
  'LogFactory',
  '$modal',
  function($scope, LogFactory, $modal){

    var logger = LogFactory.getLogger('nav-controller');

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

    function launchModal(name, size, backdrop){
      size = size || 'sm';
      backdrop = backdrop !== undefined ? backdrop : 'static';

      var titleCaseName = titleCase(name);
      return function(){

        var modalInstance = $modal.open({
          templateUrl: '/templates/popups/' + name,
          controller: titleCaseName + 'PopupController',
          size: size,
          backdrop: backdrop
        });

        modalInstance.result.then(function () {
          logger.debug('Modal ok with', arguments);
        }, function () {
          logger.debug('Modal dismissed at: ' + new Date());
        });
      };
    }

    $scope.open = launchModal('open');
    $scope.copy = launchModal('copy');
    $scope['new'] = launchModal('new');
    $scope.archive = launchModal('archive');
    $scope.delete = launchModal('delete');
    $scope.questionInformation = launchModal('question-information', 'lg');
    $scope.help = launchModal('help', 'lg', false);

  }
]);

angular.module('corespring-editor.controllers')
  .directive('modalWindow', function(){
    return {
      restrict: 'EA',
      link: function(scope, element) {
        console.log('.>>>>>>>', element);
        element.draggable({
          handle: '.modal-header',
          opacity: 0.7,
          cursor: 'move'
        });
        element.find('.modal-content').resizable();
      }
    };
  });
