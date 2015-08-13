  angular.module('corespring-common.supporting-materials.services')
    .service('SmUtils', [
      function() {

        function SmUtils() {

          this.mainFile = function(m) {
            return _.find(m.files, function(f) {
              return f.isMain === true;
            });
          };

          this.group = function(materialsList, groupByKey) {
            var keyMap = _.groupBy(materialsList, groupByKey);

            function toObject(k) {
              return {
                name: k,
                items: keyMap[k]
              };
            }

            return _(keyMap).keys().map(toObject).value();
          };
        }

        return new SmUtils();
      }
    ]);