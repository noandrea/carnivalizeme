angular.module("app").factory('maskService', function($rootScope, Masks, API_BASE_URL, html5Storage, $analytics) {

    var mask        = {};
    var masks       = {};
    var masktags            = "";
    var masktagsAmount      = "";

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

        getFromTags: function (tags) {
            return Masks.tags({ tags: tags }).$promise;
        },

        setCurrent: function (currentMask) {
            //console.log('setting CURRENT: ', currentMask);
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
                $analytics.eventTrack('Saving new Mask', {  category: 'drawing mask' });
                Masks.save(maskObj).$promise.then(function(response){
                    maskObj.id      = response.id;
                    maskObj.image   = response.url;
                    //set latest as current
                    self.setCurrent(maskObj);
                    //save mask on localStorage too
                    self.storeMaskOnLocalStorage(maskObj);
                    $analytics.eventTrack('Mask Saved', {  category: 'drawing mask', label: response });
                    //alert('SAVED!');
                    $rootScope.$emit("savedMask", {update:0, error:0});
                },function(response){
                    $analytics.eventTrack('Mask NOT Saved', {  category: 'drawing mask', label: response });
                    //alert('ERROR! NOT -SAVED-! Why??? ' + response);
                    $rootScope.$emit("savedMask", {update:0, error:1});
                });
            }else{
                $analytics.eventTrack('Updating Mask', {  category: 'drawing mask' });
                Masks.update({ id: maskObj.id }, maskObj).$promise.then(function(response){
                    //set latest as current
                    self.setCurrent(maskObj);
                    //save mask on localStorage too
                    self.storeMaskOnLocalStorage(maskObj);
                    //alert('UPDATED!');
                    $rootScope.$emit("savedMask", {update:1, error:0});
                },function(response){
                    $analytics.eventTrack('Mask NOT Saved', {  category: 'drawing mask', label: response });
                    $rootScope.$emit("savedMask", {update:1, error:1});
                });
            }
        },

        storeMaskOnLocalStorage: function(mask){
            return html5Storage.set('the_mask', mask);
        },

        getMaskFromLocalStorage: function(mask){
            return html5Storage.get('the_mask');
        },

        unsetMaskFromLocalStorage: function(mask){
            return html5Storage.set('the_mask', '');
        }



    };

    return self;
});