angular.module("app").factory('photoService', function(Photos, $rootScope, $analytics) {

    var photo   = {};
    var photos  = [];

    var self = {

        init: function (lang) {

            photo    =   {
                            'temp_id'   : Math.floor((Math.random() * 9999) + 1), 
                            'id'        : 0, 
                            'type'      : 'png', 
                            'tags'      : [],
                            'masks'     : [], 
                            'audience'  : 0, 
                            'email'     : "",
                            'lang'      : lang,
                            'size'      : 0,
                            'ts'        : moment().format("X"),
                            'image'     : "",
                            'blowout'     : "",
                            'thumb'     : ""
                        };

            return photo;
            
        },

        updateCurrent: function (newPhoto) {
            //update current
            
            //console.log('photos BEFORE: ', photos);

            angular.forEach(photos, function(photo, key) {
                if(photo.temp_id === newPhoto.temp_id){
                    photos[key] = newPhoto;
                }
            });
            //console.log('photos AFTER: ', photos);

            //update collection
            //photos[photoCollectionIndex] = newPhoto;
            return photo;
        },

        getCurrent: function () {
            return photo;  
        },

        getCollection: function () {
            return photos;  
        },

        getFromTags: function (tags) {
            Photos.tags({ tags: tags }, photoObj).$promise.then(function(response){
                return true;
            },function(response){
                return false;
            });
        },

        savePhotoOnDB: function(photoObj){
            //console.log('INDEX: ' + photoCollectionIndex);
            if(!photoObj.id){
                $analytics.eventTrack('Saving new Image', {  category: 'Carnivalizement' });
                Photos.save(photoObj).$promise.then(function(response){
                    //alert('PHOTO SAVED!', photoObj);
                    photoObj.id         = response.id;
                    photoObj.blowout    = response.blowout;
                    photoObj.image      = response.image;
                    photoObj.thumb      = response.thumb;

                    self.updateCurrent(photoObj);
                    $rootScope.$emit("imagesListChaged", self.getCollection());
                    $analytics.eventTrack('Image Saved', {  category: 'Carnivalizement' });

                    $rootScope.$emit("savedPhoto", {update:0, error:0, photo: photoObj});
                },function(response){
                    $analytics.eventTrack('Image NOT Saved', {  category: 'Carnivalizement', label: response });
                    $rootScope.$emit("savedPhoto", {update:0, error:1});
                });
            }else{
                $analytics.eventTrack('Updating Image Data', {  category: 'Carnivalizement' });
                Photos.update({ id: photoObj.id }, photoObj).$promise.then(function(response){
                    //alert('PHOTO UPDATED!', photoObj);
                    self.updateCurrent(photoObj);
                    $rootScope.$emit("imagesListChaged", self.getCollection());
                    $analytics.eventTrack('Image Saved', {  category: 'Carnivalizement' });

                    $rootScope.$emit("savedPhoto", {update:1, error:0, photo: photoObj});
                },function(response){
                    $analytics.eventTrack('Image NOT Saved', {  category: 'Carnivalizement', label: response });

                    $rootScope.$emit("savedPhoto", {update:1, error:1});
                });
            }
        },

        voteup: function(photoObj){
            Photos.voteup({ id: photoObj.id }, photoObj).$promise.then(function(response){
                return true;
            },function(response){
                return false;
            });
        },

        votedown: function(photoObj){
            Photos.votedown({ id: photoObj.id }, photoObj).$promise.then(function(response){
                return true;
            },function(response){
                return false;
            });
        },

        addPhotoToCollection: function (photo) {
            return photos.push(photo);
        },

        removePhotoFromCollection: function (thePhoto){

            angular.forEach(photos, function(photo, key) {
                if(photo.temp_id === thePhoto.temp_id){
                    photos.splice(key, 1);
                }
            });
        }

    };

    return self;
});