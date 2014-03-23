angular.module("app").directive('drawingControls', function($document) {
  return {
    restrict: "E",
    controller: 'drawingBoardCtrl',
    replace: true,
    templateUrl: 'drawing_controls.html',
    link: function(scope, element, attrs){

        $document.on('keydown', function(e){

            switch(e.which){
                case 69: //letter "E" of Eraser
                    toggleBrush();
                    return;
                case 49:
                    setBrushSize(2);
                    return;
                case 50:
                    setBrushSize(4);
                    return;
                case 51:
                    setBrushSize(6);
                    return;
                case 52:
                    setBrushSize(8);
                    return;
                case 53:
                    setBrushSize(10);
                    return;
                case 54:
                    setBrushSize(12);
                    return;
                case 55:
                    setBrushSize(14);
                    return;
                case 56:
                    setBrushSize(16);
                    return;
                case 57:
                    setBrushSize(18);
                    return;
                case 48:
                    setBrushSize(20);
                    return;
                case 37:
                    changeBlur('more');
                    return;
                case 39:
                    changeBlur('less');
                    return;
                case 67:
                    scope.erase();
                    return;
                // following case is removed because it conflicts with the case:
                // "S" of SCALE
                /*case 83:
                    scope.save();
                    return;*/
            }
            scope.$apply();
        });

        function toggleBrush(){
            if(scope.ctx.globalCompositeOperation === "source-over"){
                scope.ctx.globalCompositeOperation = "destination-out";
            }else{
                scope.ctx.globalCompositeOperation = "source-over";
            }
        }

        function setBrushSize(size){
            scope.brushSize = size;
        }

        function changeBlur(how){
            switch(how){
                case 'less':
                    if(scope.blur - 0.1 > 0.1){
                        scope.blur -= 0.1;
                    }
                    break;
                case 'more':
                    if(scope.blur + 0.1 <= 1){
                        scope.blur += 0.1;
                    }
                    break;
            }
        }
    }
  };
});