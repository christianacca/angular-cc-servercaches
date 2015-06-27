(function() {
    "use strict";

    angular.module("ccServerCachesModule")
        .directive("ramServerCachesList", serverCachesList);

    serverCachesList.$inject = ["ccServerCachesConfig"];

    function serverCachesList(serverCachesConfig) {
        var directive = {
            restrict: "E",
            replace: true,
            scope: {
                model: "=listModel",
                isBusy: "=?listBusy"
            },
            templateUrl: serverCachesConfig.cacheListTemplateUrl,
            controller: "serverCachesListController"
        };
        return directive;
    }
})();