angular.module('corespring-editor.services')
  .service('ComponentPopups', [
    '$modal',
    'LogFactory',
    'DesignerService',
    function($modal, LogFactory, DesignerService) {

      var logger = LogFactory.getLogger('component-popups');

      function componentTemplate(title, content){

        var header = [
          '<div class="modal-header">',
          '  <button class="close" type="button" ng-click="closeModal(\'close\')">',
          '    <span>&times;</span>',
          '    <span class="sr-only">Close</span>',
          '  </button>',
          '  <h4 class="modal-title">' + title + '</h4>',
          '</div>'].join('\n');

        var footer = [
          '<div class="modal-footer right">',
          ' <button class="btn btn-default" type="button" ng-click="closeModal(\'done\')">Done</button>',
          '</div>'
        ].join('\n');

        return [
        header, 
        '<div class="modal-body">',
        content,
        '</div>',
        footer
        ].join('\n');
      }

      function ComponentPopups() {

        function tag(name,attributes){
          var result = [];
          result.push('<' + name);
          _.forEach(attributes, function(value, key){
            result.push(' ' + key + '="' + value + '"');
          });
          result.push('></' + name + '>');
          return result.join('');
        }

        function launchModal($scope, id, model, config){
          var tagName = model.componentType + '-config';

          function launchDialog(title) {
            var body =
              ['  <div class="config-panel-container" navigator="">',
                  '    ' + tag(tagName, {id: id}),
                '  </div>'].join('\n');

            $scope.closeModal = function(action){
              $scope.$broadcast("closeModal", {action:action});
              this.$dismiss();
            };

            return $modal.open({
              template: componentTemplate(title, body),
              scope: $scope,
              controller: function(){},
              size: 'lg',
              backdrop: 'static',
              resolve: {
              }
            });
          }

          function titleFromModel(model) {
            return _.isEmpty(model.title) ? model.name || 'no title provided' : model.title;
          }

          DesignerService.loadAvailableUiComponents(
            function success(components) {
              function findComponent(componentType){
                var component = _(components.interactions, components.widgets).flatten().find(function (component) {
                  return component.componentType === componentType;
                });
                return component;
              }
              function getTitle(model) {
                var component = findComponent(model.componentType);
                return (component && component.title) ? component.title : titleFromModel(model);
              }

              launchDialog(getTitle(model));
            },
            function failure() {
              launchDialog(titleFromModel(model));
            }
          );

          $scope.data = _.cloneDeep(config);

        }

        this.launch = function($scope, id, model, config) {
          logger.debug('launch popup based on node: ', id, model, config);
          launchModal($scope, id, model, config);
        };
      }

      return new ComponentPopups();
    }
  ]);
