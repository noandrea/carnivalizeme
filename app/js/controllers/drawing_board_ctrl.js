angular.module("app").controller('drawingBoardCtrl', function($scope, $document, $rootScope, html5Storage, Masks) {

    $scope.showGrid     = true;
    $scope.brushSize    = 4;
    $scope.blur         = 0.9;

    /**
     * delete everything from the board and leaves the board empty
     * 
     * @return {null}   [simply empty the board]
     */
    $scope.erase = function() {
        var m = confirm("You're about to destroy yout masterpiece!");
        if (m) {
            $scope.eraseImage();
            html5Storage.set('drawing_canvas', '');
            $scope.ctx.clearRect(0, 0, w, h);
        }
    };
    $scope.eraseImage = function() {
        html5Storage.set('uploadedImage_style', '');
        html5Storage.set('uploadedImage_position', '');
        html5Storage.set('uploadedImage', '');
        if(document.querySelector('#upped-image')){
            angular.element(document.querySelector('#upped-image')).css({   webkitTransform : '',
                                                                            MozTransform    : '',
                                                                            msTransform     : '',
                                                                            OTransform      : '',
                                                                            top             : '',
                                                                            left            : ''
                                                                        });
        }
        console.log(document.querySelector('#upped-image'));
        $scope.uploadedImage = '';
    };


    /**
     * Create the PNG image
     * 
     * @return {dataURL}    [the base64 image in an dataURL format eg. "data://bgf684df8s4s8..."]
     */
    $scope.save = function() {

        /*
        canvasContext      = $scope.canvas.getContext('2d');

        var uppedImage      = new Image();
            uppedImage.src  = $scope.uploadedImage.fileBase64; //"img/mask_headglass.png";

        canvasContext.drawImage(uppedImage, 0 ,0);
        var dataURL = $scope.canvas.toDataURL();

        var head = 'data:image/png;base64,';
        var imgFileSize = Math.round((dataURL.length - head.length)*3/4) ;

        $scope.customMask = {'size': imgFileSize, 'type': 'png','ts' : moment().format("X"), 'image': dataURL};
        */
        
        //localStorage the mask (excluding the IMAGE)
        html5Storage.set('drawing_canvas', $scope.canvas, 'canvas');
        
        html2canvas(document.querySelector('#customMask'), 

            {
            onrendered: function(canvas) {
                var img    = canvas.toDataURL("image/png");

                var head = 'data:image/png;base64,';
                var imgFileSize = Math.round((img.length - head.length)*3/4) ;

                $scope.customMask = {'size': imgFileSize, 'type': 'png','ts' : moment().format("X"), 'image': img, credits: 'http://www.ciao.com'};

                //save the PNG image to test!
                html5Storage.set('the_mask', $scope.customMask);

                $scope.$apply();


                var mask = {};
                mask = {
                            'mask' : img,   
                            'meta' : { 'tags'       : ['sto', 'caz', 'ciccio', 'bastardo'], 
                                        'audience'  : 0, 
                                        'email'     : "ciccio@bastardo.com",
                                        'credit'    : "ciccio bastardo http://www.cicciobastardo.com"
                                     }
                        };
                
                alert('saving to DB');
                Masks.save(mask);
                alert('saved to DB');

            },
            background: undefined
        });
    };


    /**
     * This activate the eraser so that you can delete previously drawn stuff
     * 
     * @return {null}           [nothing]
     */
    $scope.setEraser = function() {
        $scope.ctx.globalCompositeOperation = "destination-out";
    };

    /**
     * This activate the eraser so that you can delete previously drawn stuff
     * 
     * @return {null}           [nothing]
     */
    $scope.setBrush = function() {
        $scope.ctx.globalCompositeOperation = "source-over";
    };

});