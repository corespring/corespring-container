"use strict";

describe('CorespringContainer', function(){

  var container, scope;

  beforeEach(angular.mock.module('corespring.container'));

  beforeEach(inject(function ($rootScope, CorespringContainer ) {
    scope = $rootScope.$new();
    try {
      container = CorespringContainer;
    } catch (e) {
      throw("Error with the controller: " + e);
    }
  }));

  it('constructs', function(){
    expect(container).toNotBe(null);
  });


  describe('set model gets called', function(){

    var setModelCalled = false;

    var component = {
      setModel: function(model) {
        setModelCalled = true;
      }
    };

    var data = {
          item: {
            components: {
              '1' : {
                componentType: "?"
              }
            }
          }
        };

      it('works when register is called first', function(){
        setModelCalled = false;
        container.register('1', component);
        container.initialize(data);
        expect(setModelCalled).toBe(true);
      });

      it('works when initialize is called first', function(){
        setModelCalled = false;
        container.initialize(data);
        container.register('1', component);
        expect(setModelCalled).toBe(true);
      });
  });

});