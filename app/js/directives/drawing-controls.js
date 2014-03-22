angular.module("app").directive('drawingControls', function($document) {
  return {
    restrict: "E",
    controller: 'drawingBoardCtrl',
    replace: true,
    templateUrl: 'drawing_controls.html',
    link: function(scope, element, attrs){

        $document.on('keydown', function(e){
            if(e.which === 69){ //letter "E" of Eraser
                toggleBrush();
                return;
            }
        });

        function toggleBrush(){
            if(scope.ctx.globalCompositeOperation === "source-over"){
                scope.ctx.globalCompositeOperation = "destination-out";
            }else{
                scope.ctx.globalCompositeOperation = "source-over";
            }
            scope.$apply();
        }
    }
  };
});