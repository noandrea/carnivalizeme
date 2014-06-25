angular.module("app").directive('gifff', function($document, ENVIRONMENT, lastWatchedImage, $http) {
    return {
        restrict: 'EA',
        replace: true,
        scope:  {
                    thePhoto: '=photo'
                },
        template: function(){
            if(ENVIRONMENT === 'dev'){
                return '<img id="{{thePhoto.id}}" ng-src="{{thePhoto.thumb}}=s250"/>';
            }else{
                return '<img id="{{thePhoto.id}}" ng-src="{{thePhoto.thumb}}=s250"/>';
            }
        },
        link: function(scope, element, attr) {

            element.bind('click', function () {
                //load temporarily the loading image
                lastWatchedImage.reset();
                //if(ENVIRONMENT==='dev' && (scope.thePhoto.image.toLowerCase().indexOf('localhost') <= 0 ) ){
                 
                scope.thePhoto.image = 'img/loading500.gif';

                
                $http({method: 'GET', url: scope.thePhoto.thumb + '=s450'}).
                success(function(data, status, headers, config) {

                    //set the correct image
                    scope.thePhoto.image = data;
                    lastWatchedImage.set(scope.thePhoto);

                    //Scroll to the exact position
                    $document.scrollTop(0, 1500).then(function() {
                        //scrolled to top!
                    });
                }).
                error(function(data, status, headers, config) {
                    alert('A problem occurred, please try again');
                });


            });

        }

    };

  });