angular.module("app").controller('AboutCtrl', function($scope, lastWatchedImage) {
    
    //put a placeholder in the right drawer
    lastWatchedImage.reset();

    $scope.pageClass = 'page-about';
    
});

angular.module("app").controller('TermsCtrl', function($scope, lastWatchedImage) {

    //put a placeholder in the right drawer
    lastWatchedImage.reset();

    $scope.pageClass = 'page-terms';
    
});

angular.module("app").controller('CarnivalCtrl', function($scope, $rootScope, html5Storage, Photos, lastWatchedImage, userService) {

    //check Age
    $rootScope.checkAge();

    //put a placeholder in the right drawer
    lastWatchedImage.reset();

    $scope.pageClass = 'page-carnival';
    $scope.photos = [];
    $scope.cr = null;

    //Next, Previous, First and Last Cursor
    $scope.nc = null;
    $scope.pc = null;

    var filter = {'cr' : $scope.cr, 'a' : userService.get().age_filter};
    $scope.getPhotos = function (filter){ //TODO: here i can paginate passing "page"
        
        // get data for the ...CARNIVAL!
        Photos.query(filter).$promise.then(function(response){
            if(response.photos.length){

                $scope.photos = response.photos;

                angular.forEach($scope.photos, function(photo, key) {
                    angular.forEach(lastWatchedImage.getWatchedImages(), function(idPhoto, keyWatched){
                        if(idPhoto === $scope.photos[key].id){
                            $scope.photos[key].seen = 1;
                        }
                    });
                });

                //add 3 ads on random positions
                $scope.photos.splice(Math.floor(Math.random()*4)+16, 0, {ad:true});
                /*$scope.photos.splice(Math.floor(Math.random()*5)+4, 0, {ad:true});
                $scope.photos.splice(Math.floor(Math.random()*5)+16, 0, {ad:true});
                $scope.photos.splice(Math.floor(Math.random()*5)+24, 0, {ad:true});*/
                
                $scope.pc = response.pc;    //Next Cursor
                $scope.nc = response.nc;    //Previous Cursor

            }else{
                alert('NO photos!');
            }
        });
    };

    $scope.changePage = function(cr, dir, tags){

        filter = {  'cr'    : cr,
                    'd'     : dir,
                    'tags'  : tags,
                    'a'     : userService.get().age_filter
                 };
        $scope.getPhotos(filter);
    };
    
    $scope.getPhotos(filter);
});