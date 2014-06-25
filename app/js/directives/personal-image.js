//create directive and INJECT optixCalService
angular.module("app").directive('personalImage', function(photoService, $rootScope) {
    return {
        restrict: 'E',
        replace: true,
        scope : {
            'personalImg' : '=img',
            'allImages'   : '=allImages'
        },
        templateUrl: "personal_image.html",
        link: function(scope, element, attrs) {

            scope.showMenu = true;

            element.bind('mouseenter', function () {
                scope.showMenu = true;
                scope.$apply();
            });

            element.bind('mouseleave', function () {
                scope.showMenu = false;
                scope.$apply();
            });

            /**
             * remove an image from the images array
             * and scroll to the top
             * 
             * @param  {photoObject}   img  [the img object]
             * @return {null}               [pops out the image from the photos collection]
             */
            scope.removeImage = function(img){
                console.log(img);
                photoService.removePhotoFromCollection(img);
            };

            /**
             * updates the photo collections in the app
             * NOTE: photoService.savePhotoOnDB emits "imagesListChaged"
             * for this controller to update data when the request is done
             * 
             * @param  {object} photoObj             [the photoObject]
             * @return {EMIT}                        [emits "photoService.savePhotoOnDB" on $rootScope]
             */
            scope.savePhoto = function(img){
                img.lang = $rootScope.lang;
                console.log('save this', img);
                photoService.savePhotoOnDB(img);
            };

        }
    };
});