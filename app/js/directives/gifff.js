angular.module("app").directive('gifff', function($document, ENVIRONMENT, lastWatchedImage, $http, $analytics) {
    return {
        restrict: 'EA',
        replace: true,
        scope:  {
                    thePhoto: '=photo'
                },
        template: function(){
            if(ENVIRONMENT === 'dev'){
                return '<img class="preview" id="{{thePhoto.id}}" ng-src="{{thePhoto.thumb}}=s250" width="250" height="250" />';
            }else{
                return '<img class="preview" id="{{thePhoto.id}}" ng-src="{{thePhoto.thumb}}=s250" width="250" height="250" />';
            }
        },
        link: function(scope, element, attr) {

            element.bind('click', function () {
                //load temporarily the loading image
                lastWatchedImage.reset();
                //if(ENVIRONMENT==='dev' && (scope.thePhoto.image.toLowerCase().indexOf('localhost') <= 0 ) ){
                scope.thePhoto.image = 'img/loading500.gif';
                //set the correct image as "loaded"
                scope.thePhoto.loading = 1;
                
                
                $http({cache : true, method: 'GET', url: scope.thePhoto.thumb + '=s640'}).
                success(function(data, status, headers, config) {

                    //set the correct image
                    scope.thePhoto.image = scope.thePhoto.thumb + '=s640';
                    //set the correct image as "loaded"
                    scope.thePhoto.loading = 0;
                    //set correct image as "seen" (so the class changes)
                    scope.thePhoto.seen = 1;

                    lastWatchedImage.set(scope.thePhoto);

                    scope.stica = 'LOADED';

                    //Scroll to the exact position
                    $document.scrollTop(0, 1500).then(function() {
                        //scrolled to top!
                    });
                }).
                error(function(data, status, headers, config) {
                    $analytics.eventTrack('Carnivali Image not correctly loaded', { category: 'Errors' });
                    alert('A problem occurred, please try again');
                });


            });

        }

    };

  });