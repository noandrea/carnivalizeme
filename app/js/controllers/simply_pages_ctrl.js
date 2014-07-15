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

angular.module("app").controller('CarnivalCtrl', function($scope, Photos, lastWatchedImage) {

    //put a placeholder in the right drawer
    lastWatchedImage.reset();

    $scope.pageClass = 'page-carnival';
    $scope.photos = [];
    $scope.cr = null;

    //Next, Previous, First and Last Cursor
    $scope.nc = null;
    $scope.pc = null;
    $scope.fc = null;
    $scope.lc = null;

    var filter = {'cr' : $scope.cr};
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
                $scope.photos.splice(Math.floor(Math.random()*4), 0, {ad:true});
                $scope.photos.splice(Math.floor(Math.random()*5)+4, 0, {ad:true});
                $scope.photos.splice(Math.floor(Math.random()*5)+16, 0, {ad:true});
                $scope.photos.splice(Math.floor(Math.random()*5)+24, 0, {ad:true});
                
                $scope.pc = response.nc;    //Next Cursor
                $scope.nc = response.pc;    //Previous Cursor
                $scope.fc = response.fc;    //First Cursor
                $scope.lc = response.lc;    //Last Cursor

                console.log(filter);
                console.log('THE PHOTOS:', $scope.photos);
            }else{
                alert('NO photos!');
            }
        });
    };

    $scope.changePage = function(cr){
        filter = {'cr' : cr};
        $scope.getPhotos(cr);
    };
    
    $scope.getPhotos(filter);
});