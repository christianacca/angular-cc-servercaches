(function() {

    angular
        .module("caches")
        .controller("CachesController", CachesController);

    CachesController.$inject = ["ccServerCaches.dataService"];

    function CachesController(serverCachesDataService) {
//        var self = this;


    }

})();