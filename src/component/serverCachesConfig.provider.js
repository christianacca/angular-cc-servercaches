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

        ServerCachesConfig.$inject = ["$q", "$window", "_ccServerCachesUtils"];

        function ServerCachesConfig($q, $window, utils) {
            var finalConfig;

            init();

            return fetchConfig;

            /////////////

            function fetchConfig() {
                // defines an async api for returning configuration
                // this is offers flexibility for our service can be replaced by a custom implementation that could be
                // async
                return $q.when(finalConfig);
            }

            function init(){
                var defaultConfig = {
                    url: utils.combinePaths($window.location.pathname, "api/caches/"),
                    // note: this is a *logical* url that is acts as a reasonable guess at the actual url on the server
                    cacheListTemplateUrl: "component/serverCachesList.html"
                };
                finalConfig = angular.extend({}, defaultConfig, customConfig);
            }
        }
    }
})();