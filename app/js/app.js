var myModule = angular.module("app", ["ngResource", "ngRoute", "ngAnimate", "ngSanitize", "colorpicker.module", "pascalprecht.translate", "duScroll", "config"]).run(function($rootScope, $location, trackingService, $translate) {
    
    /**
     * simply move to another path doing whatever is necessary
     * 
     * @param  {string} path [adding "/" is necessary...eg "/editor"]
     * @return route the app where it should be routed
     */
    $rootScope.goTo = function(path){
        if(trackingService.isActive()){
            trackingService.stop();
        }
        $location.path(path);
    };

    /**
     * changes the language of the application
     * 
     * @param  {string} language code eg "it_IT" or "en_EN"
     * @return {null} assigns  $rootScope.lang
     */
    $rootScope.lang = 'en_EN';
    $rootScope.changeLanguage = function(lang){
        $translate.use(lang);
        $rootScope.lang = lang;
    };

}).config(function($compileProvider, $translateProvider) {

    var oldWhiteList = $compileProvider.imgSrcSanitizationWhitelist();
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);

    $translateProvider.useStaticFilesLoader({
        type: 'static-files',
        prefix: '/languages/locale-',
        suffix: '.json'
    });

    $translateProvider.preferredLanguage('en_EN');

});

/**
 * SOME FILTER UTILS
 */

//returns a timestamp into "5 minutes ago" format
angular.module("app").filter('timeago', function() {
  return function(input) {
    var timestamp = moment.unix(input);
    return timestamp.fromNow();
  };
});

//returns a string like "5Mb" or "0.45Kb" depending on it's weight expressed in bytes
angular.module("app").filter('bytes', function() {
    return function(bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)){
            return '-';
        }

        if (typeof precision === 'undefined'){
            precision = 1;
        }
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
    };
});