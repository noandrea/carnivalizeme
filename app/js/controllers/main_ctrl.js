angular.module("app").controller('MainCtrl', function($scope, $location, trackingService, html5Storage, Masks, Photos, $translate, $filter, scroller, API_BASE_URL, ENVIRONMENT, $rootScope) {

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

    $scope.selectedMask     = {   
                                'id'        : 0, 
                                'type'      : 'png', 
                                'tags'      : [], 
                                'audience'  : 0, 
                                'email'     : "",
                                'credits'   : "",
                                'lang'      : $rootScope.lang,
                                'size'      : 0,
                                'ts'        : moment().format("X"),
                                'image'     : "img/mask_basic.png"
                            };

    $scope.currentPhoto     = {   
                                'id'        : 0, 
                                'type'      : 'png', 
                                'tags'      : [],
                                'masks'     : [], 
                                'audience'  : 0, 
                                'email'     : "",
                                'lang'      : $rootScope.lang,
                                'size'      : 0,
                                'ts'        : moment().format("X"),
                                'image'     : "",
                            };

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

    var stickImage      = new Image();
        stickImage.src  = "img/mask_basic.png"; //"img/mask_headglass.png";
    var maskIndex       = 0;

    var filter = {};//{upcoming: true, workstation_id: $routeParams.workstation_id, order : 'check_in_date,check_in_time'};

    $scope.getMasks = function (tags){
        if($scope.mode !== 'save'){
            // get data for the "upcoming reservations" panel
            Masks.query(filter).$promise.then(function(response){
                if(response.length){
                    console.log('THE MASKS:', response);
                    $scope.masks = response;

                    console.log($scope.masks);
                    //pic random image
                    maskIndex               = Math.floor((Math.random()*response.length));

                    //image to attach to the facetrackr
                    if(ENVIRONMENT === 'dev'){
                        stickImage.src          = "img/mask_basic.png";
                    }else{
                        stickImage.src          = API_BASE_URL + $scope.masks[maskIndex].image;
                    }
                    //current (selected) mask
                    $scope.selectedMask    = $scope.masks[maskIndex];
                }else{
                    alert('NO masks!');
                }
            });
        }else{
            //current mask (user handmade one) ...... //TODO: error here in case there is no mask
            $scope.selectedMask     = html5Storage.get('the_mask');
            $scope.masks            = [];
            $scope.masks.push($scope.selectedMask);

            //image to attach to the facetrackr
            stickImage.src          = $scope.masks[0].image;
        }
    };


    /**
     * remove an image from the images array
     * and scroll to the top
     * 
     * @param  {number} imageIndex  [the index of the array]
     * @return {null}               [pops out the image from the $scope.images array]
     */
    $scope.removeImage = function(imageIndex){
        $scope.images.splice(imageIndex, 1);
        scroller.scrollTo(0, 0, 1000);
    };

    /**
     * Saves the mask on DB!
     * @return {object} [the mask object]
     *
     * Example MASK OBJECT:
     *
        {   
            'type'      : 'png', 
            'tags'      : ['sto', 'caz', 'ciccio', 'bastardo'], 
            'audience'  : 0, 
            'email'     : "ciccio@bastardo.com",
            'credits'   : "ciccio bastardo http://www.cicciobastardo.com",
            'lang'      : "en_EN",
            'size'      : imgFileSize,
            'ts'        : moment().format("X"),
            'image'     : img
        };
     * 
     */
    $scope.saveMaskOnDB = function(maskObj){
        console.log('about to save mask:', maskObj);
        if(!maskObj.id){
            Masks.save(maskObj).$promise.then(function(response){
                alert('SAVED!', maskObj);
            },function(response){
                alert('ERROR! NOT SAVED!', maskObj);
            });
        }else{
            Masks.update(maskObj).$promise.then(function(response){
                alert('UPDATED!', maskObj);
            },function(response){
                alert('ERROR! NOT UPDATED!', maskObj);
            });
        }
    };
    $scope.savePhotoOnDB = function(photoObj){
        console.log('about to save photo:', photoObj);
        if(!photoObj.id){
            Photos.save(photoObj).$promise.then(function(response){
                alert('PHOTO SAVED!', photoObj);
            },function(response){
                alert('ERROR! PHOTO NOT SAVED!', photoObj);
            });
        }else{
            Photos.update(photoObj).$promise.then(function(response){
                alert('PHOTO UPDATED!', photoObj);
            },function(response){
                alert('ERROR! PHOTO NOT UPDATED!', photoObj);
            });
        }
    };


    /**
     * activate the possibility to click on left-right arrow and change the mask
     * 
     * @param  {number} step    [negative or positive steps...eg: "+1" or "-1"]
     * @return {null}           [changes stickImage and set selectedMask obj]
     */
    $scope.changeMask = function (step){

        if($scope.masks.length){
            maskIndex += step;
            if(maskIndex > ($scope.masks.length-1)){
                maskIndex = 0;
            }else if(maskIndex < 0){
                maskIndex = $scope.masks.length-1;
            }
            console.log('MASK #'+maskIndex);
            
            //image to attach to the facetrackr
            if(ENVIRONMENT === 'dev'){
                stickImage.src          = "img/mask_basic.png";
            }else{
                stickImage.src          = API_BASE_URL + $scope.masks[maskIndex].image;
            }


            $scope.credits = $scope.masks[maskIndex].credits;
            //current (selected) mask
            $scope.selectedMask    = $scope.masks[maskIndex];
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
                    overlayContext.drawImage(stickImage,-enlargetWidth/2, -enlargetHeight/2, enlargetWidth, enlargetHeight);
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
        //get MAsks
        $scope.getMasks();
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

                $scope.currentPhoto     = {   
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

                $scope.images.push($scope.currentPhoto);
                $scope.$apply();
                scroller.scrollTo(0, 580, 1000);
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

            $scope.currentPhoto     = {   
                                        'type'      : 'gif', 
                                        'tags'      : [],
                                        'masks'     : $scope.allSelectedMasks, 
                                        'audience'  : 0, 
                                        'email'     : "",
                                        'lang'      : $rootScope.lang,
                                        'size'      : blob.size,
                                        'ts'        : moment().format("X"),
                                        'image_url' : animatedGIF,
                                        'image'     : blob,
                                        $$hashKey   : Math.floor((Math.random()*9999999999)+1) //this is for display purposes
                                    };

            $scope.images.push($scope.currentPhoto);
            console.log($scope.images);
            //scroll to new pic just taken
            scroller.scrollTo(0, 580, 1000);

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