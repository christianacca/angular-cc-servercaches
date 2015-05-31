(function(){
    "use strict";

    angular
        .module("starterApp")
        .config(md);

    md.$inject = ["$mdThemingProvider", "$mdIconProvider"];

    function md($mdThemingProvider, $mdIconProvider){

        // note: if this app became larger then each feature area should take on the responsibility of configuring
        // material design with icon's for its own area

        $mdIconProvider
            .defaultIconSet("demoApp/sharedResources/images/avatars.svg", 128)
            .iconSet("nav", "demoApp/sharedResources/images/svg-sprite-navigation.svg", 24)
            .icon("menu", "demoApp/sharedResources/images/menu.svg", 24)
            .icon("share", "demoApp/sharedResources/images/share.svg", 24)
            .icon("google_plus", "demoApp/sharedResources/images/google_plus.svg", 512)
            .icon("hangouts", "demoApp/sharedResources/images/hangouts.svg", 512)
            .icon("twitter", "demoApp/sharedResources/images/twitter.svg", 512)
            .icon("phone", "demoApp/sharedResources/images/phone.svg", 512);

        $mdThemingProvider.theme("default")
            .primaryPalette("brown")
            .accentPalette("red");
    }
})();