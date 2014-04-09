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