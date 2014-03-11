angular.module("app").factory('html5Storage', function() {

    return {
        get: function (id) {
            return JSON.parse(localStorage.getItem(id) || null);
        },
        set: function (id, value) {
            try{

                localStorage.setItem(id, JSON.stringify(value));
                return true;

            }catch (error) {
                
                alert('you cannot store any more images');
                return false;

            }
            
        }
    };
});