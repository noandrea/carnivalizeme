angular.module("app").factory('lastWatchedImage', function($rootScope, html5Storage) {

    $rootScope.lastWatchedImage     = {};
    $rootScope.allSeenImages        = [];

    var self = {

        set: function (photo) {
            $rootScope.lastWatchedImage = photo;
            if($rootScope.allSeenImages.indexOf(photo.id) === -1){
                $rootScope.allSeenImages.push(photo.id);
                html5Storage.set('allSeenImages', $rootScope.allSeenImages);
            }
        },

        get: function () {
            return $rootScope.lastWatchedImage;
        },

        reset: function () {
            $rootScope.lastWatchedImage       = {};
            $rootScope.lastWatchedImage.image = 'img/loading500.gif';
        },

        getWatchedImages: function (){
            if(html5Storage.get('allSeenImages')){
                return html5Storage.get('allSeenImages');
            }else{
                return $rootScope.allSeenImages;
            }
        }

    };

    return self;
});