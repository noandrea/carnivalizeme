angular.module("app").controller('MainCtrl', function($scope, $location, $timeout, trackingService, html5Storage) {

    $scope.showVideo    = false;
    $scope.showControls = false;
    $scope.showStart = true;
    $scope.pageClass = 'page-main';
    $scope.isRunning  = false;

    //get previously HTML5 storage images or reset the array
    $scope.images = html5Storage.get('myCarnival');
    console.log('IMAGES',$scope.images);
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

    var stickImage  = new Image();
        stickImage.src = "img/scuba_mask.png";//"img/headglass_mask.png";
    //var stickImage2 = new Image();
    //    stickImage2.src = "img/beard_mask.png";
    var degrees = 0;
    
    $scope.videoPlayerStyle = function(style){

        if(style === 'big'){
            videoWidth  = 920;      // 640 - 920
            videoHeight = 690;      // 480 - 690
        }else{
            videoWidth  = 640;      // 640 - 920
            videoHeight = 480;      // 480 - 690
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
        controls.style.marginLeft   = (videoWidth - (controlsWidth * controlsAmount)) + "px";
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
        canvasOverlay.style.marginTop = "-" + videoHeight + "px";

        //init and start tracking
        if($scope.isRunning){ $scope.stopTracking(); }
        trackingService.init(videoInput, canvasInput, videoWidth, videoHeight);
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

        document.addEventListener('headtrackrStatus', 
          function (event) {
            $scope.cameraMsg        = {};
            $scope.cameraMsg.icon   = ''; 
            canvasOverlay.style.display = "none";

            switch(event.status){
                case "getUserMedia":
                    $scope.cameraMsg.msg = "camera is supported!";
                    break;
                case "no getUserMedia":
                    $scope.cameraMsg.msg = "camera is NOT supported by yout browser!";
                    break;
                case "no camera":
                    $scope.cameraMsg.msg = "sorry. camera not found or streaming not allowed";
                    $scope.showControls = false;
                    break;
                case "whitebalance":
                    $scope.cameraMsg.msg = "loading, please wait";
                    break;
                case "detecting":
                    $scope.cameraMsg.msg    = "Switch on the lights and <br/><strong>show me your face</strong>!";
                    $scope.cameraMsg.icon   = "face";
                    break;
                case "found":
                    $scope.cameraMsg.msg = ""; //empy message so the DIV disappear
                    canvasOverlay.style.display = "block";
                    break;
                case "hints":
                    $scope.cameraMsg.msg = "i can't see you.<br/>try switching on some lights";
                    $scope.cameraMsg.icon   = "brightness";
                    break;
                case "stopped":
                    $scope.cameraMsg.msg = "";
                    canvasOverlay.style.display = "block";
                    break;
            }
            if(!$scope.$$phase){ $scope.$apply(); }
          }
        );

        //listen to tracking events
        document.addEventListener("facetrackingEvent", function( event ) {
            // clear canvas
            overlayContext.clearRect(0,0,videoWidth,videoHeight);
            // once we have stable tracking, draw rectangle
            if (event.detection === "CS") {

                //enlarge! For the overlay to be 3x bigger for more fun!
                enlargetWidth     = event.width  * 3;
                enlargetHeight    = event.height * 3 ;

                overlayContext.translate(event.x, event.y);
                overlayContext.rotate(event.angle-(Math.PI/2));
                overlayContext.strokeStyle = "red";
                overlayContext.strokeRect((-(event.width/2)) >> 0, (-(event.height/2)) >> 0, event.width, event.height);
                degrees = (Math.PI/2)-event.angle;

                
                overlayContext.drawImage(stickImage,-enlargetWidth/2, -enlargetHeight/2, enlargetWidth, enlargetHeight);
                //overlayContext.drawImage(stickImage2,-enlargetWidth/2, -enlargetHeight/2, enlargetWidth, enlargetHeight);

                overlayContext.rotate(degrees);
                overlayContext.translate(-event.x, -event.y);
            }

        });
    };

    $scope.startFun = function(dimension){
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
        
        html2canvas(document.querySelector('#fullPic'), {
            onrendered: function(canvas) {
                var img    = canvas.toDataURL("image/png");

                //stop tracking
                $scope.stopTracking();
                $scope.images.push( {$$hashKey: Math.floor((Math.random()*9999999999)+1), 'type': 'png','ts' : moment().format("X"), 'image': img});   // moment().format("X") gives unix timestamp
                                                                                    // to get it back in human readable "14 minutes ago" format:
                                                                                    // var timestamp = moment.unix(1390348800);
                                                                                    // console.log(timestamp.fromNow());
                html5Storage.set('myCarnival', $scope.images);
                $scope.$apply();
            }
        });
    };


    //as seen on https://github.com/antimatter15/jsgif
    $scope.canvasToGif = function(){

        var node;   //used to check if an old canvas is there
        var encoder = new GIFEncoder();
        encoder.setQuality(10);
        encoder.setRepeat(0);   //0  -> loop forever ||| 1+ -> loop n times then stop
        encoder.setDelay(100);  //go to next frame every n milliseconds
        encoder.start();

        var iFrequency  = 500; // expressed in miliseconds
        var myInterval  = 0;
        var repetition  = 0;
        var maxFrames   = 2;

        myInterval = setInterval( function(){

            repetition++;
            console.log('repetition: ' + repetition);
            if(repetition > maxFrames){
                //stop tracking
                $scope.stopTracking();

                console.log('reached maxFrames');
                clearInterval(myInterval);
                encoder.finish();
                var binary_gif = encoder.stream().getData(); //notice this is different from the as3gif package!
                //var animatedGIF = 'data:image/gif;base64,' + encode64(binary_gif);

                //saving to BLOB, because the file is TOO BIG
                var b64Image    = encode64(binary_gif);
                var blob        = b64toBlob(b64Image, 'image/gif');
                var animatedGIF = URL.createObjectURL(blob);  //TODO: here i should make a "webkitURL" alternative
                //console.log('GIF 64bits', b64Image);
                //console.log('blob', blob);

                $scope.images.push( {$$hashKey: Math.floor((Math.random()*9999999999)+1), 'type': 'gif', 'ts' : moment().format("X"), 'binary': binary_gif});   // moment().format("X") gives unix timestamp
                                                                                                                                                        // to get it back in human readable "14 minutes ago" format:
                                                                                                                                                        // var timestamp = moment.unix(1390348800);
                                                                                                                                                        // console.log(timestamp.fromNow());
                html5Storage.set('myCarnival', $scope.images);
                $scope.$apply();

            }else{

                html2canvas(document.querySelector('#fullPic'), {
                    onrendered: function(canvas) {
                        var context = canvas.getContext('2d');
                        encoder.addFrame(context);
                    }
                });
                
               console.log('looping: ' + repetition);

            }

        }, iFrequency );  // run

    };

    $scope.clearStorage = function(){
        html5Storage.set('myCarnival', []);
        alert('html5 storage cleared!');
    };

});


//returns a timestamp into "5 minutes ago" format
angular.module("app").filter('timeago', function() {
  return function(input) {
    var timestamp = moment.unix(input);
    return timestamp.fromNow();
  };
});


/*angular.module("app").filter('readBinary', function() {
  return function(input) {
    var b64Image    = encode64(input);
    var blob        = b64toBlob(b64Image, 'image/gif');
    return URL.createObjectURL(blob);  //TODO: here i should make a "webkitURL" alternative
  };
});*/