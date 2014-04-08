angular.module("app").directive('drawingBoard', function() {
  return {
    restrict: "E",
    controller: 'drawingBoardCtrl',
    replace: true,
    templateUrl: 'drawing_board.html',
    link: function(scope, el, attrs){
        //nothing here?
    }
  };
});