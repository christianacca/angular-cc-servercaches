(function () {
    "use strict";

    angular.module("ccServerCachesModule")
        .factory("_ccServerCachesUtils", serverCachesUtils);

    serverCachesUtils.$inject = ["$injector"];

    function serverCachesUtils($injector) {

        // this service is here solely to avoid taking a dependency on external modules such as underscore and
        // underscore-string (grrr)

        var service = {
            combinePaths: combinePaths,
            removeInstance: removeInstance,
            resolveExPoliciesSvc: resolveExPoliciesSvc
        };

        return service;

        ////////////

        function ltrim(str, chars) {
            return String(str).replace(new RegExp("^" + chars + "+"), "");
        }

        function rtrim(str, chars) {
            return String(str).replace(new RegExp(chars + "+$"), "");
        }

        function combinePaths(/*args*/) {
            if (arguments.length === 0) return undefined;

            var args = Array.prototype.slice.call(arguments, 0);
            var result = args.reduce(function (previous, current) {
                if (previous === "") {
                    return current;
                }
                return rtrim(previous, "/") + "/" + ltrim(current, "/");
            }, "");

            return result;
        }

        function removeInstance(list, instance) {
            var index = list.indexOf(instance);
            if (index !== -1) {
                list.splice(index, 1);
            }
            return index;
        }

        function resolveExPoliciesSvc() {
            // integrate with ccExceptionPoliciesModule if installed, otherwise return a suitable "lite" service
            return $injector.has("ccExceptionPolicies") ?
                $injector.get("ccExceptionPolicies") : { promiseFinExPolicy: $injector.get("$exceptionHandler") };
        }
    }
})();
