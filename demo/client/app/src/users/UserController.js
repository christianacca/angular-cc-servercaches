(function() {

    angular
        .module("users")
        .controller("UserController", [
            "userService", "$mdSidenav", "$mdBottomSheet", "$log", "$q",
            UserController
        ]);

    /**
   * Main Controller for the Angular Material Starter App
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
    function UserController(userService, $mdSidenav, $mdBottomSheet, $log, $q) {
        var self = this;

        self.selected = null;
        self.userDetail = null;
        self.isInit = true;
        self.isBusy = false;
        self.users = [];
        self.selectUser = selectUser;
        self.toggleUsersList = toggleUsersList;
        self.showContactOptions = showContactOptions;

        init();


        function init() {
            // Load all registered users

            userService
                .fetchAllUsers()
                .then(function (users) {
                    self.users = [].concat(users);
                    return selectUser(users[0]);
                }).finally(function() {
                    self.isInit = false;
                });
        }

        /**
         * First hide the bottomsheet IF visible, then
         * hide or Show the 'left' sideNav area
         */
        function toggleUsersList() {
            var pending = $mdBottomSheet.hide() || $q.when(true);

            return pending.then(function() {
                $mdSidenav("left").toggle();
            });
        }

        /**
         * Select the current avatars
         * @param menuId
         */
        function selectUser(user) {
            self.isBusy = true;
            return userService.fetchOneUser(user.name).then(function(userDetail) {
                    self.selected = user;
                    self.userDetail = userDetail;
                })
                .then(toggleUsersList)
                .finally(function() {
                    self.isBusy = false;
                });
        }

        /**
         * Show the bottom sheet
         */
        function showContactOptions($event) {
            var user = self.selected;

            return $mdBottomSheet.show({
                parent: angular.element(document.getElementById("content")),
                templateUrl: "/src/users/view/contactSheet.html",
                controller: ["$mdBottomSheet", ContactPanelController],
                controllerAs: "cp",
                bindToController: true,
                targetEvent: $event
            }).then(function(clickedItem) {
                clickedItem && $log.debug(clickedItem.name + " clicked!");
            });

            /**
             * Bottom Sheet controller for the Avatar Actions
             */
            function ContactPanelController($mdBottomSheet) {
                this.user = user;
                this.actions = [
                    { name: "Phone", icon: "phone", icon_url: "assets/svg/phone.svg" },
                    { name: "Twitter", icon: "twitter", icon_url: "assets/svg/twitter.svg" },
                    { name: "Google+", icon: "google_plus", icon_url: "assets/svg/google_plus.svg" },
                    { name: "Hangout", icon: "hangouts", icon_url: "assets/svg/hangouts.svg" }
                ];
                this.submitContact = function(action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }
    }

})();