(function(){
    "use strict";

    angular
        .module("caches")
        .config(cacheConfig);

    cacheConfig.$inject = ["ccServerCachesConfigProvider"];

    function cacheConfig(serverCachesConfigProvider){
        serverCachesConfigProvider.registerConfig({
            url: "http://localhost:53703/api/caches/"
        });
    }
})();