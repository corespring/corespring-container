angular.module('corespring-dev-editor.services')
  .service('Flash',
    function() {
      function template(msg, cls) {
        return [
          '<div class="flash alert ' + cls + '">',
          '  <p>' + msg + '</p>',
          '</div>'
        ].join('\n');
      }

      function showFlash(msg, cls) {
        var $alert = $(template(msg, cls));
        $alert.hide();
        $alert.appendTo('body');
        $alert.fadeIn(function() {
          setTimeout(function() {
            $alert.fadeOut(function() {
              $alert.remove();
            });
          }, 2000);
        });
      }

      function Flash() {
        this.info = function(msg) {
          showFlash(msg, 'alert-success');
        };
        this.error = function(msg) {
          showFlash(msg, 'alert-danger');
        }
      }
      return new Flash();
    }
  );