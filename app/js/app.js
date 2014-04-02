var myModule = angular.module("app", ["ngResource", "ngRoute", "ngAnimate", "ngSanitize", "colorpicker.module", "pascalprecht.translate", "duScroll", "config"]).run(function($rootScope) {
    
    /**
     *
     * DO GENERAL STUFF HERE
     * 
     */

}).config(function($compileProvider, $translateProvider) {

    var oldWhiteList = $compileProvider.imgSrcSanitizationWhitelist();
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);

    $translateProvider.useStaticFilesLoader({
        type: 'static-files',
        prefix: '/languages/locale-',
        suffix: '.json'
    });

    $translateProvider.preferredLanguage('it_IT');

});



