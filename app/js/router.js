angular.module("app").config(function($routeProvider, $locationProvider) {

  $locationProvider.html5Mode(true);

  $routeProvider.when('/', {
    templateUrl: 'main.html',
    controller: 'MainCtrl'
  });

  $routeProvider.when('/editor', {
    templateUrl: 'editor.html',
    controller: 'EditorCtrl'
  });

  $routeProvider.otherwise({redirectTo: '/'});

});
