angular.module("app").factory('lastWatchedImage', function($rootScope) {

    $rootScope.lastWatchedImage   = {};

    var self = {

        set: function (photo) {
            $rootScope.lastWatchedImage = photo;
        },

        get: function () {
            return $rootScope.lastWatchedImage;
        },

        reset: function () {
            $rootScope.lastWatchedImage       = {};
            $rootScope.lastWatchedImage.image = 'img/loading500.gif';
        }


    };

    return self;
});