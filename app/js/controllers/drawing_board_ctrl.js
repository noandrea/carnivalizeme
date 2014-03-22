angular.module("app").controller('drawingBoardCtrl', function($scope) {

    $scope.showGrid     = true;
    $scope.brushSize    = 10;
    $scope.blur         = 0.9;

    /**
     * delete everything from the board and leaves the board empty
     * 
     * @return {null}   [simply empty the board]
     */
    $scope.erase = function() {
        var m = confirm("Want to clear");
        if (m) {
            $scope.uploadedImage = '';
            $scope.ctx.clearRect(0, 0, w, h);
        }
    };
    $scope.eraseImage = function() {
        $scope.uploadedImage = '';
        $scope.ctx.clearRect(0, 0, w, h);
    };

    /**
     * Create the PNG image
     * 
     * @return {dataURL}    [the base64 image in an dataURL format eg. "data://bgf684df8s4s8..."]
     */
    $scope.save = function() {
        
        /*
        var dataURL = $scope.canvas.toDataURL();

        var head = 'data:image/png;base64,';
        var imgFileSize = Math.round((dataURL.length - head.length)*3/4) ;

        $scope.customMask = {'size': imgFileSize, 'type': 'png','ts' : moment().format("X"), 'image': dataURL};
        */

        html2canvas(document.querySelector('#customMask'), 

            {
            onrendered: function(canvas) {
                var img    = canvas.toDataURL("image/gif");

                var head = 'data:image/gif;base64,';
                var imgFileSize = Math.round((img.length - head.length)*3/4) ;

                $scope.customMask = {'size': imgFileSize, 'type': 'png','ts' : moment().format("X"), 'image': img};
                console.log($scope.customMask);
                
                /*if(html5Storage.set('customMask', $scope.images)){
                    $scope.$apply();
                }*/
                $scope.$apply();
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



    //+++++++++++++++++++++++++++++++++++++++ MANAGE UPLOAD of a USER IMAGE
    $scope.files = [];
    //listen for the file selected event
    $scope.$on("fileError", function (event, args) {
        $scope.$apply(function () {            
            //add the file object to the scope's files collection
            //$scope.files.push(args.file);
            alert('Sorry, you can upload PNG images only.', "&#127748;");
        });
    });
    //listen for the file selected event
    $scope.$on("fileUploaded", function (event, args) {
        $scope.$apply(function () {
            console.log(event, args);
            //here i could already send the image to the server
            $scope.uploadedImage      = args;
        });
    });

});