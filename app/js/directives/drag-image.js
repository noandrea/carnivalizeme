angular.module("app").directive('dragRotateResize', function($document, controlsService) {
    return {
        restrict: 'EA',
        replace: true,
        link: function(scope, element, attr) {

            var controls = controlsService.get();

            var startX = 0, startY = 0, action, startManipulating = 0, style, the_position;

            var rotationDeg = attr.type === 'image' ? controls.image.rotation     : controls.text.rotation;
            var scaleAmount = attr.type === 'image' ? controls.image.scale        : controls.text.scale;
 

            //set basic CSS properties
            element.css({
                position: 'absolute',
                cursor: 'move'
            });

            if(attr.type === 'image'){
                scope.$watchCollection('controls.image', function(newVals) {
                    newPosition = { top: newVals.position.Y + 'px',left:  newVals.position.X + 'px' };
                    scaleAmount = newVals.scale;
                    rotationDeg = newVals.rotation;
                    assignStyle(rotationDeg, scaleAmount);
                    element.css(newPosition);
                });
            }else{
                //watch rotation property for change and assign the new value to the image
                scope.$watchCollection('controls.text', function(newVals) {
                    newPosition = { top: newVals.position.Y + 'px',left:  newVals.position.X + 'px' };
                    scaleAmount = newVals.scale;
                    rotationDeg = newVals.rotation;
                    assignStyle(rotationDeg, scaleAmount);
                    element.css(newPosition);
                });
            }



            element.on('mousedown', function(event) {
                the_position    = attr.type === 'image' ? controls.image.position     : controls.text.position;
                // Prevent default dragging of selected content
                event.preventDefault();

                //init. (only the first time)
                if((the_position.X === 0 && the_position.Y === 0) || (isNaN(the_position.X) && isNaN(the_position.Y))){
                    the_position.X = element[0].x;
                    the_position.Y = element[0].y;
                    console.log(the_position);
                    startX = event.pageX;
                    startY = event.pageY;
                }else{
                    console.log('CRISTO BASTARDO');
                    startX = event.pageX - the_position.X;
                    startY = event.pageY - the_position.Y;
                }

                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            $document.on('keydown', function(e){
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
                    console.log('dragging');
                        startManipulating = 0;
                        if(attr.type === 'image'){
                            controls.image.position.Y = the_position.Y = event.pageY - startY;
                            controls.image.position.X = the_position.X = event.pageX - startX;
                        }else{
                            controls.text.position.Y = the_position.Y = event.pageY - startY;
                            controls.text.position.X = the_position.X = event.pageX - startX;
                        }

                        positionToSet = { top: the_position.Y + 'px',left:  the_position.X + 'px' };
                        element.css(positionToSet);
                    break;
                }

                if(attr.type === 'image'){
                    controls.image.scale      = scaleAmount;
                    controls.image.rotation   = rotationDeg;
                }else{
                    controls.text.scale       = scaleAmount;
                    controls.text.rotation    = rotationDeg;
                }

                //are also set, but it's done in the "default:" case onmousemove





            }

            function assignStyle(rotation, scale){

                style = {
                    webkitTransform : 'scale('+scale+','+scale+') rotate('+rotation+'deg) translate3d(0,0,0)',
                    MozTransform    : 'scale('+scale+','+scale+') rotate('+rotation+'deg) translate3d(0,0,0)',
                    msTransform     : 'scale('+scale+','+scale+') rotate('+rotation+'deg) translate3d(0,0,0)',
                    OTransform      : 'scale('+scale+','+scale+') rotate('+rotation+'deg) translate3d(0,0,0)'
                };
                element.css(style);

            }

            function mouseup() {
                controlsService.set(controls);
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
            }
        }

    };

  });