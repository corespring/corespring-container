angular.module('corespring-editing.wiggi-wiz-features.mathjax').factory('WiggiMathJaxFeatureDef', [
  'MathJaxService',
  'MathFormatUtils',
  '$rootScope',
  '$log',
  '$timeout',

  function (MathJaxService, MathFormatUtils, $rootScope, $log, $timeout) {
    function MathInputWiggiFeatureDef() {
      this.name = 'mathjax';
      this.attributeName = 'mathjax';
      this.iconclass = 'fa math-sum';
      this.insertInline = true;
      this.addToEditor = '<div mathinput-holder-init></div>';
      this.compile = true;
      this.draggable = true;
      this.initialise = function ($node, replaceWith) {
        var preContent = $node.html();
        var content = preContent;
        if (!/<math.*?>/gi.test(preContent)) {
          content = $node.text();
        }
        var isNew = $node[0].outerHTML.indexOf('mathinput-holder-init') >= 0;
        content = content.replace(/\\\(/gi, '').replace(/\\\)/gi, '');
        var encodedContent = btoa(content);
        var newNode = $([
          '<div mathinput-holder="" show-remove-button="true" class="mathinput-holder">',
          '<math-input parent-selector=".wiggi-wiz, .config-panel-body" show-code-button="true" fix-backslash="false" editable="true" keypad-auto-open="' + isNew + '" keypad-type="\'basic\'" ng-model="expr" code-model="code" expression-encoded="' + encodedContent + '"></math-input>',
          '</div>'
        ].join(''));

        MathJaxService.parseDomForMath(10);
        return replaceWith(newNode);
      };

      this.registerChangeNotifier = function (notifyEditorOfChange, node) {
        var scope = node.scope() && node.scope().$$childHead;
        if (scope) {
          var updateFn = function (a, b) {
            if (a && b && a !== b) {
              notifyEditorOfChange();
            }
          };
          let modelWatch = scope.$watch('ngModel', updateFn);
          let codeWatch = scope.$watch('code', updateFn);

          scope.$on('$destroy', function() {
            modelWatch();
            codeWatch();
          });
        }
      };

      this.onClick = function ($node, $nodeScope, editor) {
        $node.find('.mq').find('textarea').blur();
        $timeout(function () {
          $node.find('.mq').find('textarea').focus();
        }, 1);
      };

      this.getMarkUp = function ($node, $scope) {
        var expr;
        if ($scope.code) {
          expr = $scope.code;
        } else {
          expr = $scope.expr || '';
          expr = expr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }
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