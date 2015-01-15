describe('PlayerUtils', function() {

  var playerUtils;

  beforeEach(angular.mock.module('corespring-player.services'));

  beforeEach(inject(function(PlayerUtils) {
    playerUtils = PlayerUtils;
  }));

  describe('zipDataAndSession', function() {
    var dataOne = {data: 'for', component: 'one'};
    var dataTwo = {data: 'for', component: 'two'};
    var item = { components: { one: dataOne, two: dataTwo } };

    var sessionOne = {data: 'for', session: 'one'};
    var sessionTwo = {data: 'for', session: 'two'};
    var session = { components: { one: sessionOne, two: sessionTwo } };

    it('should return data and sessions keyed by component ids', function() {
      expect(playerUtils.zipDataAndSession(item, session)).toEqual({
        one: { data: dataOne, session: sessionOne },
        two: { data: dataTwo, session: sessionTwo }
      });
    });

  });

});