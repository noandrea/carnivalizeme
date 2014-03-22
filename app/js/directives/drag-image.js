angular.module("app").directive('dragRotateResize', function($document) {
    return {
        restrict: 'EA',
        replace: true,
        link: function(scope, element, attr) {

            var startX = 0, startY = 0, x = 0 || 0, y = 0 || 0, action, rotationDeg = 0, scaleAmount = 1, startManimulate = 0;
 
            element.css({
                position: 'absolute',
                cursor: 'move',
                zindex: 9999999999999999999999999999
            });
 
            element.on('mousedown', function(event) {
                // Prevent default dragging of selected content
                event.preventDefault();


                //init. (only the first time)
                if(x===0 && y ===0){
                    x = element[0].x;
                    y = element[0].y;
                }

                startX = event.pageX - x;
                startY = event.pageY - y;

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
                        if(startManimulate===0){
                            startManimulate = event.pageX;
                        }
                        currentX    = event.pageX;
                        deviation   = startManimulate - currentX;

                        maxX        = 500;
                        maxRotate   = 360;
                        rotationDeg = Math.round(((deviation/maxX)*maxRotate)*10)/10;

                        element.css({
                            webkitTransform : 'scale('+scaleAmount+','+scaleAmount+') rotate('+rotationDeg+'deg)',
                            MozTransform    : 'scale('+scaleAmount+','+scaleAmount+') rotate('+rotationDeg+'deg)',
                            msTransform     : 'scale('+scaleAmount+','+scaleAmount+') rotate('+rotationDeg+'deg)',
                            OTransform      : 'scale('+scaleAmount+','+scaleAmount+') rotate('+rotationDeg+'deg)'
                        });

                    break;
                    case 'scale':
                        if(startManimulate===0){
                            startManimulate = event.pageX;
                        }
                        currentX    = event.pageX;
                        deviation   = Math.abs(startManimulate - currentX);

                        maxX        = 500;
                        maxScale    = 4;
                        scaleAmount = Math.round(((deviation/maxX)*maxScale)*10)/10;

                        element.css({
                            webkitTransform : 'scale('+scaleAmount+','+scaleAmount+') rotate('+rotationDeg+'deg)',
                            MozTransform    : 'scale('+scaleAmount+','+scaleAmount+') rotate('+rotationDeg+'deg)',
                            msTransform     : 'scale('+scaleAmount+','+scaleAmount+') rotate('+rotationDeg+'deg)',
                            OTransform      : 'scale('+scaleAmount+','+scaleAmount+') rotate('+rotationDeg+'deg)'
                        });

                    break;
                    default:
                        startManimulate = 0;
                        y = event.pageY - startY;
                        x = event.pageX - startX;
                        element.css({
                            top: y + 'px',
                            left:  x + 'px'
                        });
                    break;
                }

            }

            function mouseup() {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
            }
        }

    };

  });