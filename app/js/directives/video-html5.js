angular.module("app").directive('videoHtml5', function() {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'videoHtml5.html'
  };
});