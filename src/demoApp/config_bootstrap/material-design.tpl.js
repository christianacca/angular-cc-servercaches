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
            .defaultIconSet("{{imagePath}}avatars.svg", 128)
            .iconSet("nav", "{{imagePath}}svg-sprite-navigation.svg", 24)
            .icon("menu", "{{imagePath}}menu.svg", 24)
            .icon("share", "{{imagePath}}share.svg", 24)
            .icon("google_plus", "{{imagePath}}google_plus.svg", 512)
            .icon("hangouts", "{{imagePath}}hangouts.svg", 512)
            .icon("twitter", "{{imagePath}}twitter.svg", 512)
            .icon("phone", "{{imagePath}}phone.svg", 512);

        $mdThemingProvider.theme("default")
            .primaryPalette("brown")
            .accentPalette("red");
    }
})();