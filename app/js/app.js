var myModule = angular.module("app", ["ngResource", "ngRoute", "ngAnimate", "ngSanitize", "colorpicker.module", "pascalprecht.translate", "duScroll", "config", "angulartics", "angulartics.google.analytics"]).run(function($rootScope, $location, trackingService, $translate, $document) {

    $rootScope.adsBlocked = 0;
    /**
     * simply move to another path doing whatever is necessary
     * 
     * @param  {string} path [adding "/" is necessary...eg "/editor"]
     * @return route the app where it should be routed
     */
    $rootScope.goTo = function(path){
        //stop tracking service
        if(trackingService.isActive()){
            trackingService.stop();
        }
        var header = angular.element(document.getElementsByTagName("header")[0]);
        header.removeClass('hide');

        $location.path(path);

        setTimeout( function(ev){
          $document.scrollTop(0, 1500).then(function() {
            //scrolled to top!
          });
        }, 1200 );
        
    };

    /**
     * changes the language of the application
     * 
     * @param  {string} language code eg "it_IT" or "en_EN"
     * @return {null} assigns  $rootScope.lang
     */
    
    $rootScope.lang = 'it_IT';
    
    $rootScope.changeLanguage = function(lang){
        $translate.use(lang);
        $rootScope.lang = lang;
        //close lang menu
        $rootScope.showLang = false;
    };

    /**
     * Redirect to "sorry" after AdBlock is detected
     * @return {null}
     */
    $rootScope.$on('adBlockDetected', function(){
        $rootScope.adsBlocked++;

        console.log('ADS BLOCKED! Total blocked:', $rootScope.adsBlocked);

        if($rootScope.adsBlocked>2){
            $rootScope.adsBlocked = 0;
            $rootScope.goTo('/sorry');
            console.log('ADS BLOCKED! Total blocked:', $rootScope.adsBlocked);
        }
    });

}).config(function($compileProvider, $translateProvider, $rootScopeProvider) {

    var oldWhiteList = $compileProvider.imgSrcSanitizationWhitelist();
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|data):|data:image\//);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|blob|data):|data:image\//);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)

    $translateProvider.useStaticFilesLoader({
        type: 'static-files',
        prefix: '/languages/locale-',
        suffix: '.json'
    });

    
    var language = window.navigator.userLanguage || window.navigator.language;
    //alert(language); //works IE/SAFARI/CHROME/F

    var preferredLang;
    switch(language){
      case 'en-US':
      case 'en-GB':
      case 'en-UK':
      case 'en-EN':
      case 'en-AU':
      case 'en':
        $rootScopeProvider.lang = preferredLang = 'en_EN';
        break;
      case 'es-AR':
      case 'es-BO':
      case 'es-CL':
      case 'es-CO':
      case 'es-CR':
      case 'es-DO':
      case 'es-EC':
      case 'es-SV':
      case 'es-GT':
      case 'es-HN':
      case 'es-MX':
      case 'es-NI':
      case 'es-PA':
      case 'es-PY':
      case 'es-PE':
      case 'es-PR':
      case 'es-ES':
      case 'es-UY':
      case 'es-VE':
      case 'gl-ES':
      case 'es':
        $rootScopeProvider.lang = preferredLang = 'es_ES';
        break;
      case 'ca-ES':
        $rootScopeProvider.lang = preferredLang = 'es_CA';
        break;
      case 'de-AT':
      case 'de-DE':
      case 'de-LI':
      case 'de-LU':
      case 'de-CH':
      case 'de':
        $rootScopeProvider.lang = preferredLang = 'de_DE';
        break;
      case 'fr-BE':
      case 'fr-CA':
      case 'fr-FR':
      case 'fr-LU':
      case 'fr-MC':
      case 'fr-CH':
      case 'fr':
        $rootScopeProvider.lang = preferredLang = 'fr_FR';
        break;
      case 'it-IT':
      case 'it':
        $rootScopeProvider.lang = preferredLang = 'es_ES';
        break;
      case 'uk-UA':
        $rootScopeProvider.lang = preferredLang = 'uk_UA';
        break;
      default:
        $rootScopeProvider.lang = preferredLang = 'en_EN';
        break;
    }

    //set preferred lang
    $translateProvider.preferredLanguage(preferredLang);
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

//nl2br for strings
angular.module("app").filter('nl2br', function($sce){
    return function(msg,is_xhtml) { 
        is_xhtml = is_xhtml || true;
        var breakTag = (is_xhtml) ? '<br />' : '<br>';
        msg = (msg + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
        return $sce.trustAsHtml(msg);
    };
});

angular.module("app").filter('escape', function() {
  return window.escape;
});