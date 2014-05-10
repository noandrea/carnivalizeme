angular.module("app").directive('gifff', function($document, ENVIRONMENT, snapRemote, $rootScope, lastWatchedImage) {
    return {
        restrict: 'EA',
        replace: true,
        scope:  {
                    thePhoto: '=photo'
                },
        template: function(){
            if(ENVIRONMENT === 'dev'){
                return '<img id="{{thePhoto.id}}" ng-src="{{thePhoto.thumb_still}}=s350" image="{{thePhoto.thumb}}=s350">';
            }else{
                return '<img id="{{thePhoto.id}}" ng-src="{{thePhoto.thumb_still}}=s350" image="{{thePhoto.thumb}}=s350">';
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
                //load temporarily the loading image
                lastWatchedImage.reset();
                if(ENVIRONMENT==='dev' && (scope.thePhoto.image.toLowerCase().indexOf('localhost') <= 0 ) ){
                    scope.thePhoto.image = scope.thePhoto.thumb + '=s500';
                }
                //set the correct image
                lastWatchedImage.set(scope.thePhoto);
                snapRemote.open('right');
            });

        }

    };

  });