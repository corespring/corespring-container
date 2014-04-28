(function () {

  angular.module('corespring-editor.services')
    .service('StandardQueryCreator',
    [
      '$log',
      StandardQueryCreator
    ]
  );

  function StandardQueryCreator($log) {

    this.createStandardQuery = function (searchText, subjectOption, categoryOption, subCategoryOption) {
      $log.debug("StandardQueryCreator.createStandardQuery", searchText, subjectOption, categoryOption, subCategoryOption);

      function createQuery(searchTerm, fields) {
        var result = {
          searchTerm: searchTerm,
          fields: fields
        };
        return result;
      }

      function isAllSelected(item) {
        return !item || !item.name || _.isString(item.name) && item.name.toLowerCase() === "all";
      }

      /**
       * Add key/value to filter if item.name is not empty and is not 'all'
       * Return true, if a filter has been added
       */
      function addFilterIfApplicable(item, query, field) {
        if (isAllSelected(item)) {
          return false;
        }
        query.filters = query.filters || [];
        query.filters.push({field: field, value: item.name});
        return true;
      }

      var fields = ['dotNotation', 'category', 'subCategory', 'standard'];

      if (isAllSelected(subjectOption)) {
        return createQuery(searchText, ['subject'].concat(fields));
      }

      var query = createQuery(searchText, fields);

      if (addFilterIfApplicable(subjectOption, query, "subject")) {
        if (addFilterIfApplicable(categoryOption, query, "category")) {
          addFilterIfApplicable(subCategoryOption, query, "subCategory");
        }
      }

      return query;
    };

  }

})();


