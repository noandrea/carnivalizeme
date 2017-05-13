angular.module("app").factory('controlsService', function(html5Storage) {

    var controls;

    var self = {

        init: function () {
            //if they are not yet stored on localStorage init with default values...
            if(!html5Storage.get('controls')){
                controls =  {
                                showGrid    : true,
                                text        : { content : "", position : {X : 260, Y : 380}, rotation : 0, scale : 1, color: "#24ab93"},
                                brush       : { size : 4, blur : 0.9, fillStyle : "#9c9c9c", maxsize : 80},
                                image       : { info : {}, position: {X : 0, Y : 0}, rotation : 0, scale : 1 }
                            };
            }else{
                //...else get them from localStorage
                controls = html5Storage.get('controls');
            }
            //store controls on localStorage
            self.save();
            return controls;
        },

        save: function () {
            html5Storage.set('controls', controls);
        },


        set: function (newControls) {
            controls = newControls;
            self.save();
            return newControls;
        },

        get: function () {
            return controls;
        },

        reset: function () {
            controls =  {
                showGrid    : true,
                text        : { content : "", position: {X : 260, Y : 380}, rotation : 0, scale : 1, color: "#24ab93"},
                brush       : { size : 4, blur : 0.9, fillStyle : "#9c9c9c", maxsize : 80},
                image       : { info : {}, position: {X : 0, Y : 0}, rotation : 0, scale : 1 }
            };
            return controls;
        }


    };

    return self;
});