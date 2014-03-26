var myModule = angular.module("app", ["ngResource", "ngRoute", "ngAnimate", "ngSanitize", "colorpicker.module", "pascalprecht.translate", "duScroll"]).run(function($rootScope) {
    
    /**
     * General response parser for API calls.
     * Returns response data only if the request was succesfull (200) otherwise will return false and 
     */

    $rootScope.parseAPIResponse = function(response)
    {
        var the_return;
        switch(response.status.code){
            case 200:
                // ok - return data
                the_return = response.response;
            break;
            case 401:                
                if(response.response){
                    alert(response.response, "&#128274;", 'error');
                } else {
                    alert("For Security reasons <strong>your session has expired.</strong><br>You are now Logged out.", "&#128274;");
                    $rootScope.logout();
                }               
                the_return = false;
            break;
            case 404:
                // not authorized... redirect to login page
                alert("<strong>You might have found a bug in our system.</strong><br>Please contact ShareDesk Admin to fix this issue.", "&#128165;", "error", true);
                the_return = false;
            break;       
            case 500:
                // not authorized... redirect to login page
                alert("<strong>Ouch!</strong><br>" + response.response.userMessage, "&#128165;", "error", true);
                console.warn('Error ' + response.status.code + ' ' + response.status.message + ' - ' + response.response.error);
                the_return = false;
            break;                                                     
        }
        return the_return;
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



