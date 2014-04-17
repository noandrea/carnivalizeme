angular.module("app").directive('gifff', function($document, ENVIRONMENT, snapRemote, $rootScope) {
    return {
        restrict: 'EA',
        replace: true,
        scope:  {
                    thePhoto: '=photo'
                },
        template: function(){
            if(ENVIRONMENT === 'dev'){
                return '<img id="{{thePhoto.id}}" src="http://placekitten.com/350/265" image="http://localhost:8080{{thePhoto.image}}">';
            }else{
                return '<img id="{{thePhoto.id}}" src="http://placekitten.com/350/264" image="{{thePhoto.image}}">';
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

            element.bind('click', function () {
                if(ENVIRONMENT==='dev' && (scope.thePhoto.image.toLowerCase().indexOf('localhost') <= 0 ) ){
                    scope.thePhoto.image = 'http://localhost:8080' + scope.thePhoto.image;
                }
                $rootScope.lastWatchedImage = scope.thePhoto;
                snapRemote.open('right');
            });

        }

    };

  });