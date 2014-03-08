angular.module("app").factory('html5Storage', function() {

    return {
        get: function (id) {
            return JSON.parse(localStorage.getItem(id) || null);
        },
        put: function (id, value) {
            localStorage.setItem(id, JSON.stringify(value));
        }
    };
});