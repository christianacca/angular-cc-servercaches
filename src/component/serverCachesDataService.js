(function () {
    "use strict";

    angular.module("ccServerCachesModule")
        .factory("ccServerCaches.dataService", serverCachesDataService);

    serverCachesDataService.$inject = ["$http", "ccServerCachesConfig", "_ccServerCachesUtils"];

    function serverCachesDataService($http, serverCachesConfig, utils) {

        var defaultExecSettings = {
            cancellationToken: undefined
        };

        var service = {
            fetchAll: fetchAll,
            removeItem: removeItem,
            updateCache: updateCache
        };

        return service;

        ////////////

        function httpExec(httpConfig, execSettings) {
            execSettings = angular.extend(defaultExecSettings, execSettings || {});
            httpConfig.timeout = execSettings.cancellationToken;
            return $http(httpConfig);
        }

        function fetchAll(execSettings) {
            var httpRequest = {
                url: serverCachesConfig.url,
                method: "get",
                params: {
                    expand: "itemAccessStatistics"
                }
            };
            return httpExec(httpRequest, execSettings)
                .then(function(response) {
                    return response.data;
                });
        }

        function removeItem(data, execSettings) {
            var httpRequest = {
                url: utils.combinePaths(serverCachesConfig.url, data.cache.cacheId, data.item.key),
                method: "delete"
            };
            return httpExec(httpRequest, execSettings)
                .then(function() {
                    utils.removeInstance(data.cache.itemAccessStatistics, data.item);
                });
        }

        function updateCache(data, execSettings) {
            var httpRequest = {
                url: utils.combinePaths(serverCachesConfig.url, data.cache.cacheId),
                method: "patch",
                data: data.delta
            };

            return httpExec(httpRequest, execSettings)
                .then(function() {
                    angular.extend(data.cache, data.delta);
                });
        }

    }
})();