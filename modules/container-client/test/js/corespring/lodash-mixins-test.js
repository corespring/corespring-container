describe('lodash mixins', function() {

  describe('makeArray', function() {

    it('should be defined', function() {
      expect(_.makeArray).toBeDefined();
    });

    it('return array as-is', function() {
      var array = [1,2,3,4];
      expect(_.makeArray(array)).toBe(array);
    });

    it('return the values for the object', function() {
      expect(_.makeArray({'cool' : 'stuff', 'things' : 'good'})).toEqual(['stuff', 'good']);
    });

  });

  describe('toSnakeCase', function() {

    var camelCaseString = "thisIsAStringInCamelCase";
    var result;

    beforeEach(function() {
      result = _.toSnakeCase(camelCaseString);
    });

    it('should be defined', function() {
      expect(_.toSnakeCase).toBeDefined();
    });

    it('should replace uppercase with -lowercase', function() {
      expect(result).toEqual(result.replace(/([A-Z])/g, function(a, b) {
        return "-" + b.toLowerCase();
      }));
    });

  });

});