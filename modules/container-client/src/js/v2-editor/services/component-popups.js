angular.module('corespring-editor.services')
  .controller(
    'ComponentPopupController',
    ['$scope',
      function($scope){

   }
  ]);

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

        function getTitle(component) {
          return _.isEmpty(component.title) ? component.name : component.title;
        }

        function launchModal($scope, id, model){
          var tagName = model.componentType + '-config';


          var content = [
            '<div class="modal-header">',
            '  <button class="close" type="button" ng-click="$dismiss()">',
            '    <span>&times;</span>',
            '    <span class="sr-only">Close</span>',
            '  </button>',
            '  <h4 class="modal-title">' + getTitle(model) + '</h4>',
            '</div>',
            '<div class="modal-body">',
            '  <div class="config-panel-container" navigator="">',
            '    ' + tag(tagName, {id: id}),
            '  </div>',
            '</div>',
            '<div class="modal-footer right">',
            ' <button class="btn btn-default" type="button" ng-click="$dismiss()">Done</button>',
            '</div>'
          ].join('\n');

          var modalInstance = $modal.open({
            template: content,
            scope: $scope,
            controller: 'ComponentPopupController',
            size: 'lg',
            backdrop: 'static',
            resolve: {}
          });
        }

        this.launch = function($scope, id, model){
          logger.debug('launch popup based on node: ', id, model);
          launchModal($scope, id, model);
        };
      }

      return new ComponentPopups();
    }
  ]);
