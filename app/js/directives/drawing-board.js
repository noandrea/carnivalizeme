angular.module("app").directive('drawingBoard', function(html5Storage) {
  return {
    restrict: "E",
    controller: 'drawingBoardCtrl',
    replace: true,
    templateUrl: 'drawing_board.html',
    link: function(scope, el, attrs){
        //nothing here?
        //
        scope.$watchCollection('controls.brush', function(newVals, oldVals) {
            html5Storage.set('controls', scope.controls);
        });
        scope.$watchCollection('controls.text', function(newVals, oldVals) {
            html5Storage.set('controls', scope.controls);
        });
        scope.$watchCollection('controls.image', function(newVals, oldVals) {
            console.log('CHANGING CONTROLS');
            html5Storage.set('controls', scope.controls);
        });
        scope.$watchCollection('controls.showGrid', function(newVals, oldVals) {
            html5Storage.set('controls', scope.controls);
        });


        // {
        //     showGrid    : true,
        //     brush       : { size : 4, blur : 0.9, fillStyle : "#9c9c9c" },
        //     image       : { info : {}, positionX : 0, positionY : 0, rotation : 0, scale : 1 }
        // };
    }
  };
});