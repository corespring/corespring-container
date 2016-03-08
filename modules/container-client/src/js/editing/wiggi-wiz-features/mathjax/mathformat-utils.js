angular.module('corespring-editing.wiggi-wiz-features.mathjax').service('MathFormatUtils', ['$log',
  function($log) {

    function MathFormatUtils() {

      var log = $log.debug.bind($log, '[math-format-utils]');

      function getLatexDisplayType(math) {
        var inline = /\s*\\\((.*)\\\)/g;
        log('getLatexDisplayType: inline: ', inline.test(math));
        var out = /\s*\\\([\s\S]*\\\)/g.test(math) ? 'inline' : 'block';
        log('getLatexDisplayType out: ', out);
        return out;
      }

      function getBaseInfo(text) {
        var out = {
          mathType: 'unknown',
          errors: undefined
        };

        if (!text || _.isEmpty(text)) {
          return out;
        }

        if (/\s*?<math.*?>/.test(text)) {
          var xml = new DOMParser().parseFromString(text, 'application/xml');
          var hasErrors = xml.getElementsByTagName('parsererror').length > 0;
          log('errors? ', hasErrors);
          out.mathType = 'MathML';
          out.errors = hasErrors;
          return out;
        } else {
          out.mathType = 'LaTex';
          return out;
        }
      }


      /**
       * return { mathType: 'MathML|LaTex', displayMode: 'inline|block'}
       */
      this.getMathInfo = function(mathString) {
        var info = getBaseInfo(mathString);

        if (info.mathType === 'unknown') {
          return _.extend(info, {
            displayMode: 'unknown'
          });
        }

        var display = (info.mathType === 'LaTex') ? getLatexDisplayType(mathString) : 'block';

        return _.extend(info, {
          displayMode: display
        });
      };


      this.unwrapLatex = function(text) {
        return text
          .replace(/\\[\[|\(]/g, '')
          .replace(/\\[\]|\)]/g, '');
      };

      this.wrapLatex = function(text, displayMode) {
        return displayMode === 'block' ? '\\[' + text + '\\]' : '\\(' + text + '\\)';
      };

    }

    return new MathFormatUtils();
  }
]);