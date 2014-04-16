angular.module("app").controller('AboutCtrl', function($scope) {
    
    $scope.pageClass = 'page-about';
    
});

angular.module("app").controller('TermsCtrl', function($scope) {
    
    $scope.pageClass = 'page-terms';
    
});

angular.module("app").controller('CarnivalCtrl', function($scope, Photos) {
    
    $scope.pageClass = 'page-carnival';
    $scope.photos = [];
/*
    $scope.photos.push({"id" : "01","audience": 0,"tags": ["black","white"],"added": "2014-03-30T14:08:49.613337", "stillimage": "http://bestclipartblog.com/clipart-pics/-test-clipart-9.jpg", "image": "http://upload.wikimedia.org/wikipedia/commons/0/0e/Pentagonalicositetrahedroncw.gif","up": 4,"dw": 0,"photo_count":0});
    $scope.photos.push({"id" : "02","audience": 0,"tags": ["black","white"],"added": "2014-03-30T14:08:49.613337", "stillimage": "http://bestclipartblog.com/clipart-pics/-test-clipart-9.jpg","image": "http://upload.wikimedia.org/wikipedia/commons/5/50/Triple-Spiral-Labyrinth-animated.gif","up": 4,"dw": 0,"photo_count":0});
    $scope.photos.push({"id" : "03","audience": 0,"tags": ["black","white"],"added": "2014-03-30T14:08:49.613337", "stillimage": "http://bestclipartblog.com/clipart-pics/-test-clipart-9.jpg","image": "http://i.imgur.com/4frTEpP.gif","up": 4,"dw": 0,"photo_count":0});
    $scope.photos.push({"id" : "04","audience": 0,"tags": ["black","white"],"added": "2014-03-30T14:08:49.613337", "stillimage": "http://bestclipartblog.com/clipart-pics/-test-clipart-9.jpg","image": "http://upload.wikimedia.org/wikipedia/commons/5/50/Triple-Spiral-Labyrinth-animated.gif","up": 4,"dw": 0,"photo_count":0});
    $scope.photos.push({"id" : "05","audience": 0,"tags": ["black","white"],"added": "2014-03-30T14:08:49.613337", "stillimage": "http://bestclipartblog.com/clipart-pics/-test-clipart-9.jpg","image": "https://lh5.googleusercontent.com/-jfmc_gfxbio/AAAAAAAAAAI/AAAAAAAAAr0/C7TKRSn7oD4/photo.jpg","up": 4,"dw": 0,"photo_count":0});
    $scope.photos.push({"id" : "06","audience": 0,"tags": ["black","white"],"added": "2014-03-30T14:08:49.613337", "stillimage": "http://bestclipartblog.com/clipart-pics/-test-clipart-9.jpg","image": "http://upload.wikimedia.org/wikipedia/commons/5/50/Triple-Spiral-Labyrinth-animated.gif","up": 4,"dw": 0,"photo_count":0});
*/

    var filter = {};
    $scope.getPhotos = function (){ //TODO: here i can paginate passing "page"
        
        // get data for the ...CARNIVAL!
        Photos.query(filter).$promise.then(function(response){
            if(response.length){
                console.log('THE PHOTOS:', response);
                $scope.photos = response;

                console.log($scope.photos);

            }else{
                alert('NO photos!');
            }
        });
    };
    
    $scope.getPhotos();
});