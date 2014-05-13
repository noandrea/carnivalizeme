angular.module("app").directive('drawingBoard', function(html5Storage, controlsService) {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'drawing_board.html',
    link: function(scope, el, attrs){
        //nothing here?
        //
        scope.$watchCollection('controls.brush', function(newVals, oldVals) {
            controlsService.set(scope.controls);
        });
        scope.$watchCollection('controls.text', function(newVals, oldVals) {
            controlsService.set(scope.controls);
            console.log("s>>>>>>>>>>>>>>>", scope.controls);
        });
        scope.$watchCollection('controls.image', function(newVals, oldVals) {
            controlsService.set(scope.controls);
        });
        scope.$watchCollection('controls.showGrid', function(newVals, oldVals) {
            controlsService.set(scope.controls);
        });
    }
  };
});