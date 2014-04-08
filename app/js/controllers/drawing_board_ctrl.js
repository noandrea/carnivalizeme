angular.module("app").controller('drawingBoardCtrl', function($scope, $document, $rootScope, html5Storage, Masks, $location, $filter) {

    //init controls (from Storage if they exist)
    if(!html5Storage.get('controls')){
        $scope.controls     =   {
                                    showGrid    : true,
                                    brush       : { size : 4, blur : 0.9, fillStyle : "#9c9c9c" },
                                    image       : { info : {}, positionX : 0, positionY : 0, rotation : 0, scale : 1 }
                                };
        html5Storage.set('controls', $scope.controls);
    }else{
        $scope.controls     = html5Storage.get('controls');
    }

    /**
     * delete everything from the board and leaves the board empty
     * 
     * @return {null}   [simply empty the board]
     */
    $scope.erase = function() {
        var m = confirm($filter('translate')('CLEAR_MASTERPIECE'));
        if (m) {
            $scope.eraseImage();
            html5Storage.set('drawing_canvas', '');
            $scope.ctx.clearRect(0, 0, w, h);
        }
    };
    $scope.eraseImage = function() {
        $scope.controls.image = {info : {}, positionX : 0, positionY : 0, rotation : 0, scale : 1};
        html5Storage.set('controls', $scope.controls);
    };


    /**
     * Create the PNG image
     * 
     * @return {dataURL}    [the base64 image in an dataURL format eg. "data://bgf684df8s4s8..."]
     */
    $scope.save = function() {

        //localStorage the mask (excluding the IMAGE)
        html5Storage.set('the_mask', '');
        
        html2canvas(document.querySelector('#customMask'), 

            {
            onrendered: function(canvas) {

                var img    = canvas.toDataURL("image/png");

                var head = 'data:image/png;base64,';
                var imgFileSize = Math.round((img.length - head.length)*3/4) ;

                $scope.customMask = {   
                                        'type'      : 'png', 
                                        'tags'      : ['sto', 'caz', 'ciccio', 'bastardo'], 
                                        'audience'  : 0, 
                                        'email'     : "ciccio@bastardo.com",
                                        'credits'   : "ciccio bastardo http://www.cicciobastardo.com",
                                        'lang'      : "en",
                                        'size'      : imgFileSize,
                                        'ts'        : moment().format("X"),
                                        'image'     : img
                                    };

                //save the PNG image to test!
                html5Storage.set('the_mask', $scope.customMask);
                $location.path('/trymask');
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
    //listen for the file selected event
    $scope.$on("fileError", function (event, args) {
        console.log(args);
        //$scope.$apply(function () {            
            //add the file object to the scope's files collection
            //$scope.files.push(args.file);
            alert('Sorry, you can upload PNG images only.');
        //});
    });
    //listen for the file selected event
    $scope.$on("fileUploaded", function (event, args) {
        $scope.$apply(function () {
            console.log('uploaded');
            //here i could already send the image to the server
            //
            $scope.controls.image.info      = args;
        });
    });

});