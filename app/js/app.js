var myModule = angular.module("app", ["ngResource", "ngRoute", "ngAnimate", "ngSanitize", "colorpicker.module", "pascalprecht.translate", "duScroll", "config"]).run(function($rootScope) {
    
    /**
     * General response parser for API calls.
     * Returns response data only if the request was succesfull (200) otherwise will return false and 
     */

    $rootScope.parseAPIResponse = function(response)
    {
        var the_return = response;
        return the_return;
    };

}).config(function($compileProvider, $translateProvider, $httpProvider) {

    var oldWhiteList = $compileProvider.imgSrcSanitizationWhitelist();
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);

    $translateProvider.useStaticFilesLoader({
        type: 'static-files',
        prefix: '/languages/locale-',
        suffix: '.json'
    });

    $translateProvider.preferredLanguage('en_EN');


    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

});



