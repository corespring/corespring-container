angular.module('corespring-editing.services')
  .service('EditorDialogTemplate', [function() {

    function EditorDialogTemplate() {

      this.header = function(title) {
        return [
          '<div class="modal-header">',
          '  <button class="close" type="button" ng-click="cancel()">',
          '    <span>&times;</span>',
          '    <span class="sr-only">Close</span>',
          '  </button>',
          '  <h4 class="modal-title">' + title + '</h4>',
          '</div>'
        ].join('\n');
      };

      this.footer = function() {
        return [
          '<div class="modal-footer right">',
          ' <button class="btn btn-default" type="button" ng-click="ok(data)">Done</button>',
          '</div>'
        ].join('\n');
      };

      function isNullOrUndefined(v){
        return _.isNull(v) || _.isUndefined(v);
      } 
      
      this.generate = function(title, content, header, footer) {

        header = isNullOrUndefined(header) ? this.header(title) : header;
        footer = isNullOrUndefined(footer) ? this.footer() : footer;

        return [
          header,
          '<div class="modal-body">',
          content,
          '</div>',
          footer
        ].join('\n');
      };
    }

    return new EditorDialogTemplate();
  }]);
