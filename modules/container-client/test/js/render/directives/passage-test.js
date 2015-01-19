describe('passage', function() {

  var element;

  beforeEach(angular.mock.module('corespring-player.directives'));

  describe('no show attribute', function() {

    beforeEach(inject(function($rootScope, $compile) {
      var scope = $rootScope.$new();
      element = $compile('<div class="passage"></div>')(scope);
      $rootScope.$digest();
    }));

    it('should be hidden', function() {
      expect(element[0].style.display).toEqual('none');
    });

  });

  describe('show = true', function() {
    beforeEach(inject(function($rootScope, $compile) {
      var scope = $rootScope.$new();
      element = $compile('<div class="passage" show="true"></div>')(scope);
      $rootScope.$digest();
    }));

    it('should not be hidden', function() {
      expect(element[0].style.display).toEqual('');
    });
  });

  describe('show = false', function() {

    beforeEach(inject(function($rootScope, $compile) {
      var scope = $rootScope.$new();
      element = $compile('<div class="passage" show="false"></div>')(scope);
      $rootScope.$digest();
    }));

    it('should be hidden', function() {
      expect(element[0].style.display).toEqual('none');
    });

  });


});