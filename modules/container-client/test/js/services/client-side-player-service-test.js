describe('ClientSidePlayerService', function() {

  var service, timeout;

  var getQuestionFor = jasmine.createSpy('getQuestionFor').and.returnValue({});
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

  describe('custom scoring', function() {
    var getItemWithCustomScoring = jasmine.createSpy('getItem').and.returnValue({
      components: {}, customScoring: [
        'function toOldModel(data){',
        '  return {',
        '    value: data.answers ? data.answers : []',
        '  };',
        '}',
        '',
        'exports.process = function(item, session, outcomes){',
        '',
        '  var RESPONSE = toOldModel(session.components.RESPONSE);',
        '',
        '  var correctAnswers = 0;',
        '  if (RESPONSE.value.indexOf("1") != -1) correctAnswers += 1;',
        '  if (RESPONSE.value.indexOf("2") != -1) correctAnswers += 1;',
        '  if (RESPONSE.value.indexOf("3") != -1) correctAnswers += 1;',
        '',
        '  var score = 0;',
        '  if (correctAnswers == 1) score = 0.5',
        '  if (correctAnswers == 2) score = 0.8',
        '  if (correctAnswers == 3) score = 1.0',
        '',
        '  var outcome = {};',
        '  outcome.score = score;',
        '  outcome;',
        '  return {',
        '    outcomes: outcomes,',
        '    summary: {',
        '      percentage: (outcome.score * 100)',
        '    }',
        '  };',
        '};'
      ].join('\n')
    });
    var getItemWithInvalidCustomScoring = jasmine.createSpy('getItem').and.returnValue({components: {}, customScoring: "invalid;"});

    var serviceWithCustomScoring;
    var serviceWithInvalidCustomScoring;

    beforeEach(inject(function(ClientSidePlayerService) {
      serviceWithCustomScoring = new ClientSidePlayerService(getQuestionFor, getItemWithCustomScoring);
      serviceWithInvalidCustomScoring = new ClientSidePlayerService(getQuestionFor, getItemWithInvalidCustomScoring);
    }));

    it('score is calculated using custom scoring javascript', function() {
      var session = {components: {RESPONSE: {answers: ["1", "2"]}}}, callback = jasmine.createSpy('callback');
      serviceWithCustomScoring.submitSession(session, callback);
      timeout.flush();
      expect(callback.calls.mostRecent().args[0].score.summary.percentage).toBe(80);
    });

    it('outcomes are passed to process', function() {
      var session = {components: {RESPONSE: {answers: ["1", "2"]}}}, callback = jasmine.createSpy('callback');
      serviceWithCustomScoring.submitSession(session, callback);
      timeout.flush();
      expect(callback.calls.mostRecent().args[0].score.outcomes).toBeDefined();
    });

    it('invalid scoring javascript results in defalt score', function() {
      var session = {components: {RESPONSE: {answers: ["1", "2"]}}}, callback = jasmine.createSpy('callback');
      serviceWithInvalidCustomScoring.submitSession(session, callback);
      timeout.flush();
      expect(callback.calls.mostRecent().args[0].score.summary.points).toEqual(0);
    });

    describe('item manipulation in custom scoring', function(){

      var service;
      var customScoring = [
        'exports.process = function(item){',
        '  item.components["1"].foo = "bar";',
        '  return {};',
        '};'
      ].join('\n');
      
      var item = {
        components: { 
          '1' : {} 
        },
        customScoring: customScoring
      };
      
      beforeEach(inject(function(ClientSidePlayerService) {
        service = new ClientSidePlayerService(function(){return {};}, function(){
          return item;
        });
      }));

      it('does not affect the original item model', function(){
        service.submitSession({}, jasmine.createSpy('callback')); 
        timeout.flush();
        expect(item.components).toEqual({'1': {}});
      });
    });
  });

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