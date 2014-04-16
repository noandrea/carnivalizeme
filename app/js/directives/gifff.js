angular.module("app").directive('gifff', function($document) {
    return {
        restrict: 'EA',
        replace: true,
        scope:  {
                    thePhoto: '=photo'
                },
        template: '<img id="{{thePhoto.id}}" src="http://localhost:8080{{thePhoto.stillimage}}" image="http://localhost:8080{{thePhoto.image}}" width="150px;">',
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