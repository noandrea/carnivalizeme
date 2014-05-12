angular.module("app").directive('drawingControls', function($document, $location, html5Storage) {
  return {
    restrict: "E",
    controller: 'drawingBoardCtrl',
    replace: true,
    templateUrl: 'drawing_controls.html',
    link: function(scope, element, attrs){



        $document.on('keydown', function(e){

            if($location.path() === '/editor'){

                console.log(e.which);
                if(e.ctrlKey && e.which){
                    switch(e.which){
                        case 69: //letter "E" of Eraser
                            toggleBrush();
                            break;
                        case 49:
                            setBrushSize(2);
                            break;
                        case 50:
                            setBrushSize(4);
                            break;
                        case 51:
                            setBrushSize(6);
                            break;
                        case 52:
                            setBrushSize(8);
                            break;
                        case 53:
                            setBrushSize(10);
                            break;
                        case 54:
                            setBrushSize(12);
                            break;
                        case 55:
                            setBrushSize(14);
                            break;
                        case 56:
                            setBrushSize(16);
                            break;
                        case 57:
                            setBrushSize(18);
                            break;
                        case 48:
                            setBrushSize(20);
                            break;
                        case 37:
                            changeBlur('more');
                            break;
                        case 39:
                            changeBlur('less');
                            break;
                        case 67:
                            scope.erase();
                            break;
                        case 84:
                            scope.save();
                            break;
                        default:
                            break;
                    }
                }
                
                scope.$apply();
            }
        });

        function toggleBrush(){
            if(scope.ctx.globalCompositeOperation === "source-over"){
                scope.ctx.globalCompositeOperation = "destination-out";
            }else{
                scope.ctx.globalCompositeOperation = "source-over";
            }
        }

        function setBrushSize(size){
            scope.controls.brush.size = size;
        }

        function changeBlur(how){
            switch(how){
                case 'less':
                    if(scope.controls.brush.blur - 0.1 > 0.1){
                        scope.controls.brush.blur -= 0.1;
                    }
                    break;
                case 'more':
                    if(scope.controls.brush.blur + 0.1 <= 1){
                        scope.controls.brush.blur += 0.1;
                    }
                    break;
            }
        }
    }
  };
});