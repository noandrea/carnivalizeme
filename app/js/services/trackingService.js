angular.module("app").factory('trackingService', function() {

    var htracker = null;

    return {
        init: function (videoInput, canvasInput) {
            htracker = new headtrackr.Tracker   ({  altVideo :   { ogv : "./media/capture5.ogv", mp4 : "./media/capture5.mp4"},
                                                calcAngles      : true,
                                                ui              : false, 
                                                headPosition    : false, 
                                                cameraOffset    : 11.5,
                                                detectionInterval: 0.2
                                                //debug : debugOverlay
                                            });
            htracker.init(videoInput, canvasInput);
        },

        start: function () {
            htracker.start();
        },

        stop: function () {
            htracker.stop();
        },

        isActive: function () {
            return angular.isObject(htracker);
        }
    };
});