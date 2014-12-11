angular.module('corespring-editor.services').service('AppState', function(){

  function AppState(){

    this.question = {
      preview: false
    };

    this.profile = {

    };
  }

  return new AppState();
});