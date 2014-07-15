angular.module("app").directive('googleAdsense', function($timeout, $rootScope) {
    return {
        restrict: 'A',
        //transclude: true,
        replace: true,
        templateUrl: 'googleAds_image.html',
        link: function (scope, element, attrs) {

            $timeout(function(){
                try{
                    (adsbygoogle = window.adsbygoogle || []).push({});
                }catch(ex){ 
                    console.log("ADSENSE ERROR: ",ex);
                }
            }, 1000);
            
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

angular.module("app").directive('googleAdsenseBlock', function($timeout, $rootScope) {
    return {
        restrict: 'A',
        //transclude: true,
        replace: true,
        templateUrl: 'googleAds_block.html',
        link: function (scope, element, attrs) {

            $timeout(function(){
                try{
                    (adsbygoogle = window.adsbygoogle || []).push({});
                }catch(ex){ 
                    console.log("ADSENSE ERROR: ",ex);
                }
            }, 1000);
            
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