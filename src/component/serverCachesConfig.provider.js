(function () {
    "use strict";

    angular.module("ccServerCachesModule")
        .provider("ccServerCachesConfig", serverCachesConfig);

    serverCachesConfig.$inject = [];

    function serverCachesConfig() {

        var currentConfig;

        function registerCurrentConfig(config) {
            currentConfig = config;
        }

        function service($q, $window, utils) {
            var defaultConfig = {
                url: utils.combinePaths($window.location.pathname, "api/caches/")
            };

            return function() {
                // defines an async api for returning configuration
                // this is offers flexibility for our service can be replaced by a custom implementation that could be
                // async
                return $q.when(currentConfig || defaultConfig);
            };
        }

        return {
            registerCurrentConfig: registerCurrentConfig,
            $get: ["$q", "$window", "_ccServerCachesUtils", service]
        };
    }
})();