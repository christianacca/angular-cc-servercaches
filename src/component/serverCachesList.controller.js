(function () {
    "use strict";

    angular.module("ccServerCachesModule")
        .controller("serverCachesListController", serverCachesListController);

    serverCachesListController.$inject = [
        "$scope", "$attrs", "$q", "ccServerCaches.dataService", "_ccServerCachesUtils"
    ];

    function serverCachesListController ($scope, $attrs, $q, serverCachesDataService, utils) {

        var inflightRequestCancellors = [],
            exPolicies;

        function initialise() {
            $scope.isDisabled = isDisabled;
            $scope.isSelected = isSelected;
            $scope.pauseCache = pauseCache;
            $scope.removeItem = removeItem;
            $scope.startCache = startCache;
            $scope.toggleList = toggleList;

            exPolicies = utils.resolveExPoliciesSvc();

            $scope.$watchCollection("model.caches", onCachesCollectionChange);
            $scope.$on("$destroy", cancelInflightRequests);
        }

        initialise();

        ////////////


        function cancelInflightRequests() {
            inflightRequestCancellors.forEach(function(cancellor) {
                cancellor.resolve();
            });
            inflightRequestCancellors = [];
            $scope.isBusy = false;
        }

        function onCachesCollectionChange(revisedList) {
            if (!$scope.model.selected) return;

            var newSelected = revisedList.filter(function(cache) {
                return cache.cacheId === $scope.model.selected.cacheId;
            })[0];
            $scope.model.selected = newSelected;
        }

        function isDisabled() {
            return $scope.isBusy || $scope.$parent.$eval($attrs.ngDisabled);
        }

        function isSelected(cache) {
            return $scope.model.selected === cache;
        }

        function execAction(actionFn, data) {
            actionFn = actionFn.bind(serverCachesDataService);
            $scope.isBusy = true;
            var requestCancellor = $q.defer();
            inflightRequestCancellors.push(requestCancellor);
            return actionFn(data, { cancellationToken: requestCancellor.promise })
                .catch(exPolicies.promiseFinExPolicy)
                .finally(function() {
                    $scope.isBusy = false;
                    utils.removeInstance(inflightRequestCancellors, requestCancellor);
                });
        }

        function pauseCache(cache) {
            var data = {
                cache: cache,
                delta: {
                    isPaused: true
                }
            };
            return execAction(serverCachesDataService.updateCache, data);
        }

        function removeItem(cache, itemStat) {
            var data = {
                cache: cache,
                item: itemStat
            };
            return execAction(serverCachesDataService.removeItem, data);
        }

        function startCache(cache) {
            var data = {
                cache: cache,
                delta: {
                    isPaused: false
                }
            };
            return execAction(serverCachesDataService.updateCache, data);
        }

        function toggleList(cache) {
            if ($scope.model.selected === cache) {
                $scope.model.selected = null;
            } else {
                $scope.model.selected = cache;
            }
        }
    }
})();