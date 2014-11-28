/** 
 * TODO: see:  http://missdemilo.com/cs/des-12/
 */
angular.module('corespring-editor.directives').directive('expander', [
  'LogFactory',
  function(LogFactory){
    var logger = LogFactory.getLogger('expander');
    function link($scope, $element, $attrs){
      logger.debug('link!');
    }

    return {
      restrict: 'E',
      link: link,
      scope: {
        title: '@'
      },
      template: '<div class="expander">{{title}}</div>',
      replace: true
    };
  }
  ]);