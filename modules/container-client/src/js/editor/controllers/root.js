angular.module('corespring-editor.controllers')
	.controller('Root', [
		'$scope',
		'$state',
		'ComponentRegister',
		'ConfigurationService',
		'ItemService',
		'LogFactory',
		'Msgr',
		'WiggiDialogLauncher',
		'EditorDialogTemplate',
		'WIGGI_EVENTS',
		function(
			$scope,
			$state,
			ComponentRegister,
			ConfigurationService,
			ItemService,
			LogFactory,
			Msgr,
			WiggiDialogLauncher,
			EditorDialogTemplate,
			WIGGI_EVENTS) {

			"use strict";

			var $log = LogFactory.getLogger('RootController');

			function preprocessComponents(item) {
				_.each(item.components, function(c, key) {
					var serverLogic = corespring.server.logic(c.componentType);
					if (serverLogic.preprocess) {
						//TODO: This is part of a larger task to add preprocess to the container
						//@see: https://thesib.atlassian.net/browse/CA-842
						item.components[key] = serverLogic.preprocess(c);
					}
				});
			}

			function findLastId(item) {
				var max = 0;
				$('<div>' + item.xhtml + '</div>').find('[id]').each(function(idx,
					element) {
					var id = Number($(element).attr('id'));
					if (id > max) {
						max = id;
					}
				});
				return max;
			}

			$scope.$on('deleteSupportingMaterial', function(event, data) {

				function showFirstItem() {
					$state.transitionTo('supporting-materials', {
						index: 0
					}, {
						reload: true
					});
				}

				function deleteSupportingMaterial(index) {
					$scope.item.supportingMaterials.splice(index, 1);

					ItemService.saveSupportingMaterials($scope.item.supportingMaterials,
						function() {},
						$scope.onSaveError, $scope.itemId
					);
				}

				var confirmationMessage = [
					"You are about to delete this file.",
					"Are you sure you want to do this?"
				].join('\n');

				if (window.confirm(confirmationMessage)) {
					showFirstItem();
					deleteSupportingMaterial(data.index);
				}
			});

			function onLaunchDialog($event, data, title, body, callback, scopeProps, options) {
				var dialog = new WiggiDialogLauncher($event.targetScope);
				var header = options.omitHeader ? '' : null;
				var footer = options.omitFooter ? '' : null;
				var content = EditorDialogTemplate.generate(title, body, header, footer);
				dialog.launch(data, content, callback, scopeProps, options);
			}

			$scope.$on(WIGGI_EVENTS.LAUNCH_DIALOG, onLaunchDialog);

			$scope.onItemLoadSuccess = function(item) {
				$scope.item = item;
				preprocessComponents(item);
				$scope.lastId = findLastId(item);
				$scope.$broadcast('itemLoaded', item);
			};

			$scope.onItemLoadError = function(err) {
				$log.error('error loading', err);
			};

			ItemService.load($scope.onItemLoadSuccess, $scope.onItemLoadError);

			//----------------------------------------------------------------
			// startup
			//----------------------------------------------------------------

			function isInIframe() {
				/** note use != to support ie8 instead of !== */
				return top != window; // jshint ignore:line
			}

			if (isInIframe()) {
				Msgr.on('initialise', function(data) {
					$log.log('on initialise', data);
					ConfigurationService.setConfig(data);
					Msgr.send('rendered');
				});

				//send msg "ready" to instance
				//this will result in msg "initialise" being sent back to us
				$log.log('sending ready');
				Msgr.send('ready');
			} else {
				ConfigurationService.setConfig({});
			}
		}
	]);
