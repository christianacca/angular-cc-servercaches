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

        function httpExec(httpConfigsGetter, execSettings) {
            execSettings = angular.extend(defaultExecSettings, execSettings || {});
            return serverCachesConfig()
                .then(httpConfigsGetter)
                .then(function(httpConfigs) {
                    httpConfigs.timeout = execSettings.cancellationToken;
                    return httpConfigs;
                })
                .then($http);

        }

        function fetchAll(execSettings) {
            var httpConfig = function(configs) {
                return {
                    url: configs.url,
                    method: "get",
                    params: {
                        expand: "itemAccessStatistics"
                    }
                };
            };
            return httpExec(httpConfig, execSettings)
                .then(function(response) {
                    return response.data;
                });
        }

        function removeItem(data, execSettings) {
            var httpConfig = function(configs) {
                return {
                    url: utils.combinePaths(configs.url, data.cache.cacheId, data.item.key),
                    method: "delete"
                };
            };
            return httpExec(httpConfig, execSettings)
                .then(function() {
                    utils.removeInstance(data.cache.itemAccessStatistics, data.item);
                });
        }

        function updateCache(data, execSettings) {
            var httpConfig = function(configs) {
                return {
                    url: utils.combinePaths(configs.url, data.cache.cacheId),
                    method: "patch",
                    data: data.delta
                };
            };

            return httpExec(httpConfig, execSettings)
                .then(function() {
                    angular.extend(data.cache, data.delta);
                });
        }

    }
})();