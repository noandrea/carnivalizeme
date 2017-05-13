angular.module("app").factory('userService', function(html5Storage) {

    var user    = {
                    'age'         : '',
                    'age_ts'      : '',
                    'age_filter'  : ''
                  };

    var self = {
        init: function(){
          html5Storage.set('user', user);
          return user;
        },
        setAge: function (age) {

          user.age        = age;
          user.age_ts     = Math.round(new Date().getTime() / 1000);

          switch(age){
              case 13:
              case 16:
                user.age_filter = '1';
                break;
              case 18:
              case 21:
                user.age_filter = '';
                break;
          }
          html5Storage.set('user', user);
          
          return user;
        },

        get: function () {
            if(!html5Storage.get('user')){
              return self.init();
            }else{
              return html5Storage.get('user');
            }
        }

    };

    return self;
});