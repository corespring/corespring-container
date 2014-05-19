/* global MathJax */
angular.module('corespring.wiggi-wiz-features').directive('mathjaxDialog', [

  function() {
    var content = [
      'Use this window to add a math equation for your item.',
      'Do this by authoring some mathe text in MathML or LaTex format in the window below.',
      'If you need help authoring text, go to <a href="http://www.wiris.com/editor/demo/en/mathml-latex.html" target="_blank">this website</a> to author some text.',
    ].join(' ');


    function radio(t, label, ngModel) {
      return [
        '<label class="radio-inline">',
        '  <input type="radio" group="mathType" ng-model="' + ngModel + '" value="' + t + '"> ' + label,
        '</label>'
      ].join('\n');
    }

    function link($scope, $element) {



      $scope.$watch('data.originalMarkup', function(n) {

        if (n) {
          $element.find('.math-preview').html(n);
          MathJax.Hub.Queue(['Typeset', MathJax.Hub, $element.find('.math-preview')[0]]);
        }
      });
    }
    return {
      restrict: 'E',
      link: link,
      replace: true,
      template: [
        '<div class="mathjax-dialog-root">',
        '  <div class="header">',
        '    <div class="mj-dialog-title">Enter Math</div>',
        '    <div class="mj-dialog-content">' + content + '</div>',
        '    <div class="mj-math-type">',
        '      <form class="form-inline">I\'m adding: ',
        radio('mathml', 'MathML', 'mathType'),
        radio('latex', 'LaTex', 'mathType'),
        '      <span ng-show="mathType == \'latex\'" class="display-type">',
        '[',
        radio('inline', 'Inline', 'latexDisplayType'),
        radio('block', 'Block', 'latexDisplayType'),
        ']',
        '      </span>',
        '      </form>',
        '    </div>',
        '  </div>',
        '<div class="editor">',
        ' <textarea ng-model="data.originalMarkup"></textarea>',
        '</div>',
        '<div class="math-preview">',
        '</div>',
        '</div>'
      ].join('\n')
    };
  }
]);