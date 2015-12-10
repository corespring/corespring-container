angular.module('corespring-editor.controllers')
  .controller('MetadataController', [
    '$log',
    '$scope',
    '$element',
    '$timeout',
    '$sce',
    '$window',
    'MessageBridge',
    'MetadataService',
    'EditorChangeWatcher',
    'ItemService',
    function($log, $scope, $element, $timeout, $sce, $window, MessageBridge, MetadataService, EditorChangeWatcher, ItemService) {

      var addMessageListener = function(fn, host) {
        var eventMethod = host.addEventListener ? "addEventListener" : "attachEvent";
        var eventer = host[eventMethod];
        var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
        eventer(messageEvent, function(e) {
          fn(e);
        }, false);
      };
      var $iframe = $element.find('iframe');
      var target = $iframe[0].contentWindow;
      var sendMessage = function(msg, host) {
        host.postMessage(msg, "*");
      };


      addMessageListener(function(msg) {
        var msgType = msg && msg.data && msg.data.type;
        if (msgType == 'requestMetadata') {
          $log.debug("requesting metadata");
          sendMessage({
            type: 'currentMetadata',
            message: $scope.item.profile.taskInfo.extended[$scope.selectedMetadata.metadataKey]
          }, target);
        }
        if (msgType == 'updateMetadata') {
          var metadata = msg.data.message;
          $log.debug("updating metadata", metadata);
          $scope.item.profile.taskInfo.extended = $scope.item.profile.taskInfo.extended || {};
          $scope.item.profile.taskInfo.extended[$scope.selectedMetadata.metadataKey] = metadata;
        }
      }, window.top);

      $scope.saveProfile = function(){
        $log.log("saving profile due to metadata change");
        ItemService.saveProfile($scope.item.profile, function(result) {
          $log.log("profile saved result:", result);
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
      MetadataService.get($scope.item.itemId).then(function(result) {
        $scope.metadataSets = result;
        $scope.metadataSets.push(_.cloneDeep($scope.metadataSets[0]));
      });
    }
  ]
);