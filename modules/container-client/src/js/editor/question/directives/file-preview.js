(function () {

  "use strict";

  var uiAce = function(n){
    return '<div ui-ace ng-model="'+n+'" ui-ace="{useWrapMode : true}"></div>';
  };

  var link =  function($compile, $timeout){
      return function ($scope, $elem, attrs) {

        $scope.$watch('selectedFile', function(newFile){

          if(!newFile){
            return;
          }

          var newElem;
          if(newFile.contentType === "text/javascript"){
            newElem = $elem.find("#contents").html( uiAce("selectedFile.content") );
          } else {
            newElem = $elem.find("#contents").html('<img ng-src="{{selectedFile.name}}"></img>');
          }
          $timeout(function(){
            $compile(newElem)($scope);
          });
        });
    };
  };

  angular.module('corespring-editor.directives').directive('filePreview', [
    '$compile', '$timeout', function ($compile, $timeout) {
      var def;
      def = {
        link: link($compile, $timeout),
        restrict: 'E',
        replace: true,
        scope: {
          selectedFile: '=ngModel'
        },
        template: [
          '<div class="file-preview">',
          '  <h1>File Preview {{ selectedFile.name}} </h1>',
          '  <div id=contents></div>',
          '</div>'
        ].join('')
      };
      return def;
    }
  ]);
}).call(this);