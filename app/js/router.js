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

  $routeProvider.when('/trymask', {
    templateUrl: 'main.html',
    controller: 'MainCtrl'
  });

  $routeProvider.otherwise({redirectTo: '/now'});

});
