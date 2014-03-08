angular.module("app").controller('MainCtrl', function($scope, $location, $timeout, trackingService) {

    $scope.showVideo    = false;
    $scope.showControls = false;
    $scope.showStart = true;
    $scope.pageClass = 'page-main';
    $scope.isRunning  = false;

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
    

    $scope.images = [];
    $scope.canvasToImage = function(){
        
        //remove previous canvas if exist
        var node = document.querySelector('#compositionImage');
        if (node && node.parentNode) {
          node.parentNode.removeChild(node);
        }

        html2canvas(document.querySelector('#fullPic'), {
          onrendered: function(canvas) {
            //create single canvas (from canvasVideo and canvasOverlay)
            canvas.id = 'compositionImage';
            //attach it to the DOM (CSS will hide it anyway)
            document.body.appendChild(canvas);
            //transform it into an Image
            canvas = document.getElementById("compositionImage");
            var img    = canvas.toDataURL("image/png");
            //great <a> and <img> to append it to the dom
            
            /*
            var anchor = document.createElement("a");
            anchor.href = img;
            var imgForDom = document.createElement("img");
            imgForDom.src = img;
            anchor.appendChild(imgForDom);

            //append it to the DOM
            document.body.appendChild(anchor);
            */

            //stop tracking
            $scope.stopTracking();
            var num = num + 1;
            $scope.images.push( {'ts' : moment().format("X"), 'image': img});   // moment().format("X") gives unix timestamp
                                                                                // to get it back in human readable "14 minutes ago" format:
                                                                                // var timestamp = moment.unix(1390348800);
                                                                                // console.log(timestamp.fromNow());
            $scope.$apply();
          }
        });
    };
});


//returns a timestamp into "5 minutes ago" format
angular.module("app").filter('timeago', function() {
  return function(input) {
    var timestamp = moment.unix(input);
    return timestamp.fromNow();
  };
});
// angular.module('phonecatFilters', []).filter('checkmark', function() {
//   return function(input) {
//     return input ? '\u2713' : '\u2718';
//   };
// });
