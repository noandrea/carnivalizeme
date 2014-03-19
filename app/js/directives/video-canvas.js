angular.module("app").directive('videoCanvas', function() {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'video_canvas.html'
  };
});