describe('profile formatter', function() {

  beforeEach(angular.mock.module('corespring-common.services'));

  var formatter;

  beforeEach(inject(function(ProfileFormatter) {
    formatter = ProfileFormatter;
  }));

  it('should init', function() {
    expect(formatter).not.toBe(null);
  });

  describe('all reviews passed', function() {


    it('should return reviews passed', function() {

      var result = formatter.allReviewsPassed(['A'], [{
        key: 'A',
        value: 'A'
      }, {
        key: 'B',
        value: 'B'
      }]);

      expect(result).toEqual([{
        name: 'A',
        passed: true
      }, {
        name: 'B',
        passed: false
      }]);
    });
  });

  describe('component types used', function() {
    var availableComponents = [{
      componentType: 'a',
      title: 'Alpha'
    }, {
      componentType: 'b',
      title: 'Beta'
    }];

    function assertTypesUsed(comps, allComps, expected) {
      var result = formatter.componentTypesUsed(comps, allComps);
      expect(result).toEqual(expected);
    }

    it('should return component types used - single comp', function() {

      var comps = {
        1: {
          componentType: 'a'
        }
      };

      assertTypesUsed(comps, availableComponents, ['Alpha (1)']);
    });

    it('should return component types used - 2 components of the same type', function() {

      var comps = {
        1: {
          componentType: 'a'
        },
        2: {
          componentType: 'a'
        }
      };

      assertTypesUsed(comps, availableComponents, ['Alpha (2)']);
    });

    it('should return component types used - 3 components 2 types', function() {

      var comps = {
        1: {
          componentType: 'a'
        },
        2: {
          componentType: 'a'
        },
        3: {
          componentType: 'b'
        }
      };

      assertTypesUsed(comps, availableComponents, ['Alpha (2)', 'Beta (1)']);
    });

    it('should componentType when it can\'t find a title', function() {

      var comps = {
        1: {
          componentType: 'z'
        },
        2: {
          componentType: 'y'
        }
      };

      assertTypesUsed(comps, availableComponents, ['y (1)', 'z (1)']);
    });

    it('should not break', function() {

      var comps = {
        1: undefined
      };

      assertTypesUsed(comps, availableComponents, []);
    });

    it('should not break', function() {

      var comps = {
        1: {

        }
      };

      assertTypesUsed(comps, availableComponents, ['Unknown (1)']);
    });

  });


});