angular.module("app").directive('googleAdsense', function($timeout, $rootScope) {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        template: '<div ng-transclude></div>',
        link: function (scope, element, attrs) {

            try{
                (adsbygoogle = window.adsbygoogle || []).push({});
            }catch(ex){ 
                console.log(ex);
            }
            //check if some Ads get disabled by AdBlock or similar...after 15seconds
            /*$timeout(function(){
                if(angular.element(element[0].children[0])[0].children.length < 1){
                    $rootScope.$emit('adBlockDetected');
                }
                //console.log(String(angular.element(element[0].children[0])).length);
            }, 15000);*/
        }
    };
});