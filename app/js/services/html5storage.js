angular.module("app").factory('html5Storage', function() {

    return {

        /**
         * Get the HTML5 Storage value previously stored with "setJson" method
         * 
         * @param  {string} id      the id of the object to grab from storage
         * @param  {string} type    type that needs to be stored: eg. 'json', 'canvas', etc.
         * @return {mixed}          depends on type           
         */
        get: function (id, type) {
            var the_return;

            if(!type){ type = 'json'; }

            switch(type){
                case 'json':
                    the_return = JSON.parse(localStorage.getItem(id));
                    break;
                case 'canvas':
                    the_return = localStorage.getItem(id);
                    if(the_return === '[]'){    //dirty fix
                        the_return = null;
                    }
                    break;
            }

            return the_return || null;
        },


        /**
         * Store JSON into HTML5 storage
         * 
         * @param {string} id       the id to assign
         * @param {mixed} value     whatever needs to be stored
         * @param {string} type     type that needs to be stored: eg. 'json', 'canvas', etc.
         */
        set: function (id, value, type) {
            var the_value;

            if(!type){ type = 'json'; }

            // do stuff with the value, depending on the data 'type'
            switch(type){
                case 'json':
                    the_value = JSON.stringify(value);
                    break;
                case 'canvas':
                    the_value = value.toDataURL();
                    break;
            }

            try{

                localStorage.setItem(id, the_value);

            }catch (error) {
                
                alert('you cannot store any more images');
                return false;

            }

            return true;
            
        }
    };
});