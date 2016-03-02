/* global MathJax */
angular.module('corespring-editing.wiggi-wiz-features.mathjax').directive('mathjaxDialog', [
  '$log',
  '$timeout',
  'MathFormatUtils',
  'MathJaxService',
  function($log, $timeout, MathFormatUtils, MathJaxService) {

    var log = $log.debug.bind($log, '[mathjax-dialog]');

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

      var renderPreview = _.debounce(function(math){
          log('renderPreview');
          $element.find('.preview-body').html(math);
          var $math = $element.find('.preview-body');
          MathJaxService.parseDomForMath(0, $math[0]);
          $('.math-textarea').focus();
        }, 200, {leading: false, trailing: true});

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
      templateUrl: '/editing/wiggi-wiz-features/mathjax/mathjax-dialog.html',
    };
  }
]);
