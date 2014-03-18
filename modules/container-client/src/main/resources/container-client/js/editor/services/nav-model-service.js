(function(){
  function NavModelService ($location, $log) {

    this.navEntries = [
      {
        title: "Design",
        path: "/design",
        partial: "designer",
        active: "active"
      },
      {
        title: "View Player",
        path: "/view-player",
        partial: "view-player",
        active: ""
      },
      {
        title: "Item Profile",
        path: "/item-profile",
        partial: "item-profile",
        active: ""
      },
      {
        title: "Supporting Materials",
        path: "/supporting-materials",
        partial: "supporting-materials",
        active: ""
      },
      {
        title: "Overview",
        path: "/overview",
        partial: "overview",
        active: ""
      }
    ];

    this.currentNavEntry = this.navEntries[0];

    this.chooseNavEntry = function(path) {
      $log.debug("!! chooseNavEntry -> ", path);
      _.forEach(this.navEntries, function(entry){
        entry.active = "";
      });
      var newCurrent = _.find(this.navEntries, function(entry){return entry.path === path;}) || this.navEntries[0];
      this.currentNavEntry = newCurrent;
      this.currentNavEntry.active = "active";
      $location.path(this.currentNavEntry.path);
    };

    this.isCurrentView = function(name){
      return this.currentNavEntry && this.currentNavEntry.partial === name;
    };
  }

  angular.module('corespring-editor.services')
    .service('NavModelService',
      [
      '$location',
      '$log',
        NavModelService
      ]
    );

})();


