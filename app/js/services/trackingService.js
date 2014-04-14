angular.module("app").factory('trackingService', function() {

    var htracker    = null;
    var isRunning   = 0;

    return {
        init: function (videoInput, canvasInput, debugOverlay) {
            htracker = new headtrackr.Tracker   ({  altVideo    : false,
                                                    calcAngles      : true,
                                                    ui              : false, 
                                                    headPosition    : false, 
                                                    cameraOffset    : 11.5,
                                                    detectionInterval: 0.2,
                                                    debug           : debugOverlay
                                                });
            htracker.init(videoInput, canvasInput);
        },

        start: function () {
            htracker.start();
        },

        stop: function () {
            htracker.stop();
        },

        stopStream: function () {
            //stop camera Stream
            htracker.stopStream();
        },

        isActive: function () {
            console.log('htracker is obj', angular.isObject(htracker));
            return angular.isObject(htracker);
        }

    };
});