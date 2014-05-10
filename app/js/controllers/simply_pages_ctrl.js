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

angular.module("app").controller('CarnivalCtrl', function($scope, Photos, snapRemote, lastWatchedImage) {

    //put a placeholder in the right drawer
    lastWatchedImage.reset();

    //close snappe and disable sliding
    snapRemote.close();
    snapRemote.getSnapper().then(function(snapper) {
        snapper.enable();
    });
    
    $scope.pageClass = 'page-carnival';
    $scope.photos = [];

    var filter = {};
    $scope.getPhotos = function (){ //TODO: here i can paginate passing "page"
        
        // get data for the ...CARNIVAL!
        Photos.query(filter).$promise.then(function(response){
            if(response.length){
                console.log('THE PHOTOS:', response);
                $scope.photos = response;
                //add 3 ads on random positions
                $scope.photos.splice(Math.floor(Math.random()*4), 0, {ad:true});
                $scope.photos.splice(Math.floor(Math.random()*5)+4, 0, {ad:true});
                $scope.photos.splice(Math.floor(Math.random()*5)+9, 0, {ad:true});
                $scope.photos.splice(Math.floor(Math.random()*5)+19, 0, {ad:true});
                console.log($scope.photos);
            }else{
                alert('NO photos!');
            }
        });
    };
    
    $scope.getPhotos();
});