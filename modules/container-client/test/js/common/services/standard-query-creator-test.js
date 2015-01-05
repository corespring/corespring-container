describe('standard query creator', function() {

  var sut = null;

  beforeEach(angular.mock.module('corespring-common.services'));

  beforeEach(inject(function(StandardQueryCreator) {
    sut = StandardQueryCreator;
  }));

  it('should init', function() {
    expect(sut).not.toBe(null);
  });

  it('should create query with searchTerm only, filters are empty', function() {
    var result = sut.createStandardQuery("test");
    expect(result).toEqual({searchTerm:"test"});
  });

  it('should create query without filters, if subject option is all', function() {
    var result = sut.createStandardQuery("test", {
      name: 'all'
    });
    expect(result.filters).toBeUndefined();
  });

  it('should create query without filters, if subject option is empty', function() {
    var result = sut.createStandardQuery("test", {
      name: ''
    });
    expect(result.filters).toBeUndefined();
  });

  it('should create query without filters, if subject option is null', function() {
    var result = sut.createStandardQuery("test");
    expect(result.filters).toBeUndefined();
  });

  it('should create query with one filter, if subject option is set', function() {
    var result = sut.createStandardQuery("test", {
      name: 'important subject'
    });
    expect(result.filters).toEqual({
      subject:'important subject'
    });
  });

  it('should create query with two filters, if subject and category option are set', function() {
    var result = sut.createStandardQuery("test", {
      name: 'important subject'
    }, {
      name: 'important category'
    });
    expect(result.filters).toEqual({
      'subject': 'important subject',
      'category': 'important category'
    });
  });

  it('should create query with three filters, if subject, category and subCategory option are set', function() {
    var result = sut.createStandardQuery("test", {
      name: 'important subject'
    }, {
      name: 'important category'
    }, {
      name: 'important sub-category'
    });
    expect(result.filters).toEqual({
      'subject': 'important subject',
      'category': 'important category',
      'subCategory': 'important sub-category'
    });
  });

  describe("the first empty option removes all filters after it", function() {

    it('empty subject option removes all filters', function() {
      var result = sut.createStandardQuery("test", null, {
        name: 'important category'
      }, {
        name: 'important sub-category'
      });
      expect(result.filters).toBeUndefined();
    });

    it('empty category option removes category and sub-category filter', function() {
      var result = sut.createStandardQuery("test", {
        name: 'important subject'
      }, null, {
        name: 'important sub-category'
      });
      expect(result.filters).toEqual({
        'subject': 'important subject'
      });
    });

  });


});