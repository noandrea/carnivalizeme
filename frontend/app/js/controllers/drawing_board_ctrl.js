angular.module("app").controller('drawingBoardCtrl', function($rootScope, $scope, $document, controlsService, html5Storage, Masks, $location, $filter, lastWatchedImage, maskService, $analytics) {

    //put a placeholder in the right drawer
    lastWatchedImage.reset();

    //get controls
    controlsService.init();
    $scope.controls = controlsService.get();

    /**
     * delete everything from the board and leaves the board empty
     * 
     * @return {null}   [simply empty the board]
     */
    $scope.erase = function() {
        $analytics.eventTrack('Masterpiece Cleared', {  category: 'drawing mask'});
        var m = confirm($filter('translate')('CLEAR_MASTERPIECE'));
        if (m) {
            $scope.eraseImage();
            html5Storage.set('drawing_canvas', '');
            $scope.ctx.clearRect(0, 0, w, h);
            $scope.controls = controlsService.reset();
        }
    };
    $scope.eraseImage = function() {
        $analytics.eventTrack('Image Delete', {  category: 'drawing mask'});
        $scope.controls.image = {info : {}, position : { X : 0 , Y : 0}, rotation : 0, scale : 1};
        controlsService.set($scope.controls);
    };
    $scope.resetImage = function() {
        $analytics.eventTrack('Uploaded Image Reset', {  category: 'drawing mask'});
        $scope.controls.image = {info : $scope.controls.image.info, position : { X : 0 , Y : 0}, rotation : 0, scale : 1};
        $scope.controls = controlsService.set($scope.controls);
        //console.log('DONE', $scope.controls);
    };
    $scope.resetText = function() {
        $analytics.eventTrack('Text Reset', {  category: 'drawing mask'});
        $scope.controls.text = { content: "TEXT_HERE", position: {X : 260, Y : 380}, rotation : 0, scale : 1, color: "#24ab93"};
        $scope.controls = controlsService.set($scope.controls);
        //console.log('DONE', $scope.controls);
    };
    


    /**
     * Create the PNG image
     * 
     * @return {dataURL}    [the base64 image in an dataURL format eg. "data://bgf684df8s4s8..."]
     */
    $scope.save = function() {
        
        html2canvas(document.querySelector('#customMask'), 

            {
             onrendered: function(canvas) {

                //localStorage the mask (excluding the IMAGE)
                maskService.unsetMaskFromLocalStorage();
                var image         = new Image(canvas.width, canvas.height);
                image.src         = canvas.toDataURL("image/png");
                
                //console.log("image SRC: ", image.src);

                //flip the canvas to correctly display and show the image (generated with toDataURL)
                //and restore the context to correctly display it again in the "/editor" section
                canvasContext = canvas.getContext('2d');
                canvasContext.clearRect(0,0,canvas.width,canvas.height);
                canvasContext.save();
                canvasContext.translate(canvas.width, 0);
                canvasContext.scale(-1, 1);
                canvasContext.drawImage(image, 0, 0);
                canvasContext.restore();

                var img    = canvas.toDataURL("image/png");
                //console.log("IMG: ", image.src);

                var head = 'data:image/png;base64,';
                var imgFileSize = Math.round((img.length - head.length)*3/4) ;

                $scope.customMask = {   
                                        'type'      : 'png', 
                                        'tags'      : [],
                                        'audience'  : 0, 
                                        'email'     : "",
                                        'credits'   : "",
                                        'lang'      : $rootScope.lang,
                                        'size'      : imgFileSize,
                                        'ts'        : moment().format("X"),
                                        'image'     : img
                                    };

                //save the PNG image to test!
                maskService.storeMaskOnLocalStorage($scope.customMask);

                $analytics.eventTrack('Trying Mask', {  category: 'drawing mask'});

                $location.path('/trymask');
                $scope.$apply();

            },
            background: undefined,
            height: 960
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
        //console.log(args);
        //$scope.$apply(function () {            
            //add the file object to the scope's files collection
            //$scope.files.push(args.file);
            $analytics.eventTrack('File Upload Error', {  category: 'drawing mask'});
            alert($filter('translate')('IMAGES_ONLY'));
        //});
    });
    //listen for the file selected event
    $scope.$on("fileUploaded", function (event, args) {
        $scope.$apply(function () {
            $analytics.eventTrack('File Upload Success', {  category: 'drawing mask'});
            //set image
            $scope.controls.image.info      = args;
            //set new controls with image
            controlsService.set($scope.controls);
        });
    });

});