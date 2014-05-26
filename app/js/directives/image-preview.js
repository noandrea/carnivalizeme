angular.module("app").directive('imagePreview', function(html5Storage, photoService) {
  return {
    restrict: "A",
    replace: true,
    scope : {
                lastWatchedImage : '=image'
            },
    templateUrl: 'image_preview.html',
    link: function(scope, el, attrs){
        
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