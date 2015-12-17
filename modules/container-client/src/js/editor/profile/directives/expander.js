/** 
 * TODO: see:  http://missdemilo.com/cs/des-12/
 */
angular.module('corespring-editor.profile.directives').directive('expander', [
  'LogFactory',
  function(LogFactory){
    var logger = LogFactory.getLogger('expander');
    return {
      restrict: 'E',
      scope: {
        title: '@'
      },
      template: '<div class="expander">{{title}}</div>',
      replace: true
    };
  }
  ]);