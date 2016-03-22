describe('sm-utils', function() {

  var utils, mockDocument, queryParamUtils;

  beforeEach(angular.mock.module('corespring-common.supporting-materials.services'));

  beforeEach(module(function($provide) {

    queryParamUtils = {
      addQueryParams: jasmine.createSpy('addQueryParams').and.callFake(function(p){
        return p;
      })
    };

    mockDocument = {location: {href: 'unknown'}};
    $provide.value('SupportingMaterialUrls', {});
    $provide.value('$document', [mockDocument]);
    $provide.value('QueryParamUtils', queryParamUtils);
  }));

  beforeEach(inject(function(SmUtils) {
    utils = SmUtils;
  }));

  function vf(name, isMain){
    isMain = isMain !== false;
    return {
      _t: 'org.corespring.platform.core.models.item.resource.VirtualFile',
      name: name, 
      contentType: 'text/html',
      content: '<h1>hi</h1>',
      isMain: isMain 
    };
  }

  function m(name, materialType, files){
    return {
      name: name, 
      materialType: materialType,
      files: files
    };
  }

  var supportingMaterials = [
    m('A-SWU', 'Student Work Example', [vf('index.html')]),
    m('A-Rubric', 'Rubric', [vf('index.html')]),
    m('B-Rubric', 'Rubric', [vf('index.html')])
  ];

  describe('for the default group', function(){

    var sections;
    
    beforeEach(function(){
      sections = utils.group(supportingMaterials, 'materialType');
    });

    it('creates 2 sections', function(){
      expect(sections.length).toEqual(2);
    });
    
    it('sorts the sections alphabetically', function(){
      var names = _.pluck(sections, 'name');
      expect([names[0], names[1]]).toEqual(names.sort());
    });

  });

  describe('mainFile', function(){
    
    it('returns undefined for an empty array', function(){
      var main = utils.mainFile({files: []});
      expect(main).not.toBeDefined();
    });

    it('returns the first file that isMain==true', function(){
      var main = utils.mainFile({files: [vf('a', false), vf('b', true)]});
      expect(main).toEqual(vf('b'));
    });

  });

  describe('formatKB', function() {

    it("should return '--' for NaN", function() {
      expect(utils.formatKB(NaN)).toEqual('--');
    });

    it('should return 1.5mb for 1536', function() {
      expect(utils.formatKB(1536)).toEqual('1.5mb');
    });

    it('should return 512kb for 512', function() {
      expect(utils.formatKB(512)).toEqual('512kb');
    });

  });

});