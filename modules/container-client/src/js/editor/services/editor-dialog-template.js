angular.module('corespring-editor.services')
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

			this.generate = function(title, content, header, footer) {

				header = header || this.header(title);
				footer = footer || this.footer();

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
