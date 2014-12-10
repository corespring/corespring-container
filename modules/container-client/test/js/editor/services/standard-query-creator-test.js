describe('standard query creator', function() {

  var sut = null;

  beforeEach(angular.mock.module('corespring-editor.services'));

  beforeEach(inject(function(StandardQueryCreator) {
    sut = StandardQueryCreator;
  }));

  it('should init', function() {
    expect(sut).not.toBe(null);
  });

  it('should create query with subject field, if subject option is empty', function() {
    var result = sut.createStandardQuery("test");
    expect(result.fields).toContain("subject");
  });

  it('should create query with the following default fields', function() {
    var result = sut.createStandardQuery("test");
    expect(result.fields).toContain("dotNotation");
    expect(result.fields).toContain("category");
    expect(result.fields).toContain("subCategory");
    expect(result.fields).toContain("standard");
  });

  it('should create query without subject field, if subject option is not empty', function() {
    var result = sut.createStandardQuery("test", {
      name: 'important subject'
    });
    expect(result.fields).not.toContain("subject");
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
    expect(result.filters).toEqual([{
      field: 'subject',
      value: 'important subject'
    }]);
  });

  it('should create query with two filters, if subject and category option are set', function() {
    var result = sut.createStandardQuery("test", {
      name: 'important subject'
    }, {
      name: 'important category'
    });
    expect(result.filters).toEqual([{
      field: 'subject',
      value: 'important subject'
    }, {
      field: 'category',
      value: 'important category'
    }]);
  });

  it('should create query with three filters, if subject, category and subCategory option are set', function() {
    var result = sut.createStandardQuery("test", {
      name: 'important subject'
    }, {
      name: 'important category'
    }, {
      name: 'important sub-category'
    });
    expect(result.filters).toEqual([{
      field: 'subject',
      value: 'important subject'
    }, {
      field: 'category',
      value: 'important category'
    }, {
      field: 'subCategory',
      value: 'important sub-category'
    }]);
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
      expect(result.filters).toEqual([{
        field: 'subject',
        value: 'important subject'
      }]);
    });

  });


});