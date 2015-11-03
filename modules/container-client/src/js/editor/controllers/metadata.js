angular.module('corespring-editor.controllers')
  .controller('MetadataController', [
    '$scope',
    '$element',
    '$timeout',
    '$sce',
    '$window',
    'MessageBridge',
    'MetadataService',
    function($scope, $element, $timeout, $sce, $window, MessageBridge, MetadataService) {
      console.log("Jenoke: ", $scope.item);
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
          console.log("request metadata");
          sendMessage({
            type: 'currentMetadata',
            message: $scope.item.profile.taskInfo.extended[$scope.selectedMetadata.metadataKey]
          }, target);
        }
        if (msgType == 'updateMetadata') {
          var metadata = msg.data.message;
          console.log("update metadata ", metadata);
        }
      }, window.top);
      $scope.selectedMetadataUrl = "";
      $scope.selectMetadata = function(s) {
        $scope.selectedMetadataUrl = $sce.trustAsResourceUrl(s.editorUrl);
        $scope.selectedMetadata = s;
      };
      MetadataService.get($scope.item.itemId).then(function(result) {
        console.log("jo", result);
        $scope.metadataSets = result;
      });
    }
  ]
);