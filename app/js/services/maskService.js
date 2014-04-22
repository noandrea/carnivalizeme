angular.module("app").factory('maskService', function(Masks, API_BASE_URL, html5Storage) {

    var mask        = {};
    var masks       = {};

    var stickImage              = new Image();          //used in the overlayCanvas
        stickImage.src          = "img/mask_basic.png"; //"img/mask_headglass.png";
        stickImage.crossOrigin  = '';

    var self = {

        init: function (lang) {

            mask    =   {
                            'id'        : 0, 
                            'type'      : 'png', 
                            'tags'      : [], 
                            'audience'  : 0, 
                            'email'     : "",
                            'credits'   : "",
                            'lang'      : lang,
                            'size'      : 0,
                            'ts'        : moment().format("X"),
                            'image'     : "img/mask_basic.png"
                        };

            return mask;
            
        },

        getCurrent: function () {
            return mask;
        },

        getStickImage: function() {
            return stickImage;
        },

        setCurrent: function (currentMask) {
            console.log('setting CURRENT: ', currentMask);
            mask = currentMask;

            if(mask.image.indexOf("data:image") > -1){
                //image to attach to the facetrackr
                stickImage.src         = mask.image;
            }else{
                stickImage.src         = API_BASE_URL + mask.image;
            }

            return true;
        },

        /**
         * get All Masks
         * 
         * @param  {[type]} tags [description]
         * @param  {[type]} page [description]
         * @param  {[type]} mode ["save", ""]
         * @return {[type]}      [description]
         */
        getMasks: function(){
            var filter = {};
            // get data for the "upcoming reservations" panel
            return Masks.query(filter).$promise;
        },


        saveMaskOnDB: function(maskObj){
            if(!maskObj.id){
                Masks.save(maskObj).$promise.then(function(response){
                    maskObj.id      = response.id;
                    maskObj.image   = response.url;
                    //set latest as current
                    self.setCurrent(maskObj);
                    //save mask on localStorage too
                    self.storeMaskOnLocalStorage(maskObj);
                    alert('SAVED!');
                },function(response){
                    alert('ERROR! NOT -SAVED-! Why??? ' + response);
                    console.log(response);
                });
            }else{
                Masks.update({ id: maskObj.id }, maskObj).$promise.then(function(response){
                    //set latest as current
                    self.setCurrent(maskObj);
                    //save mask on localStorage too
                    self.storeMaskOnLocalStorage(maskObj);
                    alert('UPDATED!');
                },function(response){
                    alert('ERROR! NOT -UPDATED-! Why??? ' + response);
                });
            }
        },

        storeMaskOnLocalStorage: function(mask){
            return html5Storage.set('the_mask', mask);
        },

        getMaskFromLocalStorage: function(mask){
            return html5Storage.get('the_mask');
        }


    };

    return self;
});