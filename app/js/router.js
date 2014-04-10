angular.module("app").config(function($routeProvider, $locationProvider) {

  $locationProvider.html5Mode(true);

  $routeProvider.when('/now', {
    templateUrl: 'main.html',
    controller: 'MainCtrl'
  });

  $routeProvider.when('/editor', {
    templateUrl: 'editor.html',
    controller: 'EditorCtrl'
  });

  $routeProvider.when('/about', {
    templateUrl: 'about.html',
    controller: 'AboutCtrl'
  });

  $routeProvider.when('/terms', {
    templateUrl: 'terms.html',
    controller: 'TermsCtrl'
  });

  $routeProvider.when('/trymask', {
    templateUrl: 'main.html',
    controller: 'MainCtrl'
  });

  $routeProvider.when('/carnival', {
    templateUrl: 'carnival.html',
    controller: 'CarnivalCtrl'
  });

  $routeProvider.otherwise({redirectTo: '/now'});

});
