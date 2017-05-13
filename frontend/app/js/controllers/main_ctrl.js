angular.module("app").controller('MainCtrl', function($scope, $location, trackingService, html5Storage, Masks, Photos, $translate, $filter, API_BASE_URL, $rootScope, maskService, photoService, lastWatchedImage, controlsService, $document, browsersDetect, $analytics, userService) {

    //check Age
    $rootScope.checkAge();

    if(browsersDetect() !== 'chrome'){
      $location.path('/browser');
    }
    //put a placeholder in the right drawer
    lastWatchedImage.reset();

    $scope.showVideo        = false;
    $scope.showControls     = false;
    $scope.showStart        = true;
    $scope.pageClass        = ($location.path() !== '/sorry' && $location.path() !== '/browser') ? 'page-main' : '';
    $scope.isRunning        = false;
    $scope.showMask         = true;
    $scope.showImage        = true;
    $scope.isCameraInactive   = true;

    $scope.allSelectedMasks = [];
    $scope.images           = photoService.getCollection();

    $scope.selectedMask     = maskService.init($rootScope.lang);
    $scope.currentPhoto     = photoService.init($rootScope.lang);

    $scope.gifframes        = [];


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
     * Saves the mask on DB!
     * @return {object} [the mask object]
     */
    $scope.saveMaskOnDB = function(maskObj){
        maskObj.lang = $rootScope.lang;
        maskService.saveMaskOnDB(maskObj);
        $analytics.eventTrack('Saving Mask on DB', {  category: 'drawing mask'});
    };

    /**
     * refresh masktags list and amount in View (called from search tags directive)
     * @return {null}
     */
    $scope.updateMasksAmountAndTags = function(){
        $scope.masktags         = maskService.masktags;
        $scope.masktagsAmount   = maskService.masktagsAmount;
    };
    /**
     * reset masktags list and amount in View (called from search tags directive)
     * @return {null}
     */
    $scope.resetMasksAmountAndTags = function(){
        maskService.masktags        = "";
        maskService.masktagsAmount  = 0;
        $scope.getRandomMask();
    };

    $scope.$on('imagesListChaged', function(newList) {
        //console.log('list changed, emit listened!');
        $scope.images = [];
        $scope.images = newList;
    });


    $rootScope.$on('savedPhoto', function(event, info) {
        //console.log(info);
        if(info.update === 1 && info.error === 0){
            $scope.showModal('pic');
        }
    });

    $rootScope.$on('savedMask', function(event, info) {
        if((info.update === 0 || info.update === 1) && info.error === 0){
            $scope.showModal('mask');
        }
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
            //console.log('MASK #'+maskIndex);
            
            maskService.setCurrent(maskService.masks[maskIndex]);
            $scope.selectedMask = maskService.getCurrent();
            //console.log('SELECTED: ', $scope.selectedMask);

            //$scope.credits = maskService.masks[maskIndex].credits;
            $analytics.eventTrack('Trying different mask', {  category: 'Carnivalizement', label: '(ID: '+ $scope.selectedMask.id + ')'});
        }else{
            $analytics.eventTrack('NO masks', { category: 'Errors' });
            //alert('There are NO masks!');
        }
        $scope.updateMasksAmountAndTags();
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
        canvasOverlay.style.marginTop = "-" + (videoHeight+4) + "px";

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
            var header = angular.element(document.getElementsByTagName("header")[0]);
            if(newVal){
                header.addClass('hide');
            }else{
                header.removeClass('hide');
            }
        });


        var ratioActual, ratioIdeal = 0.7431, the_width, the_height;
        //listen to tracking events
        document.addEventListener("facetrackingEvent", function( event ) {

            try {
                // clear canvas (HACK)                      // HACK! (from http://www.html5rocks.com/en/tutorials/canvas/performance/) 
                canvasOverlay.width = canvasOverlay.width;  // this is an hack to clear the cnavas. the regular way would be:
                                                            // overlayContext.clearRect(0,0,videoWidth,videoHeight);
                
                // once we have stable tracking, draw rectangle
                if (event.detection === "CS") {
                    
                    //faccia = 243x327 | ratioIdeal = 0.7431;
                    ratioActual     = (event.width / event.height);

                    if(ratioActual < ratioIdeal){
                        the_height  = event.height;
                        the_width   = Math.round(ratioIdeal * event.height);
                    }else{
                        the_height  = Math.round(event.width / ratioIdeal);
                        the_width   = event.width;
                    }

                    //enlarge! For the overlay to be 3x bigger for more fun!
                    enlargetWidth     = the_width * 3;         //event.width
                    enlargetHeight    = the_height * 3;        //event.height

                    degrees = event.angle-(Math.PI/2);
                    degrees = Math.round(degrees * 100) / 100;
                    overlayContext.translate(event.x, event.y);
                    overlayContext.rotate(degrees);
                    
                    //Draw a rectangle where the face is:
                    //overlayContext.strokeStyle = "red";
                    //overlayContext.strokeRect((-(the_width/2)) >> 0, (-(the_height/2)) >> 0, the_width, the_height);
                    
                    degrees = (Math.PI/2)-event.angle;
                    degrees = Math.round(degrees * 100) / 100;
                    overlayContext.drawImage(maskService.getStickImage(),-enlargetWidth/2, -enlargetHeight/2, enlargetWidth, enlargetHeight);
                    overlayContext.rotate(degrees);
                    overlayContext.translate(-event.x, -event.y);

                


                }

            }catch(e){
                //console.log(e);
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

        var customMask = maskService.getMaskFromLocalStorage();

        if($scope.mode !== 'save'){

            //try to get the mask that the user saved, or a random one
            /*if(customMask){
                maskService.setCurrent(customMask);
                $scope.selectedMask = customMask;
            }else{
                //get masks promise from mask service*/
                $scope.getRandomMask();
            //}

            $analytics.eventTrack('Trying Random Mask ', {  category: 'Carnivalizement' });
        }else{
            //current mask (user handmade one) ...... //TODO: error here in case there is no mask
            $scope.masks = [];
            $scope.masks.push(maskService.getMaskFromLocalStorage());
            
            //console.log('THE MASKS IS ONLY THE CUSTOM ONE, this one: ', customMask);
            maskService.setCurrent(customMask);
            $scope.selectedMask = customMask;

            $analytics.eventTrack('Trying Custom Mask', {  category: 'drawing mask' });
        }

        //remove "go! button"
        $scope.showStart = false;
        //resize video
        $scope.videoPlayerStyle(dimension);
        $scope.startWebCam();
    };


    $scope.getRandomMask = function(){
        var user = userService.get();
        maskService.getMasks({'a' : user.age_filter}).then(function(response){
            maskService.masktagsAmount = response.length;
            if(response.length){
                maskService.masks = $scope.masks = response;
                //set a random mask as "current"
                maskIndex = Math.floor((Math.random()* response.length));
                maskService.setCurrent(response[maskIndex]);
                $scope.selectedMask = response[maskIndex];
            }else{
                $analytics.eventTrack('NO masks', { category: 'Errors' });
                //alert('NO masks!');
            }
            $scope.updateMasksAmountAndTags();
        });
    };

    $scope.stopTracking = function(){
        $analytics.eventTrack('Stopping Tracking', {  category: 'Carnivalizement' });
        trackingService.stop();
        //trackingService.stopStream();
        $scope.isRunning = false;
    };
    $scope.restartTracking = function(){
        $analytics.eventTrack('Restarting Tracking', {  category: 'Carnivalizement' });
        trackingService.start();
        $scope.isRunning = true;
    };
    $scope.refreshTracking = function(){
        $analytics.eventTrack('Refreshing Tracking', {  category: 'Carnivalizement' });
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
        
        $analytics.eventTrack('Creating PNG', {  category: 'Carnivalizement' });

        html2canvas(document.querySelector('#fullPic'), {
            onrendered: function(canvas) {
                var img    = canvas.toDataURL("image/png");

                var head = 'data:image/png;base64,';
                var imgFileSize = Math.round((img.length - head.length)*3/4) ;

                //stop tracking
                $scope.stopTracking();

                //init photo obj
                $scope.currentPhoto             = photoService.init();

                //set photo obj
                $scope.currentPhoto.size        = imgFileSize;
                $scope.currentPhoto.type        = 'png';
                $scope.currentPhoto.image       = img;
                $scope.currentPhoto.image_url   = img;
                $scope.currentPhoto.lang        = $rootScope.lang;                

                //add the ID of the used mask 
                $scope.currentPhoto.masks.push($scope.selectedMask.id);

                var docHeight= Math.max(document.body.scrollHeight, document.documentElement.scrollHeight,
                                        document.body.offsetHeight, document.documentElement.offsetHeight,
                                        document.body.clientHeight, document.documentElement.clientHeight);

                //Scroll to the exact position
                $document.scrollTop(docHeight, 1500).then(function() {
                    //console.log('You just scrolled to the top!');
                });

                photoService.addPhotoToCollection($scope.currentPhoto);
                $scope.images = photoService.getCollection();

                $scope.$apply();

                $analytics.eventTrack('PNG Created', {  category: 'Carnivalizement' });
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

        $scope.helpLabel='saving frame...';
        $scope.pics++;

        if($scope.pics === 1){
            encoder.setQuality(2);
            encoder.setRepeat(0);   //0  -> loop forever ||| 1+ -> loop n times then stop
            encoder.setDelay(100);  //go to next frame every n milliseconds
            encoder.start();

            $analytics.eventTrack('Recording GIF', {  category: 'Carnivalizement' });
        }

        if($scope.pics === 11){
            $analytics.eventTrack('Creating GIF', {  category: 'Carnivalizement' });
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

            //Scroll to the exact position
            $document.scrollTop(650, 1500).then(function() {
                //console.log('You just scrolled to the top!');
            });

            photoService.addPhotoToCollection($scope.currentPhoto);
            $scope.images = photoService.getCollection();

            $analytics.eventTrack('GIF Created', {  category: 'Carnivalizement' });

            //reset number of pics
            $scope.pics = 0;
            $scope.GIFprogress = '0%';
            $scope.gifframes = [];

            //show the button to take images again
            $scope.showImage = true;

            //empty help label
            $scope.helpLabel='';
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
                    var img    = canvas.toDataURL("image/png");
                    $scope.gifframes.push(img);

                    //empty help label
                    $scope.helpLabel='';

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

        $analytics.eventTrack('Resetting Video', {  category: 'Carnivalizement' });

        //reinit encoder
        encoder = new GIFEncoder();
        //reset number of pics
        $scope.pics = 0;
        $scope.GIFprogress = '0%';
        //show the button to take images again
        $scope.showImage = true;

        //empty gifframes
        $scope.gifframes = [];

    };


    $scope.showModal = function(type){
        //alert('show!');
        //angular.element($document[0].body).addClass('lock');
        if(type === 'mask'){
            $scope.modal_show_mask = 1;
            $scope.modal_wrapper_show_mask = 1;
        }else{
            $scope.modal_show_pic = 1;
            $scope.modal_wrapper_show_pic = 1;
        }

    };
    $scope.hideModal = function(){
        $scope.modal_show_pic = 0;
        $scope.modal_show_mask = 0;
        //angular.element($document[0].body).removeClass('lock');
        setTimeout(function() {
            $scope.modal_wrapper_show_pic = 0;
            $scope.modal_wrapper_show_mask = 0;
            $scope.$apply();
        }, 400);
    };

    /**
     * setAge function is the function to allow user to set and store his age
     * 
     * @param {[type]} age [age number]
     */
    $scope.setAge = function(age){
        
        var user = userService.setAge(age);
        if(user.age){
          $rootScope.goTo('/now');
        }
    };



});