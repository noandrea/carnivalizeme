angular.module("app").factory('photoService', function(Photos, $rootScope) {

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

        getFromTags: function (tags) {
            Photos.tags({ tags: tags }, photoObj).$promise.then(function(response){
                return true;
            },function(response){
                return false;
            });
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
                Photos.update({ id: photoObj.id }, photoObj).$promise.then(function(response){
                    alert('PHOTO UPDATED!', photoObj);
                    self.updateCurrent(photoObj, photoCollectionIndex);
                    $rootScope.$emit("imagesListChaged", self.getCollection());
                },function(response){
                    alert('ERROR! NOT -UPDATED-! Why??? ' + response);
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

        removePhotoFromCollection: function (index){
            return photos.splice(index, 1);
        }

    };

    return self;
});