describe('dimension-calculator', function () {

  var sut, size;

  beforeEach(angular.mock.module('corespring-player.services'));

  beforeEach(inject(function ($rootScope, DimensionCalculator) {
    sut = new DimensionCalculator();
  }));

  it('should exist', function () {
    expect(sut).toBeDefined();
  });

  describe('if size has not changed', function () {

    it('should return null', function () {
      size = sut.calcUpdatedDimensions({w: 123, h: 456});
      size = sut.calcUpdatedDimensions({w: 123, h: 456});
      expect(size).toBe(null);
    });

  });

  describe('if size has changed', function () {

    it('should return size, if size cannot be found in recent sizes', function () {
      size = sut.calcUpdatedDimensions({w: 123, h: 456});
      expect(size).toEqual({w: 123, h: 456});
    });

    it('should return null, if size can be found in recent sizes & tallest is current size', function () {
      sut.calcUpdatedDimensions({w: 1, h: 1});
      sut.calcUpdatedDimensions({w: 1, h: 2});
      sut.calcUpdatedDimensions({w: 1, h: 3});
      size = sut.calcUpdatedDimensions({w: 1, h: 2});
      expect(size).toBe(null);
    });

    it('should return tallest of recent sizes, if size can be found in recent sizes & tallest is not current size', function () {
      sut.calcUpdatedDimensions({w: 1, h: 2});
      sut.calcUpdatedDimensions({w: 1, h: 3});
      sut.calcUpdatedDimensions({w: 1, h: 1});
      size = sut.calcUpdatedDimensions({w: 1, h: 2});
      expect(size).toEqual({w: 1, h: 3});
    });

    it('should return null, if tallest is requested again', function () {
      sut.calcUpdatedDimensions({w: 1, h: 2});
      sut.calcUpdatedDimensions({w: 1, h: 3});
      sut.calcUpdatedDimensions({w: 1, h: 1});
      sut.calcUpdatedDimensions({w: 1, h: 2});
      size = sut.calcUpdatedDimensions({w: 1, h: 1});
      expect(size).toBe(null);
    });

  });

});