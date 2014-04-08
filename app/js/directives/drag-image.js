angular.module("app").directive('dragRotateResize', function($document, html5Storage) {
    return {
        restrict: 'EA',
        replace: true,
        link: function(scope, element, attr) {

            var rotationDeg = scope.controls.image.rotation;
            var scaleAmount = scope.controls.image.scale;
            var positionX   = scope.controls.image.positionX;
            var positionY   = scope.controls.image.positionY;

            var startX = 0, startY = 0, action, startManipulating = 0, style, position;
 
            //make sure the image is positioned right when it shows up in the DOM
            element.css({
                position: 'absolute',
                cursor: 'move',
                zindex: 9999999999999999999999999999,
                top: positionY+'px',
                left: positionX+'px'
            });


            //watch scale property for change and assign the new value to the image
            scope.$watch('controls.image.scale', function(newScaleVal, oldScaleVal) {
                //assign styles!
                scaleAmount = newScaleVal;
                assignStyle(rotationDeg, newScaleVal);
            });
            //watch rotation property for change and assign the new value to the image
            scope.$watch('controls.image.rotation', function(newRotationVal, oldRotationVal) {
                rotationDeg = newRotationVal;
                assignStyle(newRotationVal, scaleAmount);
            });


            element.on('mousedown', function(event) {
                // Prevent default dragging of selected content
                event.preventDefault();


                //init. (only the first time)
                if(positionX===0 && positionY===0){
                    positionX = element[0].x;
                    positionY = element[0].y;
                    startX = event.pageX;
                    startY = event.pageY;
                }else{
                    startX = event.pageX - positionX;
                    startY = event.pageY - positionY;
                }

                console.log("MOUSEDOWN", event.pageX - startX, event.pageX, startX);

                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            $document.on('keydown', function(e){
                //console.log(e.which);

                if(e.which === 82){
                    action = 'rotate';
                }else if(e.which === 83){
                    action = 'scale';
                }else{
                    action = '';
                }

            });

            $document.on('keyup', function(e){
                action = '';
            });

            function mousemove(event) {
                
                switch(action){
                    case 'rotate':
                        //calculate scale based on "deviation"
                        if(startManipulating===0){
                            startManipulating = event.pageX;
                        }
                        currentX    = event.pageX;
                        deviation   = startManipulating - currentX;
                        maxX        = 500;
                        maxRotate   = 360;
                        rotationDeg = Math.abs(Math.round((deviation/maxX)*maxRotate));

                        if(rotationDeg>360){
                            rotationDeg = 360;
                        }
                        console.log('ROTATTION: ' , rotationDeg);
                        //assign the new values
                        assignStyle(rotationDeg, scaleAmount);

                    break;
                    case 'scale':
                        //calculate scale based on "deviation"
                        if(startManipulating===0){
                            startManipulating = event.pageX;
                        }
                        currentX    = event.pageX;
                        deviation   = Math.abs(startManipulating - currentX);
                        maxX        = 500;
                        maxScale    = 4;
                        scaleAmount = Math.round(((deviation/maxX)*maxScale)*10)/10;

                        //assign the new values
                        assignStyle(rotationDeg, scaleAmount);

                    break;
                    default:
                        //console.log("MOVING", event.pageX - startX, event.pageX, startX);
                        startManipulating = 0;
                        scope.controls.image.positionY = positionY = event.pageY - startY;
                        scope.controls.image.positionX = positionX = event.pageX - startX;

                        position = { top: positionY + 'px',left:  positionX + 'px' };
                        element.css(position);
                    break;
                }
                scope.controls.image.scale      = scaleAmount;
                scope.controls.image.rotation   = rotationDeg;
                //scope.controls.image.positionX and  scope.controls.image.positionY
                //are also set, but it's done in the "default:" case onmousemove





            }

            function assignStyle(rotation, scale){

                style = {
                    webkitTransform : 'scale('+scale+','+scale+') rotate('+rotation+'deg)',
                    MozTransform    : 'scale('+scale+','+scale+') rotate('+rotation+'deg)',
                    msTransform     : 'scale('+scale+','+scale+') rotate('+rotation+'deg)',
                    OTransform      : 'scale('+scale+','+scale+') rotate('+rotation+'deg)'
                };
                element.css(style);

                html5Storage.set('controls', scope.controls);

            }

            function mouseup() {
                //save current control settings
                html5Storage.set('controls', scope.controls);
                //console.log(scope.controls.image.scale, scope.controls.image.positionX, scope.controls.image.positionY);
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
            }
        }

    };

  });