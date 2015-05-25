(function() {
    'use strict';

    angular.module('users')
        .service('userService', ['$http', UserService]);

    /**
   * Users DataService
   *
   * @returns {{fetchAllUsers: Function, fetchOneUser: Function}}
   * @constructor
   */
    function UserService($http) {

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
                    alert(reason);
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
                    alert(reason);
                });
            }
        };
    }

})();