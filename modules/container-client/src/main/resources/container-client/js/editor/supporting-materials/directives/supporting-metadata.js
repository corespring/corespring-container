(function() {

  /**
   * Directive for updating the metadata (name and materialType) associated with supporting materials. The directive's
   * binding behaves differently based on whether or not you pass a 'persist' function as a parameter. If you pass a
   * persist function such as
   *
   *   <supportingmetadata ng-model="supportingMaterial" persist="save"></supportingmetadata>
   *
   * then the metadata will be one-way bound until the update button is clicked, which will trigger a validation and
   * then write the data back to the model on success. If there is no persist function defined such as
   *
   *   <supportingmetadata ng-model="supportingMaterial"></supportingmetadata>
   *
   * then the metadata will be two-way bound, and the caller is responsible for validation (probably using
   * SupportingMaterialService#validateMetadata).
   */
  angular.module('corespring-editor.directives').directive('supportingmetadata', ['SupportingMaterialsService',
    function(SupportingMaterialsService) {
      var otherType = 'Other';

      return {
        restrict: 'E',
        scope: {
          metadata: '=ngModel',
          persist: '=',
          bind: '@'
        },

        link: function($scope) {

          $scope.materialTypes = ['none selected', 'Rubric', 'Scoring Guide', 'Student Materials',
            'Student Work Examples', otherType
          ];

          function isOther() {
            return $scope.materialTypeProxy === otherType;
          }

          function getType() {
            function getOther() {
              return _.isEmpty($scope.textMaterialType) ? undefined : $scope.textMaterialType;
            }
            return isOther() ? getOther() : $scope.materialTypeProxy;
          }


          function updateMetadata() {
            $scope.metadata.name = $scope.title;
            $scope.metadata.materialType = getType();
          }

          $scope.$watch('title', function() {
            if ($scope.bind) {
              updateMetadata();
            }
          });

          $scope.$watch('materialType', function() {
            $scope.displayOther = isOther();
            if ($scope.bind) {
              updateMetadata();
            }
          });
          $scope.$watch('materialTypeProxy', function() {
            $scope.materialType = getType();
            if ($scope.bind) {
              updateMetadata();
            }
          });
          $scope.$watch('textMaterialType', function() {
            $scope.materialType = getType();
            if ($scope.bind) {
              updateMetadata();
            }
          });

          $scope.forceUpdate = function() {
            if (SupportingMaterialsService.validateMetadata({
              title: $scope.title,
              materialType: getType()
            }, window.alert)) {
              if ($scope.persist) {
                $scope.persist($scope.title, getType());
              }
            }
          };


          $scope.$watch('metadata', function() {
            $scope.init();
          });

          $scope.init = function() {
            $scope.bind = $scope.persist === undefined;
            if ($scope.metadata) {
              $scope.title = $scope.metadata.name;
              $scope.materialTypeProxy = $scope.metadata.materialType ?
                (_.contains($scope.materialTypes, $scope.metadata.materialType) ? $scope.metadata.materialType : otherType) :
                $scope.materialTypes[0];
              $scope.textMaterialType = isOther() ? $scope.metadata.materialType : undefined;
            }
            $scope.displayOther = isOther();
          };

          $scope.init();

          $scope.activeControl = "";

          $scope.setActiveCtrl = function(event){
            $scope.activeControl = event && event.target ? event.target : null;
          }

        },
        template: [
          '<form name="myForm" class="supporting-material-metadata my-form">',

          '  <div ng-class="{\'field\':true, \'has-error\':myForm.type.$error.required && activeControl.name==\'type\', \'has-success\':!myForm.type.$error.required}"> ',
          '    <label class="control-label" for="supporting-material-title">Title</label>',
          '    <span class="error" ng-show="myForm.type.$error.required" >required</span>',
          '    <input name="type" class="form-control" type="text" ng-model="title" ng-focus="setActiveCtrl($event)" ng-blur="setActiveCtrl(null)" }" required />',
          '  </div>',

          '  <div class="field">',
          '    <label for="supporting-material-type">Select Type</label>',
          '    <select ng-model="materialTypeProxy" ng-options="materialType for materialType in materialTypes"></select>',
          '  </div>',

          '  <div ng-class="{\'field\':true, \'other\':true, \'has-error\':myForm.others.$error.required && activeControl.name==\'others\', \'has-success\':!myForm.others.$error.required}" ng-show="displayOther" >',
          '    <label class="control-label" for="supporting-material-type-text">Other</label>',
          '    <span  class="error" ng-show="myForm.others.$error.required">required</span>',
          '    <input name="others" class="form-control"  type="text" ng-model="textMaterialType" ng-focus="setActiveCtrl($event)" ng-blur="setActiveCtrl(null)" required/>',
          '  </div>',

          '  <button class="btn btn-small" ng-show="persist" ng-click="forceUpdate()">Update</button>',
          '</form>'
        ].join('\n')
      };
    }
  ]);

})();