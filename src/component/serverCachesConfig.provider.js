(function () {
    "use strict";

    angular.module("ccServerCachesModule")
        .provider("ccServerCachesConfig", serverCachesConfigProvider);

    serverCachesConfigProvider.$inject = [];

    function serverCachesConfigProvider() {

        var customConfig;

        /* jshint validthis:true */
        this.$get = ServerCachesConfig;
        this.registerConfig = registerConfig;

        /////////////

        function registerConfig(config) {
            customConfig = config;
        }

        ServerCachesConfig.$inject = ["$window", "_ccServerCachesUtils"];

        function ServerCachesConfig($window, utils) {
            var defaultConfig = {
                url: utils.combinePaths($window.location.pathname, "api/caches/"),
                // note: this is a *logical* url that is acts as a reasonable guess at the actual url on the server
                cacheListTemplateUrl: "component/serverCachesList.html"
            };
            var finalConfig = angular.extend({}, defaultConfig, customConfig);
            return finalConfig;
        }
    }
})();