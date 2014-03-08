angular.module("app").directive('overlayFace', function() {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'overlayFace.html'
  };
});