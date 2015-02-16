/* global MathJax */
angular.module('corespring-common.services')
  .service('ProfileFormatter', [

    function() {

      function ProfileFormatter() {

        /**
         * returns an array of strings indicating the type used and it's count: 'Multiple Choice (1)'
         * you can change the format by passing in a different format function with the signature
         * function format( name, count) -> String
         */
        this.componentTypesUsed = function(components, allComponentMetadata, formatFn) {

          function defaultFormatFn(name, count) {
            return name + ' (' + count + ')';
          }

          function getTitle(componentType) {
            if (!componentType || componentType === 'undefined') {
              return 'Unknown';
            }

            var comp = _.find(allComponentMetadata, function(c) {
              return c.componentType === componentType;
            });
            return comp ? comp.title : componentType;
          }

          formatFn = formatFn || defaultFormatFn;

          return _.chain(components)
            .filter(function(c) {
              return c;
            })
            .countBy("componentType")
            .map(function(count, componentType) {
              var title = getTitle(componentType);
              return formatFn(title, count);
            })
            .sort()
            .value();
        };

        /**
         * return { name: 'naem', passed: true|false}
         */
        this.allReviewsPassed = function(reviewsPassed, allReviews) {
          function toNameAndPassed(r) {
            return {
              name: r.value,
              passed: _.contains(reviewsPassed, r.value)
            };
          }
          return _.map(allReviews, toNameAndPassed);
        };

        this.subjectText = function(subject) {
          var text = subject.category;
          if (!_.isEmpty(text) && !_.isEmpty(subject.subject)) {
            text += ' — ' + subject.subject;
          }
          if (_.isEmpty(text)) {
            text = subject.subject;
          }
          return text;
        };

      }
      return new ProfileFormatter();

    }
  ]);