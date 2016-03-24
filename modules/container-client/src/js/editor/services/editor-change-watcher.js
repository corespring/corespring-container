angular.module('corespring-editor.services')
  .factory('EditorChangeWatcher', ['LogFactory', 'editorDebounce', function(LogFactory, editorDebounce) {

    var logger = LogFactory.getLogger('editor-change-watcher');

    function EditorChangeWatcher(){


       this.debounce = editorDebounce;

      /** 
       * create a $watch handler that debounces the save
       * and emits an 'itemChanged' event.
       */
      this.makeWatcher = function(partName, saveFn, scope){

        if(!partName){
          throw new Error('no partName defined');
        }

        if(!saveFn){
          throw new Error('no saveFn defined');
        }

        if(!scope){
          throw new Error('no scope defined');
        }


        var debouncedFn = editorDebounce(saveFn);

        //emit the itemChanged event quickly so that clients know
        //that the data has been updated.
        var debouncedEmit = editorDebounce(function(){
          scope.$emit('itemChanged', {partChanged: partName});
        }, 200);

        return function(newValue, oldValue){
          
          logger.debug(partName + ' new:' + newValue + ' old: ' + oldValue);

          if (_.isEqual(newValue, oldValue)) {
            logger.debug( partName + 'they are the same - ignore...');
            return;
          }
          
          if (oldValue) {
            debouncedEmit();
          }

          debouncedFn(newValue, oldValue);
        };
      };
    }

    return new EditorChangeWatcher();
  }]);