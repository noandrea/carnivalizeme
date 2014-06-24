angular.module("app").directive('searchMasks', function(maskService) {
    return {
        restrict: 'EA',
        replace: true,
        transclude: true, //inherit parent scope (mainly for ng-show="showSearchMask")
        scope:  {
            tagsInput       : '=',
            updateTags      : '&'
        },
        templateUrl: 'search_tags.html',
        link: function(scope, element, attr) {

            scope.maskAmount = 0;

            element.bind('keyup', function(ev){
                if(scope.searchInput.length > 2){
                    
                    var promiseRes = maskService.getFromTags(scope.searchInput);

                    promiseRes.then(function(response){
                        
                        scope.maskAmount = response.length;

                        if(response.length){
                            maskService.masks = response;
                            //set first mask as "current"
                            maskService.setCurrent(response[0]);
                            //reset masks array
                            scope.$parent.masks = response;
                        }else{
                            scope.$parent.masks = [];
                            //nothing
                        }
                        maskService.masktags        = scope.searchInput;
                        maskService.masktagsAmount  = response.length;
                        scope.updateTags();
                    });
                    
                }else{
                    maskService.masktags        = "";
                    maskService.masktagsAmount  = 0;
                    scope.updateTags();
                }
            });

            scope.hideThis = function(){
                scope.$parent.showSearchMask = 0;
            };
        }

    };

  });