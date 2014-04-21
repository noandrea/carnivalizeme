angular.module("app").factory('photoService', function(Photos) {

    var photo   = {};
    var photos  = [];

    var self = {

        init: function (lang) {

            photo    =   {
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
                        };

            return photo;
            
        },

        updateCurrent: function (newPhoto, photoCollectionIndex) {
            //update current
            photo = newPhoto;
            //update collection
            photos[photoCollectionIndex] = newPhoto;
            return photo;
        },

        getCurrent: function () {
            return photo;  
        },

        getCollection: function () {
            return photos;  
        },

        savePhotoOnDB: function(photoObj, photoCollectionIndex){
            if(!photoObj.id){
                Photos.save(photoObj).$promise.then(function(response){
                    alert('PHOTO SAVED!', photoObj);
                    photoObj.id = response.id;
                    self.updateCurrent(photoObj, photoCollectionIndex);
                    $rootScope.$emit("imagesListChaged", self.getCollection());
                },function(response){
                    alert('ERROR! NOT -SAVED-! Why??? ' + response);
                });
            }else{
                Photos.update(photoObj).$promise.then(function(response){
                    alert('PHOTO UPDATED!', photoObj);
                    $rootScope.$emit("imagesListChaged", self.getCollection());
                },function(response){
                    alert('ERROR! NOT -UPDATED-! Why??? ' + response);
                });
            }
        },

        addPhotoToCollection: function (photo) {
            return photos.push(photo);
        },

        removePhotoFromCollection: function (index){
            return photos.splice(index, 1);
        }

    };

    return self;
});