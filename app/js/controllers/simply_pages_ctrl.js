angular.module("app").controller('AboutCtrl', function($scope) {
    
    $scope.pageClass = 'page-about';
    
});

angular.module("app").controller('TermsCtrl', function($scope) {
    
    $scope.pageClass = 'page-terms';
    
});

angular.module("app").controller('CarnivalCtrl', function($scope, Photos) {
    
    $scope.pageClass = 'page-carnival';
    $scope.photos = [];
    
    var filter = {};
    $scope.getPhotos = function (){ //TODO: here i can paginate passing "page"
        
        // get data for the ...CARNIVAL!
        Photos.query(filter).$promise.then(function(response){
            if(response.length){
                console.log('THE PHOTOS:', response);
                $scope.photos = response;
                //add 3 ads on random position between 0 and 11
                $scope.photos.splice(Math.floor(Math.random()*5)+1, 0, {ad:true});
                $scope.photos.splice(Math.floor(Math.random()*5)+6, 0, {ad:true});
                $scope.photos.splice(Math.floor(Math.random()*5)+11, 0, {ad:true});
                console.log($scope.photos);

            }else{
                alert('NO photos!');
            }
        });
    };
    
    $scope.getPhotos();
});