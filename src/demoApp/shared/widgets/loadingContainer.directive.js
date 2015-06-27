﻿(function() {
    "use strict";

    angular
        .module("shared")
        .directive("loadingContainer", loadingContainer);

    loadingContainer.$inject = [];

    function loadingContainer () {
        var directive = {
            restrict: "A",
            scope: false,
            link: function (scope, element, attrs) {
                var loadingLayer = angular.element("<div class='loading'></div>");
                element.append(loadingLayer);
                element.addClass("loading-container");
                scope.$watch(attrs.loadingContainer, function (value) {
                    loadingLayer.toggleClass("ng-hide", !value);
                });
            }
        };
        return directive;
    }
})();