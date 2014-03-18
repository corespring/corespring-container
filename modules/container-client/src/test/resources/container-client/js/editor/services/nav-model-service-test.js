describe('nav model service', function(){

  var sut = null;

  beforeEach(angular.mock.module('corespring-editor.services'));

  beforeEach(inject(function (NavModelService) {
    sut = NavModelService;
  }));

  it('should init', function(){
    expect(sut).toNotBe(null);
  });

  it('should have designer selected initially', function(){
    expect(viewIsSelected('designer')).toBe(true);
  });

  it('should allow to change the current view', function(){
    sut.chooseNavEntry('/view-player');
    expect(viewIsSelected('view-player')).toBe(true);
  });

  it('should fall back to designer if path is not valid', function(){
    sut.chooseNavEntry('/view-player');
    sut.chooseNavEntry('/invalid');
    expect(viewIsSelected('designer')).toBe(true);
  });

  function viewIsSelected(view){
    expect(sut.isCurrentView(view)).toBe(true);
    expect(sut.currentNavEntry.active).toEqual('active');
    expect(sut.navEntries.every(function(entry){
      return entry.active === '' || entry.active === 'active' && entry.path == sut.currentNavEntry.path
    })).toBe(true);
    return true
  }


});

