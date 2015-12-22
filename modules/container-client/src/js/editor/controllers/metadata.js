angular.module('corespring-editor.controllers')
  .controller('MetadataController', [
    '$scope',
    '$element',
    '$timeout',
    '$sce',
    '$window',
    '$stateParams',
    'MsgrMessageListener',
    'LogFactory',
    'EditorChangeWatcher',
    'ItemService',
    function($scope, $element, $timeout, $sce, $window, $stateParams, MsgrMessageListener, LogFactory, EditorChangeWatcher, ItemService) {

      var $log = LogFactory.getLogger('MetadataController');

      var $iframe = $element.find('iframe');
      var target = ($iframe.length > 0 && $iframe[0].contentWindow) || $window.top;
      var sendMessage = function(msg, host) {
        host.postMessage(msg, "*");
      };

      var messageListener = new MsgrMessageListener($window.top);
      messageListener.add(function(msg) {
        var msgType = msg && msg.data && msg.data.type;
        if (msgType == 'requestMetadata') {
          $log.debug("requesting metadata");
          var extended = $scope.item.profile.taskInfo && $scope.item.profile.taskInfo.extended;
          var message = extended && extended[$scope.selectedMetadata.metadataKey];
          if (message) {
            sendMessage({
              type: 'currentMetadata',
              message: message
            }, target);
          }
        }
        if (msgType == 'updateMetadata') {
          var metadata = msg.data.message;
          $log.debug("updating metadata", metadata);
          $scope.item.profile.taskInfo.extended = $scope.item.profile.taskInfo.extended || {};
          $scope.item.profile.taskInfo.extended[$scope.selectedMetadata.metadataKey] = metadata;
        }
      }, $window.top);

      $scope.saveProfile = function(){
        $log.debug("saving profile due to metadata change");
        ItemService.saveProfile($scope.item.profile, function(result) {
          $log.debug("profile saved result:", result);
        });
      };

      $scope.$watch('item.profile.taskInfo.extended', EditorChangeWatcher.makeWatcher(
        'profile',
        $scope.saveProfile,
        $scope), true);

      $scope.selectedMetadataUrl = "";
      $scope.selectMetadata = function(s) {
        $scope.selectedMetadataUrl = $sce.trustAsResourceUrl(s.editorUrl);
        $scope.selectedMetadata = s;
      };

      var selected = _.find($scope.metadataSets, function(m) {
        return m.metadataKey === $stateParams.key;
      });
      if (selected) {
        $scope.selectMetadata(selected);
      }

    }
  ]
);