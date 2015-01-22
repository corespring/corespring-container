describe('ProfileFormatter', function() {

  var profileFormatter;

  beforeEach(angular.mock.module('corespring-common.services'));

  beforeEach(inject(function(ProfileFormatter) {
    profileFormatter = ProfileFormatter;
  }));

  describe('componentTypesUsed', function() {

    var componentCounts = {
      'these' : 5,
      'are' : 7,
      'component' : 10,
      'counts' : 8
    };

    var components = (function() {
      return _(componentCounts).keys().map(function(key) {
        var components = [];
        for (var i = 0; i < componentCounts[key]; i++) {
          components.push({
            componentType: key
          });
        }
        return components;
      }).flatten().reduce(function(acc, component) {
        var i = 0;
        while(acc[i.toString()] !== undefined) {
          i++;
        }
        acc[i.toString()] = component;
        return acc;
      }, {});
    })();

    it('should return strings with information about component counts', function() {
      expect(_.isEmpty(_.xor(
        profileFormatter.componentTypesUsed(components),
        _.map(componentCounts, function(count, componentType) {
          return componentType + " (" + count + ")";
        })
      ))).toBe(true);
    });

  });

  describe('allReviewsPassed', function() {

    var reviewsPassed = [{value: 'these'}, {value: 'have'}, {value: 'passed!'}];
    var reviewsNotPassed = [{value: 'did'}, {value: 'not'}, {value: 'pass'}];
    var allReviews = reviewsPassed.concat(reviewsNotPassed);
    var result;

    beforeEach(function() {
      result = profileFormatter.allReviewsPassed(_.pluck(reviewsPassed, 'value'), allReviews);
    });

    it('should return true for reviews passed', function() {
      expect(_(result)
        .filter(function(r) {
          return r.passed === true;
        }).pluck('name').value()
      ).toEqual(_.pluck(reviewsPassed, 'value'));
    });

    it('should return false for reviews not passed', function() {
      expect(_(result)
          .filter(function(r) {
            return r.passed === false;
          }).pluck('name').value()
      ).toEqual(_.pluck(reviewsNotPassed, 'value'));
    });

  });

});