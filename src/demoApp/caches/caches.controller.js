(function() {

    angular
        .module("caches")
        .controller("CachesController", CachesController);

    CachesController.$inject = ["ccServerCaches.dataService"];

    function CachesController(serverCachesDataService) {
        var self = this;

        init();

        //////////////

        function init(){
            self.model = {
                title: "Server-side cache manager"
            };
            return refreshCaches();
        }

        function refreshCaches(cancellationToken){
            return serverCachesDataService.fetchAll({ cancellationToken: cancellationToken })
                .then(function(caches){
                    self.model.caches = caches;
                });
        }
    }

})();