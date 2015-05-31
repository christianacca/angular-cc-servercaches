(function() {
    "use strict";

    angular.module("ccServerCachesModule")
        .directive("ramServerCachesList", serverCachesList);

    serverCachesList.$inject = [];

    function serverCachesList() {
        var directive = {
            restrict: "E",
            replace: true,
            scope: {
                model: "=listModel",
                isBusy: "=?listBusy"
            },
            templateUrl: "app/vendor/angular-ccacca/serverCaches/serverCachesList.html",
            controller: "serverCachesListController"
        };
        return directive;
    }
})();