describe('ClientSidePlayerService', function() {

  var service, timeout;

  var getQuestionFor = jasmine.createSpy('getQuestionFor')
  var getItem = jasmine.createSpy('getItem').and.returnValue({components: {}});

  function resetMocks() {
    getQuestionFor.calls.reset();
    getItem.calls.reset();
  }

  beforeEach(angular.mock.module('corespring-player.services'));

  beforeEach(inject(function(ClientSidePlayerService, $timeout) {
    service = new ClientSidePlayerService(getQuestionFor, getItem);
    timeout = $timeout;
  }));

  afterEach(resetMocks);

  describe('submitSession', function() {
    var session = {}, callback = jasmine.createSpy('callback');
    beforeEach(function() {
      service.submitSession(session, callback);
      timeout.flush();
    });

    it('should call callback with default values', function() {
      expect(callback).toHaveBeenCalledWith({
        session: {
          isComplete: true,
          attempts: 1
        },
        outcome: {},
        score: {
          summary: {
            maxPoints: 0,
            points: 0,
            percentage: NaN
          },
          components: {}
        }
      });
    });

  });

});