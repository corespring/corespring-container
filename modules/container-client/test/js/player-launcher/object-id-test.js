describe('ObjectId', function() {

  var ObjectId = new corespring.require("object-id");
  var validId = "554b6124ec4319a431e79254";

  describe('initialize', function() {

    it('should not raise an error', function() {
      var id = validId;
      expect(function() { new ObjectId(id); }).not.toThrow();
    });

    describe('length is too short', function() {
      var id = validId.substr(1, 4);
      it('should raise an error', function() {
        expect(function() { new ObjectId(id); }).toThrow();
      });
    });

    describe("length is too long", function() {
      var id = validId + validId;
      it('should raise an error', function() {
        expect(function() { new ObjectId(id); }).toThrow();
      });
    });

    describe("contains non-alphanumeric characters", function() {
      var id = "554b61*4ec431_a431e79254";
      it('should raise an error', function() {
        expect(function() { new ObjectId(id); }).toThrow();
      });
    });

    describe('object passed as parameter', function() {

      it('should not raise an error', function() {
        var id = {
          "$oid": validId
        };
        expect(function() { new ObjectId(id); }).not.toThrow();
      });

      describe('does not contain $oid key', function() {
        var id = {
          "id" : validId
        };
        it('should raise an error', function() {
          expect(function() { new ObjectId(id); }).toThrow();
        });
      });

    });

  });

});