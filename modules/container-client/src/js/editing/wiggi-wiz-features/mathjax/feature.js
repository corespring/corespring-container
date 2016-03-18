angular.module('corespring-editing.wiggi-wiz-features.mathjax').factory('WiggiMathJaxFeatureDef', [
  'MathJaxService',
  'MathFormatUtils',
  '$rootScope',
  '$log',

  function(MathJaxService, MathFormatUtils, $rootScope, $log) {
    function MathInputWiggiFeatureDef() {
      this.name = 'mathjax';
      this.attributeName = 'mathjax';
      this.iconclass = 'fa math-sum';
      this.insertInline = true;
      this.addToEditor = '<div mathinput-holder-init></div>';
      this.compile = true;
      this.draggable = true;
      this.initialise = function($node, replaceWith) {
        var content = $node.html() || '';
        var isNew = $node[0].outerHTML.indexOf('mathinput-holder-init') >= 0;
        content = content.replace(/\\\(/gi,'').replace(/\\\)/gi, '').replace(/\\/gi,'\\\\');
        var newNode = $([
          '<div mathinput-holder="" show-remove-button="true">',
          '<math-input parent-selector=".wiggi-wiz, .config-panel-body" show-code-button="true" fix-backslash="false" editable="true" keypad-auto-open="' + isNew + '" keypad-type="\'basic\'" ng-model="expr" code-model="code" expression="\'' + content + '\'"></math-input>',
          '</div>'].join(''));
        return replaceWith(newNode);
      };

      this.registerChangeNotifier = function(notifyEditorOfChange, node) {
        var scope = node.scope() && node.scope().$$childHead;
        if (scope) {
          var updateFn = function(a, b) {
            if (a && a !== b) {
              notifyEditorOfChange();
            }
          };
          scope.$watch('ngModel', updateFn);
          scope.$watch('code', updateFn);
        }
      };

      this.onClick = function($node, $nodeScope, editor) {
        $node.find('.mq').find('textarea').blur();
        setTimeout(function() {
          $node.find('.mq').find('textarea').focus();
        }, 1);
      };

      this.getMarkUp = function($node, $scope) {
        var expr = $scope.code || $scope.expr || '';
        var mathInfo = MathFormatUtils.getMathInfo(expr);
        var res;
        if (mathInfo.mathType === 'MathML') {
          res = '<span mathjax>' + (expr) + '</span>';
        } else {
          res = '<span mathjax>\\(' + (expr) + '\\)</span>';
        }
        return res;
      };
    }
    return MathInputWiggiFeatureDef;
  }
]);