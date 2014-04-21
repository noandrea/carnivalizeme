angular.module("app").controller('MainCtrl', function($scope, $location, trackingService, html5Storage, Masks, Photos, $translate, $filter, API_BASE_URL, $rootScope, maskService, photoService, snapRemote) {


    //close snappe and disable sliding
    snapRemote.close();
    snapRemote.getSnapper().then(function(snapper) {
        snapper.disable();
    });
    
    $scope.showVideo        = false;
    $scope.showControls     = false;
    $scope.showStart        = true;
    $scope.pageClass        = 'page-main';
    $scope.isRunning        = false;
    $scope.showMask         = true;
    $scope.showImage        = true;
    $scope.isCameraInactive   = true;

    $scope.allSelectedMasks = [];
    $scope.images           = [];

    $scope.selectedMask     = maskService.init($rootScope.lang);
    $scope.currentPhoto     = photoService.init($rootScope.lang);


    $scope.mode = 'play';
    if($location.$$path === '/trymask'){
        $scope.mode         = 'save';
        $scope.showVideo    = true;
    }

    //wait one second to start tracking
    //this makes sure that elements are already on the DOM
    if($scope.mode === 'save'){
        setTimeout(function() {
            $scope.startFun();
        }, 1000); 
    }


    var videoInput,
        canvasInput,
        canvasOverlay,
        debugOverlay,
        overlayContext,
        enlargetWidth,
        enlargetHeight,
        videoBlock;

    var controlsWidth   = 40; //squares 38x38px (with border:1px)

    var videoWidth,videoHeight;
    var degrees = 0;
    var maskIndex       = 0;

    var filter = {};//{upcoming: true, workstation_id: $routeParams.workstation_id, order : 'check_in_date,check_in_time'};


    /**
     * remove an image from the images array
     * and scroll to the top
     * 
     * @param  {number} imageIndex  [the index of the array]
     * @return {null}               [pops out the image from the photos collection]
     */
    $scope.removeImage = function(imageIndex){
        photoService.removePhotoFromCollection(imageIndex);
    };

    /**
     * Saves the mask on DB!
     * @return {object} [the mask object]
     */
    $scope.saveMaskOnDB = function(maskObj){
        maskObj.lang = $rootScope.lang;
        console.log('save this', maskObj);
        maskService.saveMaskOnDB(maskObj);
    };

    /**
     * updates the photo collections in the app
     * NOTE: photoService.savePhotoOnDB emits "imagesListChaged"
     * for this controller to update data when the request is done
     * 
     * @param  {object} photoObj             [the photoObject]
     * @param  {number} photoCollectionIndex [the index of the ]
     * @return {EMIT}                        [emits "photoService.savePhotoOnDB" on $rootScope]
     */
    $scope.savePhotoOnDB = function(photoObj, photoCollectionIndex){
        photoObj.lang = $rootScope.lang;
        console.log('save this', photoObj);
        photoService.savePhotoOnDB(photoObj, photoCollectionIndex);
    };

    $scope.$on('imagesListChaged', function(newList) {
        console.log('list changed, emit listened!');
        $scope.images = newList;
    });

    /**
     * activate the possibility to click on left-right arrow and change the mask
     * 
     * @param  {number} step    [negative or positive steps...eg: "+1" or "-1"]
     * @return {null}           [changes stickImage and set selectedMask obj]
     */
    $scope.changeMask = function (step){

        if(maskService.masks.length){
            maskIndex += step;
            if(maskIndex > (maskService.masks.length-1)){
                maskIndex = 0;
            }else if(maskIndex < 0){
                maskIndex = maskService.masks.length-1;
            }
            console.log('MASK #'+maskIndex);
            
            maskService.setCurrent(maskService.masks[maskIndex]);
            $scope.selectedMask = maskService.masks[maskIndex];

            $scope.credits = maskService.masks[maskIndex].credits;
        }else{
            alert('There are NO masks!');
        }
    };


    /**
     * starts the video player and put the controls (play/stop/picture/reset, etc.) in the right place
     * depending on the player style (big, small, default)
     * 
     * @param  {string} style   [big, small, default]
     * @return {null}           [put in position all controls, messages, etc.]
     */
    $scope.videoPlayerStyle = function(style){

        if(style === 'big'){
            videoWidth  = 920;      // 320 - 640 - 920
            videoHeight = 690;      // 240 - 480 - 690
        }else if(style === 'small'){
            videoWidth  = 320;
            videoHeight = 240;
        }else{
            videoWidth  = 640;
            videoHeight = 480;
        }

        $scope.videoWidth   = videoWidth;
        $scope.videoHeight  = videoHeight;

        //set video block dimention
        videoBlock              = document.querySelector('.videoBlock');
        videoBlock.style.width  = videoWidth  + "px";
        videoBlock.style.height = videoHeight + "px";

        //set cover block dimention
        cover                   = document.querySelector('.cover');
        cover.style.width       = videoWidth  + "px";
        cover.style.height      = videoHeight + "px";

        //set video block dimention
        messages                = document.querySelector('.messages');
        messages.style.width    = videoWidth  + "px";
        messages.style.height   = (videoHeight-40) + "px";
        //set controls position
        var controls            = document.querySelector('.controls');
        controls.style.marginLeft   = "10px";
        controls.style.marginTop    = ((videoHeight - controlsWidth)-10) + "px";

    };


    /**
     * Starts the webcam (GetUserMedia) by firing "init" from the trackingService
     * 
     * @return {null} [starts the tracker and its tracking events]
     */
    $scope.startWebCam = function(){
        videoInput          = document.querySelector('#vid');
        canvasInput         = document.querySelector('#compare');
        canvasOverlay       = document.querySelector('#overlay');
        //debugOverlay        = document.querySelector('#debug');
        
        overlayContext      = canvasOverlay.getContext('2d');

        //set canvas with video content
        canvasInput.width   = videoWidth;
        canvasInput.height  = videoHeight;
        //set canvas with overlay(s)
        canvasOverlay.width = videoWidth;
        canvasOverlay.height= videoHeight;
        canvasOverlay.style.marginTop = "-" + (videoHeight+2) + "px";

        //init and start tracking
        if($scope.isRunning){ $scope.stopTracking(); }
        trackingService.init(videoInput, canvasInput, false);
        $scope.restartTracking();

        $scope.showVideo    = true;
        $scope.showControls = true;


        // "getUserMedia" : getUserMedia seems to be supported
        // "no getUserMedia" : getUserMedia seems not to be supported
        // "camera found" : camera found and allowed to stream
        // "no camera" : camera not found, or streaming not allowed, or getUserMedia setup failed
        // "whitebalance" : initialized detection of graylevels
        // "detecting" : initialized detection of face
        // "hints" : detecting the face took more than 5 seconds
        // "found" : face detected, tracking initialized
        // "lost" : lost tracking of face
        // "redetecting" : trying to redetect face
        // "stopped" : face tracking was stopped
        document.addEventListener('headtrackrStatus', function (event) {

            $scope.cameraMsg        = {};
            $scope.cameraMsg.icon   = ''; 
            canvasOverlay.style.display = "none";

            switch(event.status){
                case "getUserMedia":
                    $scope.cameraMsg.msg = $filter('translate')('CAMERA_SUPPORT');
                    $scope.isCameraInactive = true;
                    break;
                case "no getUserMedia":
                    $scope.cameraMsg.msg = $filter('translate')('GET_USER_MEDIA');
                    $scope.isCameraInactive = true;
                    break;
                case "no camera":
                    $scope.cameraMsg.msg = $filter('translate')('NO_CAMERA');
                    $scope.showControls = false;
                    $scope.isCameraInactive = true;
                    break;
                case "whitebalance":
                    $scope.cameraMsg.msg = $filter('translate')('WHITE_BALANCE');
                    $scope.isCameraInactive = false;
                    break;
                case "detecting":
                    $scope.cameraMsg.msg    = $filter('translate')('DETECTING');
                    $scope.cameraMsg.icon   = "face";
                    $scope.isCameraInactive = false;
                    break;
                case "found":
                    $scope.cameraMsg.msg = ""; //empy message so the DIV disappear
                    canvasOverlay.style.display = "block";
                    $scope.isCameraInactive = false;
                    break;
                case "hints":
                    $scope.cameraMsg.msg = $filter('translate')('HINTS');
                    $scope.cameraMsg.icon   = "brightness";
                    $scope.isCameraInactive = false;
                    break;
                case "stopped":
                    $scope.cameraMsg.msg = "";
                    canvasOverlay.style.display = "block";
                    $scope.isCameraInactive = false;
                    break;
            }

            if(!$scope.$$phase){ $scope.$apply(); }
        });

        //check if the camera is shown...if it's not, the "ALLOW CAMERA" message DIV will appear
        //and the header has to go away....
        $scope.$watch('isCameraInactive', function(newVal, oldVal){
            if(newVal){
                document.querySelector('header').style.display = "none";
            }else{
                document.querySelector('header').style.display = "block";
            }
        });
        //store selectedMask object in localstorage
        $scope.$watch('selectedMask', function(newVal, oldVal){
            if(newVal){
                document.querySelector('header').style.display = "none";
            }else{
                document.querySelector('header').style.display = "block";
            }
        });


        //listen to tracking events
        document.addEventListener("facetrackingEvent", function( event ) {

            try {
                // clear canvas (HACK)                      // HACK! (from http://www.html5rocks.com/en/tutorials/canvas/performance/) 
                canvasOverlay.width = canvasOverlay.width;  // this is an hack to clear the cnavas. the regular way would be:
                                                            // overlayContext.clearRect(0,0,videoWidth,videoHeight);
                
                // once we have stable tracking, draw rectangle
                if (event.detection === "CS") {

                    //enlarge! For the overlay to be 3x bigger for more fun!
                    enlargetWidth     = event.width  * 3;
                    enlargetHeight    = event.height * 3 ;

                    degrees = event.angle-(Math.PI/2);
                    degrees = Math.round(degrees * 100) / 100;
                    overlayContext.translate(event.x, event.y);
                    overlayContext.rotate(degrees);
                    
                    //Draw a rectangle where the face is:
                    //overlayContext.strokeStyle = "red";
                    //overlayContext.strokeRect((-(event.width/2)) >> 0, (-(event.height/2)) >> 0, event.width, event.height);
                    
                    degrees = (Math.PI/2)-event.angle;
                    degrees = Math.round(degrees * 100) / 100;
                    overlayContext.drawImage(maskService.getStickImage(),-enlargetWidth/2, -enlargetHeight/2, enlargetWidth, enlargetHeight);
                    overlayContext.rotate(degrees);
                    overlayContext.translate(-event.x, -event.y);
                }

            }catch(e){
                console.log(e);
                $scope.stopTracking();
                return;
            }

        });
    };

    /**
     * Starts the experience: 1)get masks from server, 2)initiate the player, 3)starts webcam and tracking
     * 
     * @param  {string} style   [videoplayer styles: "big", "small", "default"]
     * @return {null}           [starts the fun part of the app]
     */
    $scope.startFun = function(dimension){

        if($scope.mode !== 'save'){
            //get masks promise from mask service
            maskService.getMasks($scope.mode).then(function(response){
                if(response.length){
                    maskService.masks = $scope.masks = response;
                    //set a random mask as "current"
                    maskIndex = Math.floor((Math.random()* response.length));
                    maskService.setCurrent(response[maskIndex]);
                    $scope.selectedMask = response[maskIndex];
                    console.log('THE MASKS:', $scope.masks);
                }else{
                    alert('NO masks!');
                }
            });
        }else{
            //current mask (user handmade one) ...... //TODO: error here in case there is no mask
            var customMask = maskService.getMaskFromLocalStorage();
            $scope.masks = [];
            $scope.masks.push(maskService.getMaskFromLocalStorage());
            console.log('THE MASKS IS ONLY THE CUSTOM ONE, this one: ', customMask);
            maskService.setCurrent(customMask);
            $scope.selectedMask = customMask;
        }

        //remove "go! button"
        $scope.showStart = false;
        //resize video
        $scope.videoPlayerStyle(dimension);
        $scope.startWebCam();
    };


    $scope.stopTracking = function(){
        trackingService.stop();
        //trackingService.stopStream();
        $scope.isRunning = false;
    };
    $scope.restartTracking = function(){
        trackingService.start();
        $scope.isRunning = true;
    };
    $scope.refreshTracking = function(){
        trackingService.stop();
        $scope.restartTracking();
    };


    /**
     * creates a PNG photo out of videoCanvas+overlayCanvas
     * 
     * @return {null}   [add the PNG photo to the images array printed in the main section of the website]
     */
    $scope.canvasToImage = function(){
        var canvas = null;
        html2canvas(document.querySelector('#fullPic'), {
            onrendered: function(canvas) {
                var img    = canvas.toDataURL("image/png");

                var head = 'data:image/png;base64,';
                var imgFileSize = Math.round((img.length - head.length)*3/4) ;

                //stop tracking
                $scope.stopTracking();

                $scope.currentPhoto     = { 'id'        : 0,
                                            'type'      : 'png', 
                                            'tags'      : [],
                                            'masks'     : [], 
                                            'audience'  : 0, 
                                            'email'     : "",
                                            'lang'      : $rootScope.lang,
                                            'size'      : imgFileSize,
                                            'ts'        : moment().format("X"),
                                            'image_url' : img,
                                            'image'     : img,
                                            $$hashKey   : Math.floor((Math.random()*9999999999)+1) //this is for display purposes
                                          };

                //add the ID of the used mask 
                $scope.currentPhoto.masks.push($scope.selectedMask.id);

                photoService.addPhotoToCollection($scope.currentPhoto);
                $scope.images = photoService.getCollection();

                $scope.$apply();
            }
        });
    };




    /**
     * creates a frame out of videoCanvas+overlayCanvas
     * and attach it to an animated GIF object
     * when reached X amount of frams it gets the data of the GIF
     * and stores it in a blob obj...
     * 
     * @return {null}   [add the GIF photo to the images array printed in the main section of the website]
     */
    $scope.pics = 0;
    var encoder = new GIFEncoder();
    //as seen on https://github.com/antimatter15/jsgif
    $scope.canvasToGif = function(){
        //hide the button to take images again
        $scope.showImage = false;

        $scope.pics++;

        if($scope.pics === 1){
            encoder.setQuality(2);
            encoder.setRepeat(0);   //0  -> loop forever ||| 1+ -> loop n times then stop
            encoder.setDelay(100);  //go to next frame every n milliseconds
            encoder.start();
        }

        if($scope.pics === 10){
            //stop tracking
            $scope.stopTracking();
            //finish encoding GIF
            encoder.finish();
            //get binary GIF
            var binary_gif = encoder.stream().getData();
            //saving to BLOB, because the file is TOO BIG
            var b64Image    = encode64(binary_gif);
            var blob        = b64toBlob(b64Image, 'image/gif');
            var animatedGIF = URL.createObjectURL(blob);  //TODO: here i should make a "webkitURL" alternative

            $scope.currentPhoto     = { 'id'        : 0,
                                        'type'      : 'gif', 
                                        'tags'      : [],
                                        'masks'     : $scope.allSelectedMasks, 
                                        'audience'  : 0, 
                                        'email'     : "",
                                        'lang'      : $rootScope.lang,
                                        'size'      : blob.size,
                                        'ts'        : moment().format("X"),
                                        'image_url' : animatedGIF,
                                        'image'     : 'data:image/gif;base64,' + b64Image,
                                        $$hashKey   : Math.floor((Math.random()*9999999999)+1) //this is for display purposes
                                    };

            photoService.addPhotoToCollection($scope.currentPhoto);
            $scope.images = photoService.getCollection();

            //reset number of pics
            $scope.pics = 0;
            $scope.GIFprogress = '0%';

            //show the button to take images again
            $scope.showImage = true;
        }else{
            html2canvas(document.querySelector('#fullPic'), {
                onrendered: function(canvas) {
                    //if the mask has never been used to build this photo
                    if($scope.allSelectedMasks.indexOf($scope.selectedMask.id) < 0){
                        $scope.allSelectedMasks.push($scope.selectedMask.id);
                        //assign masks
                        $scope.currentPhoto.masks = $scope.allSelectedMasks;
                        //assign audience (only if the current masks's audience is lower than the previously used mask)
                        if($scope.currentPhoto.audience < $scope.selectedMask.audience){
                            $scope.currentPhoto.audience = $scope.selectedMask.audience;
                        }
                    }

                    
                    var context = canvas.getContext('2d');
                    encoder.addFrame(context);

                    $scope.$apply();
                }
            });
            //update progress
            $scope.GIFprogress = ($scope.pics*10) + '%';

        }


    };

    /**
     * reset the "video" (GIF)
     * @return {null} 
     */
    $scope.resetVideo = function(){

        //reinit encoder
        encoder = new GIFEncoder();
        //reset number of pics
        $scope.pics = 0;
        $scope.GIFprogress = '0%';
        //show the button to take images again
        $scope.showImage = true;

    };

    /**
     * Helper function to clear the stuff saved on localStorage
     * 
     * @return {bool:true} [empty previously set objs]
     */
    $scope.clearStorage = function(){
        html5Storage.set('the_mask', '');

        //clear canvas and controls (which include image, image position, brush size, brush blur, etc.)
        html5Storage.set('controls', '');
        html5Storage.set('drawing_canvas', '');
        alert('html5 storage cleared!');
        return true;
    };


});