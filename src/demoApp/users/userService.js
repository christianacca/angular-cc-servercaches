(function() {
    "use strict";

    angular.module("users")
        .service("userService", UserService);

    UserService.$inject = ["$http", "$log"];

    /**
   * Users DataService
   *
   * @returns {{fetchAllUsers: Function, fetchOneUser: Function}}
   * @constructor
   */
    function UserService($http, $log) {

        // Promise-based API
        return {
            fetchAllUsers: function() {
                // Simulate async nature of real remote calls
                return $http({
                    url: "http://localhost:53703/api/users/",
                    method: "GET"
                }).then(function(response) {
                    return response.data;
                }).catch(function(reason) {
                    $log.log(reason);
                });
            },
            fetchOneUser: function(name) {
                // Simulate async nature of real remote calls
                return $http({
                    url: "http://localhost:53703/api/users/" + name,
                    method: "GET"
                }).then(function (response) {
                    return response.data;
                }).catch(function (reason) {
                    $log.log(reason);
                });
            }
        };
    }

})();