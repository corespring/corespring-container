describe('componentWeights', function(){

  beforeEach(angular.mock.module('corespring-templates'));
  beforeEach(angular.mock.module('corespring-editor.directives'));

  describe('ComponentWeightUtils', function(){

    var Utils;

    beforeEach(inject(function(ComponentWeightUtils) {
      Utils = ComponentWeightUtils;
    }));

    describe('getPercentage', function(){
      
      it('returns 0 for an empty component array', function(){
        var result = Utils.getPercentage([], 1);
        expect(result).toEqual(0);
      });
      
      it('returns 50 for an 1 -> [1,1]', function(){
        var result = Utils.getPercentage([{weight: 1}, {weight: 1}], 1);
        expect(result).toEqual(50);
      });
      
      it('returns 33.33 for an 1 -> [1,2]', function(){
        var result = Utils.getPercentage([{weight: 1}, {weight: 2}], 1);
        expect(result).toEqual(33.33);
      });
      
      it('returns 33.33 for an 1 -> [1,1,1]', function(){
        var result = Utils.getPercentage([{weight: 1}, {weight: 1}, {weight: 1}], 1);
        expect(result).toEqual(33.33);
      });
      
      it('returns 14.28 for an 1 -> [1,6]', function(){
        var result = Utils.getPercentage([{weight: 1}, {weight: 6}], 1);
        expect(result).toEqual(14.28);
      });
    });
  });

});