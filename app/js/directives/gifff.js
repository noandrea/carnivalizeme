angular.module("app").directive('gifff', function($document,ENVIRONMENT) {
    return {
        restrict: 'EA',
        replace: true,
        scope:  {
                    thePhoto: '=photo'
                },
        template: function(){
            if(ENVIRONMENT === 'dev'){
                return '<img id="{{thePhoto.id}}" src="http://placehold.it/150x113" image="http://localhost:8080{{thePhoto.image}}" width="150px;">';    
            }else{
                return '<img id="{{thePhoto.id}}" src="http://placehold.it/150x113" image="{{thePhoto.image}}" width="150px;">';
            }
            
        },
        link: function(scope, element, attr) {

            
            var old_src;
            element.bind('mouseenter', function () {
                old_src         = attr.src;
                attr.$set('src', attr.image);
            });
            element.bind('mouseout', function () {
                attr.$set('image', attr.src);
                attr.$set('src', old_src);
            });

        }

    };

  });