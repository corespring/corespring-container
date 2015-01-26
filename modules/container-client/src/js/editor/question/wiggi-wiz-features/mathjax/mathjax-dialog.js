/* global MathJax */
angular.module('corespring.wiggi-wiz-features.mathjax').directive('mathjaxDialog', [
  '$log',
  '$timeout',
  'MathFormatUtils',
  function($log, $timeout, MathFormatUtils) {

    var log = $log.debug.bind($log, '[mathjax-dialog]');

    var content = [
      'Use this window to add a math equation for your item.',
      'Do this by authoring some math text in <a href="http://en.wikipedia.org/wiki/MathML" target="_blank">MathML</a>',
      ' or <a href="http://en.wikipedia.org/wiki/LaTeX" target="_blank">LaTex</a> format in the window below.',
      'If you need help authoring text, <a href="http://www.wiris.com/editor/demo/en/mathml-latex.html" target="_blank">this website</a> can help.',
    ].join(' ');


    function radio(t, label, ngModel) {
      return [
        '<label class="radio-inline">',
        '  <input ng-disabled="mathType == \'MathML\'" type="radio" group="mathType" ng-model="' + ngModel + '" value="' + t + '"> ' + label,
        '</label>'
      ].join('\n');
    }

    function link($scope, $element, $attrs, ngModel) {

      $scope.mathType = '?';

      log(ngModel);

      $scope.triggerUpdate = function() {
        log('triggerUpdate');
        updateModel();
      };

      function updateUI() {
        log('updateUI');
        var unwrapped = unwrapMath(ngModel.$viewValue);
        var info = MathFormatUtils.getMathInfo(ngModel.$viewValue);
        $scope.mathType = info.mathType;
        $scope.displayType = info.displayMode;
        $scope.preppedMath = unwrapped;
        renderPreview(ngModel.$viewValue);
      }

      function renderPreview(math) {
        log('renderPreview');
        $element.find('.preview-body').html(math);
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, $element.find('.preview-body')[0]]);
      }

      function updateModel() {
        log('updateModel');
        var info = MathFormatUtils.getMathInfo($scope.preppedMath);
        $scope.mathType = info.mathType;
        var prepped = wrapMath($scope.preppedMath, $scope.mathType);
        ngModel.$setViewValue(prepped);
        renderPreview(prepped);
      }

      ngModel.$render = updateUI;

      function wrapMath(text, mathType) {

        if (!text || _.isEmpty(text)) {
          return '';
        }

        if (mathType === 'MathML') {
          return text;
        } else {
          return MathFormatUtils.wrapLatex(text, $scope.displayType);
        }
      }

      function unwrapMath(text) {
        var info = MathFormatUtils.getMathInfo(text);
        return info.mathType === 'LaTex' ? MathFormatUtils.unwrapLatex(text) : text;
      }

      $scope.$watch('displayType', function() {
        updateModel();
      });

      $scope.$watch('preppedMath', function(n) {
        updateModel();
        updateUI();
      });

      $scope.showDisplayMode = function() {
        return $scope.preppedMath && !_.isEmpty($scope.preppedMath);
      };
    }
    return {
      restrict: 'E',
      link: link,
      require: 'ngModel',
      replace: true,
      template: [
        '<div class="mathjax-dialog-root">',
        '  <div class="header">',
        '    <div class="mj-dialog-content">' + content + '</div>',
        '  </div>',
        '  <div class="mj-math-type" ng-show="showDisplayMode()">',
        '    <form  class="form-inline">Display mode for {{mathType}}:',
        '      <span ng-show="mathType == \'LaTex\'"  class="display-type">',
        radio('inline', 'Inline', 'displayType'),
        radio('block', 'Block', 'displayType'),
        '      </span>',
        '      <span ng-show="mathType == \'MathML\'" class="display-type">',
        '        Block',
        '      </span>',
        '    </form>',
        '  </div>',
        '  <div class="math-preview">',
        '     <div class="preview-label">Preview</div>',
        '     <div class="preview-body"></div>',
        '  </div>',
        '  <textarea class="math-textarea" ng-model="preppedMath" placeholder="Enter MathML or LaTex here..."></textarea>',
        '</div>'
      ].join('\n')
    };
  }
]);
