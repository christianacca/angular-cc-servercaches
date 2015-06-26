(function(){
    "use strict";

    angular
        .module("starterApp")
        .config(routing);

    routing.$inject = ["$routeProvider", "$locationProvider"];

    function routing($routeProvider, $locationProvider){
        $locationProvider.html5Mode(false);
        $routeProvider
            .when("/users", {
                controller: "UserController",
                templateUrl: "demoApp/users/view/users.html",
                controllerAs: "ul"
            })
            .when("/caches", {
                controller: "CachesController",
                templateUrl: "demoApp/caches/serverCaches.html",
                controllerAs: "ctrl"
            });
        $routeProvider.otherwise({
            controller: "HomeController",
            templateUrl: "demoApp/home/home.html"
        });
        $routeProvider.caseInsensitiveMatch = true;
    }
})();