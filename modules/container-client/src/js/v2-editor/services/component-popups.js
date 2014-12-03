angular.module('corespring-editor.services').controller('ComponentPopupController', ['$scope', function($scope){

}]);
angular.module('corespring-editor.services')
  .service('ComponentPopups', [
    '$modal',
    'LogFactory',
    function($modal, LogFactory) {

      var logger = LogFactory.getLogger('component-popups');

      function ComponentPopups() {

        function tag(name,attributes){
          var result = [];
          result.push('<' + name);
          for(var prop in attributes){
            result.push(' ' + prop + '="' + attributes[prop] + '"');
          }
          result.push('></' + name + '>');
          return result.join('');
        }

        function launchModal(id, model){
          var tagName = model.componentType + '-config';
          var modalInstance = $modal.open({
            template: '<div>' + tag(tagName, {id: id}) +'</div>',
            controller: 'ComponentPopupController',
            size: 'lg',
            backdrop: 'static',
            resolve: {}
          });
        }

        this.launch = function(id, model){
          logger.debug('launch popup based on node: ', id, model);
          launchModal(id, model);
        };
      }

      return new ComponentPopups();
    }
  ]);
