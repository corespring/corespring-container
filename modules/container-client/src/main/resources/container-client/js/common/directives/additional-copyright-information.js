angular.module('corespring-common.directives').directive('additionalCopyrightInformation', [
  'DataQueryService',
  function(DataQueryService) {
    return {
      restrict: 'E',
      scope: {
        copyrights: '=',
        prompt: '@'
      },
      replace: true,
      link: function($scope) {

        $scope.hasCopyrightItems = function() {
          return $scope.copyrights && $scope.copyrights.length > 0;
        };

        $scope.$watch('copyrights', function() {
          $scope.required = $scope.hasCopyrightItems() ? 'yes' : 'no';
        });

        $scope.addCopyrightItem = function() {
          $scope.copyrights.push({});
        };

        $scope.removeCopyrightItem = function(item) {
          var index = $scope.copyrights.indexOf(item);
          if (index >= 0) {
            $scope.copyrights.splice(index, 1);
            if ($scope.copyrights.length === 0) {
              $scope.required = 'no';
            }
          }
        };

        $scope.clearCopyrightItems = function() {
          $scope.copyrights.splice(0);
        };

        $scope.copyrightYearDataProvider = _.range(new Date().getFullYear(), 1939, -1);

        DataQueryService.list("licenseTypes", function(result) {
          $scope.licenseTypeDataProvider = result;
        });

        DataQueryService.list("mediaType", function(result) {
          $scope.mediaTypeDataProvider = result;
        });

        $scope.getLicenseTypeUrl = function(licenseType) {
          return licenseType ? "/assets/images/licenseTypes/" + licenseType.replace(" ", "-") + ".png" : undefined;
        };

        $scope.$watch("required", function(newValue, oldValue) {
          if (newValue === oldValue) {
            return;
          }
          if (newValue === 'yes') {
            if (!$scope.hasCopyrightItems()) {
              $scope.addCopyrightItem();
            }
          } else {
            $scope.clearCopyrightItems();
          }
        });

      },
      template: [
        '<fieldset>',
        '  <p>{{prompt}}</p>',
        '  <div class="control-group" style="padding-left: 5px;">',
        '    <div class="controls">',
        '      <label>',
        '        <input type="radio" ng-model="required" value="yes" style="margin-right: 5px;"> Yes',
        '      </label>',
        '      <label>',
        '        <input type="radio" ng-model="required" value="no" style="margin-right: 5px; margin-left: 20px;"> No',
        '      </label>',
        '    </div>',
        '    <div class="item" ng-repeat="item in copyrights">',
        '      <p>Please complete the following</p>',
        '      <table>',
        '        <tr>',
        '          <td class="label-col">',
        '            <label class="control-label" for="ac-author">Author</label>',
        '          </td>',
        '          <td>',
        '            <input id="ac-author" class="form-control" ng-model="item.author" ',
        '              placeholder="Enter author\'s name..."/>',
        '          </td>',
        '        </tr>',
        '        <tr>',
        '          <td class="label-col">',
        '            <label class="control-label" for="ac-owner">Copyright Owner</label>',
        '          </td>',
        '          <td>',
        '            <input id="ac-owner" class="form-control" ng-model="item.owner"',
        '              placeholder="Enter the copyright owner..."/>',
        '          </td>',
        '        </tr>',
        '        <tr>',
        '          <td class="label-col">',
        '            <label class="control-label" for="ac-year">Copyright Year</label>',
        '          </td>',
        '          <td>',
        '            <select id="ac-year" ng-model="item.year" ng-options="c for c in copyrightYearDataProvider"',
        '              style="width: 170px;"/>',
        '          </td>',
        '        </tr>',
        '        <tr>',
        '          <td class="label-col">',
        '            <label class="control-label" for="ac-license">License</label>',
        '          </td>',
        '          <td>',
        '            <table class="license">',
        '              <tr>',
        '                <td>',
        '                  <select id="ac-license" ng-model="item.licenseType"',
        '                    ng-options="c.key as c.value for c in licenseTypeDataProvider"/>',
        '                </td>',
        '                <td>',
        '                  <span ng-show="!item.licenseType" style="color: #888; font-style: italic;">Not Assigned</span>',
        '                  <img ng-chow="item.licenseType" ng-src="{{getLicenseTypeUrl(item.licenseType)}}"/>',
        '                </td>',
        '                <td>',
        '                  <a href="http://creativecommons.org/licenses/" target="_blank">Learn More</a>',
        '                </td>',
        '              </tr>',
        '            </table>',
        '          </td>',
        '        </tr>',
        '        <tr>',
        '          <td class="label-col">',
        '            <label class="control-label" for="ac-media-type">Media Type</label>',
        '          </td>',
        '          <td>',
        '            <select id="ac-media-type" ng-model="item.mediaType"',
        '              ng-options="c.key as c.value for c in mediaTypeDataProvider"/>',
        '          </td>',
        '        </tr>',
        '        <tr>',
        '          <td class="label-col">',
        '            <label class="control-label" for="ac-source-url">Website</label>',
        '          </td>',
        '          <td>',
        '            <input id="ac-source-url" class="form-control" ng-model="item.sourceUrl"',
        '              placeholder="Enter the URL...">',
        '          </td>',
        '        </tr>',
        '      </table>',
        '      <div style="padding-top: 5px; margin-left: 350px">',
        '        <a ng-click="removeCopyrightItem(item)">Remove additional copyright',
        '      </div>',
        '    </div>',
        '    <a class="add-additional" ng-click="addCopyrightItem()" ng-show="required">',
        '      <i class="fa fa-plus-square-o" style="margin-left: 6px; margin-right: 6px;"/>',
        '      <span>Add more</span>',
        '    </a>',
        '  </div>',
        '</fieldset>'
      ].join('\n')
    };
  }
]);