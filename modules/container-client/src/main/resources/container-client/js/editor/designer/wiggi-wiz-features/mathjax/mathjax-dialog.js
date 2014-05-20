/* global MathJax */
angular.module('corespring.wiggi-wiz-features').directive('mathjaxDialog', [
  '$log',
  function($log) {
    var log = $log.debug.bind($log, '[mathjax-dialog]');
    var content = [
      'Use this window to add a math equation for your item.',
      'Do this by authoring some math text in MathML or LaTex format in the window below.',
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


      $scope.triggerUpdate = function(){
        log('triggerUpdate');
        updateModel();

      };

      function updateUI() {
        log('updateUI');
        var unwrapped = unwrapMath(ngModel.$viewValue);
        $scope.mathType = getMathType(ngModel.$viewValue);
        $scope.displayType = $scope.mathType === 'MathML' ? 'block' : getLatexDisplayType(ngModel.$viewValue);
        $scope.preppedMath = unwrapped;
        renderPreview(ngModel.$viewValue);
      }

      function getLatexDisplayType(math){
        var inline = /\s*\\\((.*)\\\)/g;
        log('getLatexDisplayType: inline: ', inline.test(math));
        var out = /\s*\\\(.*\\\)/g.test(math) ? 'inline' : 'block';
        log('getLatexDisplayType out: ', out);
        return out;
      }

      function renderPreview(math){
        log('renderPreview');
        $element.find('.math-preview').html(math);
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, $element.find('.math-preview')[0]]);
      }

      function updateModel(){
        log('upadateModel'); 
        var prepped = wrapMath($scope.preppedMath);
        $scope.mathType = getMathType(ngModel.$viewValue);
        ngModel.$setViewValue(prepped);
        renderPreview(prepped);
      }

      ngModel.$render = updateUI;


      function wrapMath(text){
        var mathType = getMathType(text);
        if(mathType === 'MathML'){
          return text;
        } else {
          log('display type: ', $scope.displayType);
          var latexOut = $scope.displayType === 'block' ? '\\['+text+'\\]' : '\\('+text+'\\)';
          log(latexOut);
          return latexOut;
        }
      }


      function unwrapMath(text){

        var mathType = getMathType(text);

        if(mathType === 'LaTex'){
          return text
            .replace(/\\[\[|\(]/g, '')
            .replace(/\\[\]|\)]/g, '');
        } else {
          return text;
        }
      }

      function getMathType(text){
        if(!text || _.isEmpty(text)){
          $scope.mathType = '?';
        } else {
          var xml = new DOMParser().parseFromString(text, 'application/xml');
          if(xml.childNodes && xml.childNodes[0] && xml.childNodes[0].tagName === 'math'){
            return 'MathML';
          } else {
            return 'LaTex';
          }
        }
      }

      $scope.$watch('displayType', function(n) {
        if (n){
          updateModel();
        }
      });

      $scope.$watch('preppedMath', function(n) {
        if (n){
          updateModel();
        }
      });
    }
    return {
      restrict: 'E',
      link: link,
      require: 'ngModel',
      replace: true,
      template: [
        '<div class="mathjax-dialog-root">',
        '  <div class="header">',
        '    <div class="mj-dialog-title">Enter Math</div>',
        '    <div class="mj-dialog-content">' + content + '</div>',
        '  </div>',
        '  <div class="mj-math-type">',
        '    <form ng-disabled="mathType == \'MathML\'" class="form-inline">Display mode for {{mathType}}:',
        '      <span  class="display-type">',
        radio('inline', 'Inline', 'displayType'),
        radio('block', 'Block', 'displayType'),
        '      </span>',
        '    </form>',
        '  </div>',
        '<div class="editor">',
        ' <textarea class="math-textarea" ng-model="preppedMath"></textarea>',
        '</div>',
        '<div class="math-preview">',
        '</div>',
        '</div>'
      ].join('\n')
    };
  }
]);
