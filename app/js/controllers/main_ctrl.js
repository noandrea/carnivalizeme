angular.module("app").controller('MainCtrl', function($scope, $location, $timeout, trackingService, html5Storage, Masks, $translate, $filter, scroller, API_BASE_URL, ENVIRONMENT) {


    $scope.mode = 'play';
    if($location.$$path === '/trymask'){
        $scope.mode = 'save';
    }

    $scope.showVideo        = false;
    $scope.showControls     = false;
    $scope.showStart        = true;
    $scope.pageClass        = 'page-main';
    $scope.isRunning        = false;
    $scope.showMask         = true;
    $scope.showImage        = true;

    //get previously HTML5 storage images or reset the array
    $scope.images = html5Storage.get('myCarnival');

    if(!$scope.images){ $scope.images = []; }


    var videoInput,
        canvasInput,
        canvasOverlay,
        debugOverlay,
        overlayContext,
        enlargetWidth,
        enlargetHeight,
        composition,
        videoBlock;

    var controlsAmount  = 3; //number of buttons in videoPlayer
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
     * simply move to another path doing whatever is necessary
     * 
     * @param  {string} path [adding "/" is necessary...eg "/editor"]
     * @return route the app where it should be routed
     */
    $scope.goTo = function(path){

        $scope.stopTracking();
        $location.path(path);
    };

    /**
     * Saves the mask on DB!
     * @return {object} [the mask object]
     *
     * Example MASK OBJECT:
     *
        {   'image'     : img,
            'type'      : 'png', 
            'tags'      : ['sto', 'caz', 'ciccio', 'bastardo'], 
            'audience'  : 0, 
            'email'     : "ciccio@bastardo.com",
            'credits'   : "ciccio bastardo http://www.cicciobastardo.com",
            'lang'      : "en",
            'size'      : imgFileSize,
            'ts'        : moment().format("X")
        };
     * 
     */
    $scope.saveMaskOnDB = function(maskObj){
        console.log('about to save:', maskObj);
        Masks.save(maskObj).$promise.then(function(response){
            alert('SAVED!', maskObj);
        },function(response){
            alert('ERROR! NOT SAVED!', maskObj);
        });
    };

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
        controls.style.marginLeft   = "0px";
        controls.style.marginTop    = (videoHeight - controlsWidth) + "px";

    };

    $scope.startWebCam = function(){
        videoInput          = document.querySelector('#vid');
        canvasInput         = document.querySelector('#compare');
        canvasOverlay       = document.querySelector('#overlay');
        debugOverlay        = document.querySelector('#debug');
        composition         = document.querySelector('#vid');
        
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
        trackingService.init(videoInput, canvasInput, debugOverlay);
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

            console.log('rollin headtrackrStatus');

            $scope.cameraMsg        = {};
            $scope.cameraMsg.icon   = ''; 
            canvasOverlay.style.display = "none";

            switch(event.status){
                case "getUserMedia":
                    $scope.cameraMsg.msg = $filter('translate')('CAMERA_SUPPORT');
                    break;
                case "no getUserMedia":
                    $scope.cameraMsg.msg = $filter('translate')('GET_USER_MEDIA');
                    break;
                case "no camera":
                    $scope.cameraMsg.msg = $filter('translate')('NO_CAMERA');
                    $scope.showControls = false;
                    break;
                case "whitebalance":
                    $scope.cameraMsg.msg = $filter('translate')('WHITE_BALANCE');
                    break;
                case "detecting":
                    $scope.cameraMsg.msg    = $filter('translate')('DETECTING');
                    $scope.cameraMsg.icon   = "face";
                    break;
                case "found":
                    $scope.cameraMsg.msg = ""; //empy message so the DIV disappear
                    canvasOverlay.style.display = "block";
                    break;
                case "hints":
                    $scope.cameraMsg.msg = $filter('translate')('HINTS');
                    $scope.cameraMsg.icon   = "brightness";
                    break;
                case "stopped":
                    $scope.cameraMsg.msg = "";
                    canvasOverlay.style.display = "block";
                    break;
            }
            if(!$scope.$$phase){ $scope.$apply(); }
        });

        //listen to tracking events
        document.addEventListener("facetrackingEvent", function( event ) {


            try {
                console.log('rollin faceTrackingEvent');

                // clear canvas
                overlayContext.clearRect(0,0,videoWidth,videoHeight);
                // once we have stable tracking, draw rectangle
                if (event.detection === "CS") {

                    //enlarge! For the overlay to be 3x bigger for more fun!
                    enlargetWidth     = event.width  * 3;
                    enlargetHeight    = event.height * 3 ;

                    overlayContext.translate(event.x, event.y);
                    overlayContext.rotate(event.angle-(Math.PI/2));
                    //overlayContext.strokeStyle = "red";
                    //overlayContext.strokeRect((-(event.width/2)) >> 0, (-(event.height/2)) >> 0, event.width, event.height);
                    degrees = (Math.PI/2)-event.angle;
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

    $scope.canvasToImage = function(){
        var canvas = null;
        html2canvas(document.querySelector('#fullPic'), {
            onrendered: function(canvas) {
                var img    = canvas.toDataURL("image/png");

                var head = 'data:image/png;base64,';
                var imgFileSize = Math.round((img.length - head.length)*3/4) ;

                //stop tracking
                $scope.stopTracking();

                var image = {           $$hashKey   : Math.floor((Math.random()*9999999999)+1),
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


                $scope.images.push( {$$hashKey: Math.floor((Math.random()*9999999999)+1), 'size': imgFileSize, 'ext': 'PNG','ts' : moment().format("X"), 'image': img});   // moment().format("X") gives unix timestamp
                                                                                    // to get it back in human readable "14 minutes ago" format:
                                                                                    // var timestamp = moment.unix(1390348800);
                                                                                    // console.log(timestamp.fromNow());
                /*if(html5Storage.set('myCarnival', $scope.images)){
                    $scope.$apply();
                }*/
                $scope.$apply();
                scroller.scrollTo(0, 580, 1000);
            }
        });
    };

    $scope.pics = 0;
    var node, encoder = new GIFEncoder();
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

            $scope.images.push( {$$hashKey: Math.floor((Math.random()*9999999999)+1), 'size': blob.size, 'ext': 'GIF', 'ts' : moment().format("X"), 'image': animatedGIF});   // moment().format("X") gives unix timestamp
                                                                                                                                                    // to get it back in human readable "14 minutes ago" format:
                                                                                                                                                    // var timestamp = moment.unix(1390348800);
                                                                                                                                                    // console.log(timestamp.fromNow());
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
                    var context = canvas.getContext('2d');
                    encoder.setQuality(20);
                    encoder.addFrame(context);
                    encoder.setQuality(20);
                }
            });

        }
        //update progress
        $scope.GIFprogress = ($scope.pics*10) + '%';


    };

    $scope.clearStorage = function(){
        html5Storage.set('myCarnival', []);
        html5Storage.set('drawing_canvas', '');
        html5Storage.set('the_mask', '');
        html5Storage.set('uploadedImage', '');
        html5Storage.set('uploadedImage_style', '');
        html5Storage.set('uploadedImage_position', '');
        alert('html5 storage cleared!');
    };


    if($scope.mode === 'save'){
        setTimeout(function() {
            $scope.startFun();
        }, 1000); 
    }

});


//returns a timestamp into "5 minutes ago" format
angular.module("app").filter('timeago', function() {
  return function(input) {
    var timestamp = moment.unix(input);
    return timestamp.fromNow();
  };
});

angular.module("app").filter('bytes', function() {
    return function(bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)){
            return '-';
        }

        if (typeof precision === 'undefined'){
            precision = 1;
        }
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
    };
});