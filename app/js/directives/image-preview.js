angular.module("app").directive('imagePreview', function(html5Storage, controlsService) {
  return {
    restrict: "A",
    replace: true,
    scope : {
                lastWatchedImage : '=image'
            },
    templateUrl: 'image_preview.html',
    link: function(scope, el, attrs){
        
        scope.doit = function(smt){
            alert(smt);
        };
    }
  };
});