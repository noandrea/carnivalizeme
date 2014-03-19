angular.module("app").directive('videoHtml5', function() {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'video_html5.html'
  };
});