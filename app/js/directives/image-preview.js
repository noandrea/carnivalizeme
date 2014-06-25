angular.module("app").directive('imagePreview', function(html5Storage, photoService, ENVIRONMENT) {
  return {
    restrict: "A",
    replace: true,
    scope : {
                lastWatchedImage : '=image'
            },
    templateUrl: 'image_preview.html',
    link: function(scope, el, attrs){
        
        if(ENVIRONMENT === 'dev'){
            scope.SITE_URL = 'http://localhost:8080';
        }else{
            scope.SITE_URL = 'http://carnivalize.me';
        }


        scope.votePhoto = function(id, upDw){
            
            if(upDw === 'up'){
                photoService.voteup(id);
                scope.lastWatchedImage.up ++;
            }else{
                photoService.votedown(id);
                scope.lastWatchedImage.dw ++;
            }
        };
    }
  };
});