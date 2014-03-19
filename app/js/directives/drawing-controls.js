angular.module("app").directive('drawingControls', function() {
  return {
    restrict: "E",
    controller: 'drawingBoardCtrl',
    replace: true,
    templateUrl: 'drawing_controls.html'
  };
});